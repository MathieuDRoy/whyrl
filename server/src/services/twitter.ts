import { Category, RawPost } from '../types';

const BEARER = process.env.TWITTER_BEARER_TOKEN;

const CATEGORY_QUERIES: Record<Category, string> = {
  politics: '(politics OR congress OR senate OR president) lang:en -is:retweet',
  finance: '(stock market OR federal reserve OR crypto OR inflation) lang:en -is:retweet',
  sport: '(sports OR nba OR nfl OR soccer OR champions league) lang:en -is:retweet',
  entertainment: '(movie OR music OR celebrity OR entertainment) lang:en -is:retweet',
  tech: '(AI OR artificial intelligence OR tech OR startup) lang:en -is:retweet',
  world: '(breaking OR world news OR international) lang:en -is:retweet',
};

export async function fetchTwitterPosts(
  categories: Category[],
  _region: string,
): Promise<RawPost[]> {
  if (!BEARER) return [];

  const query = categories.map((c) => `(${CATEGORY_QUERIES[c]})`).join(' OR ');
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=public_metrics,created_at`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${BEARER}` },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as any;

    return (data.data ?? []).map((t: any) => ({
      title: t.text.slice(0, 120),
      body: t.text,
      score: t.public_metrics?.like_count ?? 0,
      comments: t.public_metrics?.reply_count ?? 0,
      source: 'twitter' as const,
    }));
  } catch {
    return [];
  }
}
