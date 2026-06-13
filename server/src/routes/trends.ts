import { Router, Request, Response } from 'express';
import { trendsCache } from '../cache';
import { analyzeTrends } from '../services/claude';
import { fetchRedditPosts } from '../services/reddit';
import { fetchNewsApiPosts } from '../services/newsapi';
import { Category } from '../types';

const router = Router();

export const ALL_CATEGORIES: Category[] = ['politics', 'finance', 'sport', 'entertainment', 'tech', 'world'];

export async function getTrends(region: string, categories: Category[]) {
  const cacheKey = `${region}:${[...categories].sort().join(',')}`;
  const cached = trendsCache.get(cacheKey);
  if (cached) {
    console.log(`[cache] HIT for ${cacheKey}`);
    return { cards: cached, cached: true };
  }

  console.log(`[cache] MISS for ${cacheKey} — fetching fresh data`);
  const [redditPosts, newsApiPosts] = await Promise.all([
    fetchRedditPosts(categories, region),
    fetchNewsApiPosts(categories, region),
  ]);

  const allPosts = [...newsApiPosts, ...redditPosts];
  if (allPosts.length === 0) {
    throw Object.assign(new Error('No posts fetched from sources'), { status: 503 });
  }

  console.log(`[sources] ${redditPosts.length} reddit + ${newsApiPosts.length} newsapi posts`);
  const cards = await analyzeTrends(allPosts, region, categories);
  trendsCache.set(cacheKey, cards);

  return { cards, cached: false };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const region = (req.query.region as string) || 'GLOBAL';
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
