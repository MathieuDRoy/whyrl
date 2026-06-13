import { Router, Request, Response } from 'express';
import { addPushToken, removePushToken } from '../services/pushTokens';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  addPushToken(token);
  res.json({ ok: true });
});

router.post('/unregister', (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  removePushToken(token);
  res.json({ ok: true });
});

export default router;
