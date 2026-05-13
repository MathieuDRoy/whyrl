import { Category, RawPost } from '../types';

const CATEGORY_SUBREDDITS: Record<Category, string[]> = {
  politics: ['politics', 'worldnews', 'usnews'],
  finance: ['investing', 'wallstreetbets', 'economics', 'finance'],
  sport: ['sports', 'soccer', 'nba', 'nfl'],
  entertainment: ['movies', 'television', 'music', 'entertainment'],
  tech: ['technology', 'programming', 'MachineLearning', 'artificial'],
  world: ['worldnews', 'geopolitics', 'europe', 'asia'],
};

const REGION_SUBREDDITS: Record<string, string[]> = {
  US: ['unitedstates', 'USNews'],
  UK: ['unitedkingdom', 'britishpolitics'],
  EU: ['europe', 'europeanunion'],
  AU: ['australia'],
  CA: ['canada'],
  GLOBAL: [],
};

async function fetchSubreddit(subreddit: string, limit = 15): Promise<RawPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'Whyrl/1.0 (trend aggregator)',
          Accept: 'application/json',
        },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    const posts: RawPost[] = (data?.data?.children ?? [])
      .filter((c: any) => !c.data.stickied && c.data.score > 50)
      .map((c: any) => ({
        title: c.data.title,
        body: c.data.selftext || c.data.url || '',
        score: c.data.score,
        comments: c.data.num_comments,
        subreddit: c.data.subreddit,
        source: 'reddit' as const,
      }));
    return posts;
  } catch {
    return [];
  }
}

export async function fetchRedditPosts(
  categories: Category[],
  region: string,
): Promise<RawPost[]> {
  const subreddits = new Set<string>();

  for (const cat of categories) {
    CATEGORY_SUBREDDITS[cat].forEach((s) => subreddits.add(s));
  }
  (REGION_SUBREDDITS[region] ?? []).forEach((s) => subreddits.add(s));

  const results = await Promise.all([...subreddits].map((s) => fetchSubreddit(s, 10)));
  const all = results.flat();

  // Deduplicate by title similarity (exact match only for simplicity)
  const seen = new Set<string>();
  return all.filter((p) => {
    const key = p.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
