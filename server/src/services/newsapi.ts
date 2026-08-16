import { Category, RawPost } from '../types';

const API_KEY = process.env.NEWS_API_KEY;

// NewsAPI's /top-headlines only accepts single ISO country codes, with no
// continent-level option — so regions always go through /everything with a
// keyword query instead.
const REGION_QUERY: Record<string, string> = {
  NA: 'North America news',
  EU: 'Europe news',
};

function parseArticles(articles: any[]): RawPost[] {
  const seen = new Set<string>();
  return articles
    .filter((a: any) => a.title && a.title !== '[Removed]' && a.source?.name !== '[Removed]')
    .map((a: any) => ({
      title: a.title,
      body: [a.description, a.content].filter(Boolean).join(' ').slice(0, 500) || a.title,
      source: 'newsapi' as const,
      publishedAt: a.publishedAt,
    }))
    .filter((p: RawPost) => {
      const key = p.title.toLowerCase().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function fetchNewsApiPosts(
  _categories: Category[],
  region: string,
): Promise<RawPost[]> {
  if (!API_KEY) {
    console.warn('[newsapi] NEWS_API_KEY is not set — skipping');
    return [];
  }

  const query = REGION_QUERY[region] ?? 'world news';
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '100',
    });
    const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[newsapi] everything ${res.status}: ${body.slice(0, 200)}`);
      return [];
    }
    const data = (await res.json()) as any;
    if (data.status !== 'ok') {
      console.warn(`[newsapi] everything API error: ${data.message}`);
      return [];
    }
    const articles = parseArticles(data.articles ?? []);
    console.log(`[newsapi] ${articles.length} articles (everything/"${query}")`);
    return articles;
  } catch (err: any) {
    console.warn('[newsapi] everything fetch error:', err?.message);
    return [];
  }
}
