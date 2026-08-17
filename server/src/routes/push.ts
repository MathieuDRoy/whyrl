import { Router, Request, Response } from 'express';
import { addPushToken, removePushToken } from '../services/pushTokens';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  await addPushToken(token);
  res.json({ ok: true });
});

router.post('/unregister', async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  await removePushToken(token);
  res.json({ ok: true });
});

export default router;
