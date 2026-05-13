import { Category, RawPost } from '../types';

const API_KEY = process.env.NEWS_API_KEY;

// NewsAPI only has: business, entertainment, general, health, science, sports, technology
const CATEGORY_PARAMS: Record<Category, { category?: string; q?: string }> = {
  politics:      { category: 'general',       q: 'politics government' },
  finance:       { category: 'business' },
  sport:         { category: 'sports' },
  entertainment: { category: 'entertainment' },
  tech:          { category: 'technology' },
  world:         { q: 'world news international' },
};

const REGION_COUNTRY: Record<string, string> = {
  US: 'us', GB: 'gb', CA: 'ca', AU: 'au',
  DE: 'de', FR: 'fr', JP: 'jp', BR: 'br', IN: 'in',
};

async function fetchCategory(cat: Category, region: string): Promise<RawPost[]> {
  if (!API_KEY) return [];

  const { category, q } = CATEGORY_PARAMS[cat];
  const params = new URLSearchParams({ apiKey: API_KEY, language: 'en', pageSize: '20' });

  if (category) params.set('category', category);
  if (q)        params.set('q', q);

  const country = REGION_COUNTRY[region];
  // country + q together is not supported by NewsAPI — use country only for category-based queries
  if (country && category && !q) params.set('country', country);

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[newsapi:${cat}] ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
      return [];
    }
    const data = (await res.json()) as any;

    if (data.status !== 'ok') {
      console.warn(`[newsapi:${cat}] API error: ${data.message}`);
      return [];
    }

    const articles = (data.articles ?? []).filter(
      (a: any) => a.title && a.title !== '[Removed]' && a.source?.name !== '[Removed]',
    );

    console.log(`[newsapi:${cat}] ${articles.length} articles`);

    return articles.map((a: any) => ({
      title: a.title,
      body: [a.description, a.content].filter(Boolean).join(' ').slice(0, 500) || a.title,
      score: 0,
      comments: 0,
      source: 'newsapi' as const,
    }));
  } catch (err: any) {
    console.warn(`[newsapi:${cat}] fetch error:`, err?.message);
    return [];
  }
}

export async function fetchNewsApiPosts(
  categories: Category[],
  region: string,
): Promise<RawPost[]> {
  if (!API_KEY) {
    console.warn('[newsapi] NEWS_API_KEY is not set — skipping');
    return [];
  }

  const results = await Promise.all(categories.map((cat) => fetchCategory(cat, region)));
  const all = results.flat();

  // Deduplicate by title
  const seen = new Set<string>();
  return all.filter((p) => {
    const key = p.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
