import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env'), override: true });
import express from 'express';
import cors from 'cors';
import trendsRouter, { ALL_CATEGORIES, getTrends } from './routes/trends';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/trends', trendsRouter);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Whyrl backend listening on http://0.0.0.0:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set — Claude calls will fail');
  }

  // Pre-warm the cache for the default view so the first user doesn't hit a cold miss.
  getTrends('US', ALL_CATEGORIES).catch((err) =>
    console.error('[prewarm] failed:', err?.message ?? err),
  );
});
