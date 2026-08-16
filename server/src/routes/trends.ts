import { Router, Request, Response } from 'express';
import { trendsCache, trendsFailureCache } from '../cache';
import { analyzeTrends } from '../services/claude';
import { fetchNewsApiPosts } from '../services/newsapi';
import { Category } from '../types';

const router = Router();

export const ALL_CATEGORIES: Category[] = ['politics', 'finance', 'sport', 'entertainment', 'tech', 'world'];

// Profiles created before the region picker was reduced to NA/EU may still have an
// old per-country value stored (e.g. 'US', 'GB'). Fold those into the current
// buckets so they don't reopen their own separate cache key / NewsAPI quota slot.
const LEGACY_REGION_ALIASES: Record<string, string> = {
  US: 'NA', CA: 'NA',
  GB: 'EU', DE: 'EU', FR: 'EU',
  AU: 'GLOBAL', JP: 'GLOBAL', BR: 'GLOBAL', IN: 'GLOBAL',
};

export function normalizeRegion(region: string): string {
  return LEGACY_REGION_ALIASES[region] ?? region;
}

export async function getTrends(region: string, categories: Category[], force = false) {
  const cacheKey = `${region}:${[...categories].sort().join(',')}`;
  const cached = force ? null : trendsCache.get(cacheKey);
  if (cached) {
    console.log(`[cache] HIT for ${cacheKey}`);
    return { cards: cached, cached: true };
  }

  if (!force && trendsFailureCache.get(cacheKey)) {
    console.log(`[cache] recent failure for ${cacheKey} — skipping fetch`);
    throw Object.assign(new Error('No posts fetched from sources'), { status: 503 });
  }

  console.log(`[cache] MISS for ${cacheKey} — fetching fresh data`);
  const newsApiPosts = await fetchNewsApiPosts(categories, region);

  if (newsApiPosts.length === 0) {
    trendsFailureCache.set(cacheKey, true);
    throw Object.assign(new Error('No posts fetched from sources'), { status: 503 });
  }

  console.log(`[sources] ${newsApiPosts.length} newsapi posts`);
  const cards = await analyzeTrends(newsApiPosts, region, categories);
  trendsCache.set(cacheKey, cards);

  return { cards, cached: false };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const region = normalizeRegion((req.query.region as string) || 'GLOBAL');
    const rawCats = req.query.categories as string | undefined;
    const categories: Category[] = rawCats
      ? (rawCats.split(',').filter((c) => ALL_CATEGORIES.includes(c as Category)) as Category[])
      : ALL_CATEGORIES;

    if (categories.length === 0) {
      res.status(400).json({ error: 'No valid categories specified' });
      return;
    }

    const result = await getTrends(region, categories);
    res.json(result);
  } catch (err: any) {
    console.error('[/api/trends]', err?.message ?? err);
    res.status(err?.status ?? 500).json({ error: err?.status ? err.message : 'Internal server error' });
  }
});

export default router;
