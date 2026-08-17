import { redisClient } from '../cache';

// In-memory fallback, used when REDIS_URL isn't configured (e.g. local dev).
// Data does not survive a process restart.
const memoryTokens = new Set<string>();

const REDIS_KEY = 'push-tokens';

export async function addPushToken(token: string): Promise<void> {
  if (!redisClient) {
    memoryTokens.add(token);
    return;
  }
  try {
    await redisClient.sadd(REDIS_KEY, token);
  } catch (err: any) {
    console.warn('[pushTokens] Redis SADD failed:', err?.message);
  }
}

export async function removePushToken(token: string): Promise<void> {
  if (!redisClient) {
    memoryTokens.delete(token);
    return;
  }
  try {
    await redisClient.srem(REDIS_KEY, token);
  } catch (err: any) {
    console.warn('[pushTokens] Redis SREM failed:', err?.message);
  }
}

export async function getPushTokens(): Promise<string[]> {
  if (!redisClient) {
    return [...memoryTokens];
  }
  try {
    return await redisClient.smembers(REDIS_KEY);
  } catch (err: any) {
    console.warn('[pushTokens] Redis SMEMBERS failed:', err?.message);
    return [];
  }
}
