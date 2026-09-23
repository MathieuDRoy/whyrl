import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';

// Instagram's Graph API only accepts a publicly fetchable image_url - it
// won't take a direct binary upload for a feed photo - so a generated card
// image needs to be reachable at a URL before we ask Meta to fetch it. These
// are single-use-ish and short-lived (Meta fetches within seconds), so an
// in-memory store is enough; no need to burden Redis with image blobs, and
// this only ever runs on one instance.
const IMAGE_TTL_MS = 10 * 60 * 1000;
const images = new Map<string, { buffer: Buffer; expiresAt: number }>();

function pruneExpired() {
  const now = Date.now();
  for (const [token, entry] of images) {
    if (entry.expiresAt < now) images.delete(token);
  }
}

export function registerCardImage(buffer: Buffer): string {
  pruneExpired();
  const token = randomUUID();
  images.set(token, { buffer, expiresAt: Date.now() + IMAGE_TTL_MS });
  return token;
}

const router = Router();

router.get('/:token.png', (req: Request, res: Response) => {
  const entry = images.get(req.params.token);
  if (!entry || entry.expiresAt < Date.now()) {
    res.status(404).end();
    return;
  }
  res.set('Content-Type', 'image/png');
  res.send(entry.buffer);
});

export default router;
