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

// Refresh the default view on a schedule (matching the cache TTL) and notify
// devices once fresh cards are ready — keeps the cache warm and re-engages testers.
async function refreshAndNotify(force: boolean) {
  try {
    const { cached } = await getTrends('US', ALL_CATEGORIES, force);
    if (!force && cached) return;

    await sendPushNotifications(
      getPushTokens(),
      'Whyrl',
      'Fresh trends just dropped — check out what’s new.',
    );
  } catch (err: any) {
    console.error('[refresh] failed:', err?.message ?? err);
  }
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Whyrl backend listening on http://0.0.0.0:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set — Claude calls will fail');
  }

  // Pre-warm the cache for the default view so the first user doesn't hit a cold miss.
  refreshAndNotify(false);

  // Force a refresh + notification once per cache TTL window.
  setInterval(() => refreshAndNotify(true), CACHE_TTL_MINUTES * 60 * 1000);
});
