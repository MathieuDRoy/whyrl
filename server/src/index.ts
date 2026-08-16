import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env'), override: true });
import express from 'express';
import cors from 'cors';
import trendsRouter, { ALL_CATEGORIES, getTrends } from './routes/trends';
import pushRouter from './routes/push';
import accountRouter from './routes/account';
import { getPushTokens } from './services/pushTokens';
import { sendPushNotifications } from './services/expoPush';
import { CACHE_TTL_MINUTES, createCache } from './cache';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/trends', trendsRouter);
app.use('/api/push', pushRouter);
app.use('/api/account', accountRouter);

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
      getPushTokens(),
      'Whyrl',
      "Fresh trends just dropped - check out what's new.",
    );
    console.log('[notify] sent daily notification for', today);
  } catch (err: any) {
    console.error('[notify] failed:', err?.message ?? err);
  }
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('Whyrl backend listening on http://0.0.0.0:' + PORT);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set - Claude calls will fail');
  }

  // Warm NA first, then all other regions in the background.
  refreshTrends(false).then(() => warmAllRegions());

  // Force a full refresh once per cache TTL window.
  setInterval(async () => {
    await refreshTrends(true);
    warmAllRegions();
  }, CACHE_TTL_MINUTES * 60 * 1000);

  // Check independently, and more frequently, whether it's time to send
  // today's notification.
  maybeSendDailyNotification();
  setInterval(maybeSendDailyNotification, NOTIFICATION_CHECK_INTERVAL_MS);
});
