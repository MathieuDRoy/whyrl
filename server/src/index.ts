import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env'), override: true });
import express from 'express';
import cors from 'cors';
import trendsRouter, { ALL_CATEGORIES, getTrends } from './routes/trends';
import pushRouter from './routes/push';
import accountRouter from './routes/account';
import cardImageRouter, { registerCardImage } from './routes/cardImage';
import { getPushTokens } from './services/pushTokens';
import { sendPushNotifications } from './services/expoPush';
import { postCardTweet } from './services/twitter';
import { renderCardImage } from './services/cardImage';
import { postCardToInstagram } from './services/instagram';
import { CACHE_TTL_MINUTES, createCache } from './cache';
import { TrendCard } from './types';

const app = express();
const PORT = process.env.PORT ?? 3001;
// Used to build a publicly fetchable URL for a generated card image, since
// Instagram's Graph API fetches images by URL rather than taking an upload.
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? 'https://whyrl-production.up.railway.app';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/trends', trendsRouter);
app.use('/api/push', pushRouter);
app.use('/api/account', accountRouter);
app.use('/api/card-image', cardImageRouter);

const ALL_REGIONS = ['NA', 'EU'];

// Refresh NA, then re-warm all other regions. Notifications are handled
// separately (see maybeSendDailyNotification) so refresh cadence - on
// every server start and every cache TTL window - is unaffected by when
// notifications are allowed to go out.
async function refreshTrends(force: boolean) {
  try {
    await getTrends('NA', ALL_CATEGORIES, force);
  } catch (err: any) {
    console.error('[refresh] failed:', err?.message ?? err);
  }
}

// Warm every region sequentially so no region ever gets a cold-miss timeout.
async function warmAllRegions() {
  for (const region of ALL_REGIONS.slice(1)) {
    try {
      await getTrends(region, ALL_CATEGORIES);
      console.log('[warmup] ' + region + ' done');
    } catch (err: any) {
      console.error('[warmup] ' + region + ' failed:', err?.message ?? err);
    }
  }
}

const NOTIFICATION_TZ = 'America/New_York';
const NOTIFICATION_WINDOW_START_MIN = 14 * 60; // 2:00 PM
const NOTIFICATION_WINDOW_END_MIN = 14 * 60 + 30; // 2:30 PM
const NOTIFICATION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

function minutesSinceMidnightET(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NOTIFICATION_TZ,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

function currentDateET(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NOTIFICATION_TZ }).format(new Date());
}

// Sends at most one push notification per day, only while it's between
// 2:00 PM and 2:30 PM Eastern - independent of the trends refresh/warmup
// cadence above, so it reliably lands in the window regardless of when a
// refresh happened to last run. Stored in the same Redis-backed cache used
// elsewhere so a restart mid-window on an already-notified day doesn't
// double-send.
const lastNotifiedCache = createCache<string>('last-notified-date-et', 60 * 60 * 26);

async function maybeSendDailyNotification() {
  const mins = minutesSinceMidnightET();
  if (mins < NOTIFICATION_WINDOW_START_MIN || mins >= NOTIFICATION_WINDOW_END_MIN) return;

  const today = currentDateET();
  if ((await lastNotifiedCache.get('date')) === today) return;
  await lastNotifiedCache.set('date', today);

  try {
    await sendPushNotifications(
      await getPushTokens(),
      'Whyrl',
      "Fresh trends just dropped - check out what's new.",
    );
    console.log('[notify] sent daily notification for', today);
  } catch (err: any) {
    console.error('[notify] failed:', err?.message ?? err);
  }
}

