import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env'), override: true });
import express from 'express';
import cors from 'cors';
import trendsRouter from './routes/trends';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/trends', trendsRouter);

app.listen(PORT, () => {
  console.log(`Whyrl backend listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set — Claude calls will fail');
  }
});
