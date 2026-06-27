import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env'), override: true });
import express from 'express';
import cors from 'cors';
import trendsRouter, { ALL_CATEGORIES, getTrends } from './routes/trends';
import pushRouter from './routes/push';
import { getPushTokens } from './services/pushTokens';
import { sendPushNotifications } from './services/expoPush';
import { CACHE_TTL_MINUTES } from './cache';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/trends', trendsRouter);
app.use('/api/push', pushRouter);

const ALL_REGIONS = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'IN'];

// Refresh US and notify devices, then re-warm all other regions.
async function refreshAndNotify(force: boolean) {
  try {
    const { cached } = await getTrends('US', ALL_CATEGORIES, force);
    if (!force && cached) return;

    await sendPushNotifications(
      getPushTokens(),
      'Whyrl',
      'Fresh trends just dropped \u2014 check out what\'s new.',
    );
  } catch (err: any) {
    console.error('[refresh] failed:', err?.message ?? err);
  }
}

// Warm every region sequentially so no region ever gets a cold-miss timeout.
async function warmAllRegions() {
  for (const region of ALL_REGIONS.slice(1)) { // US already handled by refreshAndNotify
    try {
      await getTrends(region, ALL_CATEGORIES);
      console.log(`[warmup] ${region} done`);
    } catch (err: any) {
      console.error(`[warmup] ${region} failed:`, err?.message ?? err);
    }
  }
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Whyrl backend listening on http://0.0.0.0:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set \u2014 Claude calls will fail');
  }

  // Warm US first, then all other regions in the background.
  refreshAndNotify(false).then(() => warmAllRegions());

  // Force a full refresh once per cache TTL window.
  setInterval(async () => {
    await refreshAndNotify(true);
    warmAllRegions();
  }, CACHE_TTL_MINUTES * 60 * 1000);
});
