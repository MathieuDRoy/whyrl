import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client — never expose this key to the app. Auth is done
// per-request below by validating the caller's own access token first.
const admin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

router.delete('/', async (req: Request, res: Response) => {
  if (!admin) {
    res.status(500).json({ error: 'Account deletion is not configured on this server' });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  const userId = userData.user.id;

  // Best-effort cleanup of storage objects — trends/profiles/streaks rows
  // cascade via FK on delete, but storage objects don't, so remove them first.
  const { data: files } = await admin.storage.from('trend-cards').list(userId);
  if (files?.length) {
    await admin.storage.from('trend-cards').remove(files.map((f) => `${userId}/${f.name}`));
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[/api/account] delete failed:', deleteError.message);
    res.status(500).json({ error: 'Failed to delete account' });
    return;
  }

  res.json({ ok: true });
});

export default router;
