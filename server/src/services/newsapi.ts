import { Category, RawPost } from '../types';

const API_KEY = process.env.NEWS_API_KEY;

const REGION_COUNTRY: Record<string, string> = {
  US: 'us', GB: 'gb', CA: 'ca', AU: 'au',
  DE: 'de', FR: 'fr', JP: 'jp', BR: 'br', IN: 'in',
};

// Claude assigns each article to a category afterwards, so a single broad
// "top headlines" request covers all requested categories — this keeps us
// to 1 NewsAPI call per cache miss instead of 1 per category.
export async function fetchNewsApiPosts(
  _categories: Category[],
  region: string,
): Promise<RawPost[]> {
  if (!API_KEY) {
    console.warn('[newsapi] NEWS_API_KEY is not set — skipping');
    return [];
  }

  const params = new URLSearchParams({ apiKey: API_KEY, language: 'en', pageSize: '100' });
  const country = REGION_COUNTRY[region];
  if (country) {
    params.set('country', country);
  } else {
    params.set('category', 'general');
  }

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[newsapi] ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
      return [];
    }
    const data = (await res.json()) as any;

    if (data.status !== 'ok') {
      console.warn(`[newsapi] API error: ${data.message}`);
      return [];
    }

    const articles = (data.articles ?? []).filter(
      (a: any) => a.title && a.title !== '[Removed]' && a.source?.name !== '[Removed]',
    );

    console.log(`[newsapi] ${articles.length} articles`);

    const seen = new Set<string>();
    return articles
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
  } catch (err: any) {
    console.warn('[newsapi] fetch error:', err?.message);
    return [];
  }
}