// Posts one NA card to X and Instagram every SOCIAL_POST_INTERVAL_MS, cycling
// through categories (politics, finance, ...) round-robin so we don't just
// repeatedly post whichever category tends to trend highest. Within the
// chosen category, the most RECENT card (by the story's own published
// timestamp) is posted, not the one with the highest trendingScore or
// whatever order it happens to appear in the cache - the goal is fresh news,
// not stale-but-viral news. The cursor persists in the same cache backend as
// everything else here, so a restart resumes the rotation instead of
// starting over from politics. Both platforms post the same chosen card so
// the two feeds stay in sync rather than drifting to different stories.
//
// Cards don't carry a stable id across refreshes (Claude regenerates it per
// batch), so "already posted" is tracked by title - the actual identity of a
// story - rather than id, which could collide with an unrelated card from a
// different refresh.
const SOCIAL_POST_INTERVAL_MS = 2 * 60 * 60 * 1000;
// Keeping the original "twitter-*" cache key prefixes (not renamed to
// "social-*") even though this now also drives Instagram - renaming would
// orphan the existing Redis-persisted posted-titles/cursor state and risk
// immediately re-posting whatever was just posted before this deployed.
const postedCardsCache = createCache<true>('twitter-posted', 60 * 60 * 48);
const categoryCursorCache = createCache<number>('twitter-category-cursor', 60 * 60 * 24 * 30);

function postedKey(card: TrendCard): string {
  return card.title.trim().toLowerCase();
}

// Starts at the cursor's category and walks forward through the rotation
// until it finds one with something unposted, so a starved category
// (nothing new since last cycle) doesn't stall the whole job.
async function pickNextCard(cards: TrendCard[]): Promise<{ card: TrendCard; category: string; categoryIndex: number } | null> {
  const cursor = (await categoryCursorCache.get('cursor')) ?? 0;

  for (let i = 0; i < ALL_CATEGORIES.length; i++) {
    const categoryIndex = (cursor + i) % ALL_CATEGORIES.length;
    const category = ALL_CATEGORIES[categoryIndex];

    const unposted: TrendCard[] = [];
    for (const card of cards.filter((c) => c.category === category)) {
      if (!(await postedCardsCache.get(postedKey(card)))) unposted.push(card);
    }
    if (unposted.length === 0) continue;

    const newest = unposted.reduce((best, c) =>
      new Date(c.timestamp).getTime() > new Date(best.timestamp).getTime() ? c : best,
    );
    return { card: newest, category, categoryIndex };
  }
  return null;
}

async function postNextSocialUpdate() {
  try {
    const { cards } = await getTrends('NA', ALL_CATEGORIES);
    const picked = await pickNextCard(cards);
    if (!picked) {
      console.log('[social] no unposted cards in any category this cycle — skipping');
      return;
    }
    const { card, category, categoryIndex } = picked;

    await postCardTweet(card);
    console.log(`[twitter] posted (${category}):`, card.title);

    try {
      const image = await renderCardImage(card);
      const token = registerCardImage(image);
      const imageUrl = `${PUBLIC_BASE_URL}/api/card-image/${token}.png`;
      await postCardToInstagram(imageUrl, `${card.summary}\n\n${card.hashtags.slice(0, 4).map((h) => `#${h}`).join(' ')}`);
      console.log(`[instagram] posted (${category}):`, card.title);
    } catch (err: any) {
      console.error('[instagram] failed to post:', err?.message ?? err);
    }

    await postedCardsCache.set(postedKey(card), true);
    await categoryCursorCache.set('cursor', (categoryIndex + 1) % ALL_CATEGORIES.length);
  } catch (err: any) {
    console.error('[social] failed to post:', err?.message ?? err);
  }
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('Whyrl backend listening on http://0.0.0.0:' + PORT);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set - Claude calls will fail');
  }

  // Warm NA first, then all other regions in the background.
  // postNextSocialUpdate waits for this instead of running immediately
  // alongside it - both key off the same NA cache entry, and firing at the
  // same time on a cold cache would trigger two concurrent NewsAPI+Claude
  // fetches instead of one.
  refreshTrends(false).then(() => {
    warmAllRegions();
    postNextSocialUpdate();
  });

  // Force a full refresh once per cache TTL window.
  setInterval(async () => {
    await refreshTrends(true);
    warmAllRegions();
  }, CACHE_TTL_MINUTES * 60 * 1000);

  // Check independently, and more frequently, whether it's time to send
  // today's notification.
  maybeSendDailyNotification();
  setInterval(maybeSendDailyNotification, NOTIFICATION_CHECK_INTERVAL_MS);

  setInterval(postNextSocialUpdate, SOCIAL_POST_INTERVAL_MS);
});
