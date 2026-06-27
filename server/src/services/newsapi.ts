import { Category, RawPost } from '../types';

const API_KEY = process.env.NEWS_API_KEY;

const REGION_COUNTRY: Record<string, string> = {
  US: 'us', GB: 'gb', CA: 'ca', AU: 'au',
  DE: 'de', FR: 'fr', JP: 'jp', BR: 'br', IN: 'in',
};

const REGION_QUERY: Record<string, string> = {
  US: 'United States news',
  GB: 'United Kingdom news',
  CA: 'Canada news',
  AU: 'Australia news',
  DE: 'Germany news',
  FR: 'France news',
  JP: 'Japan news',
  BR: 'Brazil news',
  IN: 'India news',
};

function parseArticles(articles: any[]): RawPost[] {
  const seen = new Set<string>();
  return articles
    .filter((a: any) => a.title && a.title !== '[Removed]' && a.source?.name !== '[Removed]')
    .map((a: any) => ({
      title: a.title,
      body: [a.description, a.content].filter(Boolean).join(' ').slice(0, 500) || a.title,
      score: 0,
      comments: 0,
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

  const country = REGION_COUNTRY[region];

  // Try country-specific top headlines first
  if (country) {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        country,
        language: 'en',
        pageSize: '100',
      });
      const res = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.status === 'ok') {
          const articles = parseArticles(data.articles ?? []);
          if (articles.length > 0) {
            console.log(`[newsapi] ${articles.length} articles (top-headlines/${country})`);
            return articles;
          }
        }
      }
    } catch (err: any) {
      console.warn('[newsapi] top-headlines error:', err?.message);
    }
  }

  // Fall back to /v2/everything with a country keyword search — works on all plan tiers
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
