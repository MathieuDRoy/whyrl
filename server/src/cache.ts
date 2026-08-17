import Redis from 'ioredis';
import { TrendCard } from './types';

export interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, data: T): Promise<void>;
}

// In-memory fallback, used when REDIS_URL isn't configured (e.g. local dev).
// Data does not survive a process restart.
class MemoryTTLCache<T> implements Cache<T> {
  private store = new Map<string, { data: T; expiresAt: number }>();

  constructor(private ttlMs: number) {}

  async get(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  async set(key: string, data: T): Promise<void> {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }
}

// Redis-backed cache, shared across restarts and across server instances.
// A Redis error degrades to "treat as cache miss" rather than failing the
// request — losing the cache is fine, losing the API isn't.
class RedisTTLCache<T> implements Cache<T> {
  constructor(
    private redis: Redis,
    private prefix: string,
    private ttlSeconds: number,
  ) {}

  async get(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(`${this.prefix}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err: any) {
      console.warn(`[cache] Redis GET failed for ${key}:`, err?.message);
      return null;
    }
  }

  async set(key: string, data: T): Promise<void> {
    try {
      await this.redis.set(`${this.prefix}:${key}`, JSON.stringify(data), 'EX', this.ttlSeconds);
    } catch (err: any) {
      console.warn(`[cache] Redis SET failed for ${key}:`, err?.message);
    }
  }
}

const redisUrl = process.env.REDIS_URL;
// Exported so other modules (e.g. pushTokens) can share this connection for
// data that doesn't fit the TTL cache shape, instead of opening their own.
export const redisClient = redisUrl ? new Redis(redisUrl, { maxRetriesPerRequest: 2 }) : null;

if (redisClient) {
  redisClient.on('error', (err) => console.warn('[cache] Redis connection error:', err.message));
  console.log('[cache] REDIS_URL set — using Redis-backed cache');
} else {
  console.log('[cache] REDIS_URL not set — using in-memory cache (cleared on every restart)');
}

// Shared factory so any module can get a cache that's Redis-backed (and
// survives restarts) when REDIS_URL is configured, falling back to
// in-memory otherwise - same tradeoffs as trendsCache below.
export function createCache<T>(prefix: string, ttlSeconds: number): Cache<T> {
  return redisClient
    ? new RedisTTLCache<T>(redisClient, prefix, ttlSeconds)
    : new MemoryTTLCache<T>(ttlSeconds * 1000);
}

export const CACHE_TTL_MINUTES = 240;
export const trendsCache = createCache<TrendCard[]>('trends', CACHE_TTL_MINUTES * 60);

// Short-lived cache of recent source-fetch failures, so a rate-limited or
// down upstream doesn't get hammered again on every request that comes in
// before the next scheduled retry.
export const FAILURE_TTL_MINUTES = 5;
export const trendsFailureCache = createCache<true>('trends-failure', FAILURE_TTL_MINUTES * 60);
