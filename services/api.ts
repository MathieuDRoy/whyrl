import { TrendCard } from '../constants/mockData';

// Point this at your running backend.
// On a physical device, replace localhost with your machine's local IP.
const BASE_URL = 'http://192.168.4.113:3001';

export async function fetchTrends(
  region: string,
  categories: string[],
): Promise<TrendCard[]> {
  const params = new URLSearchParams({
    region,
    categories: categories.join(','),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000); // 90s for Claude
  try {
    const res = await fetch(`${BASE_URL}/api/trends?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Backend error ${res.status}: ${body}`);
    }
    const data = (await res.json()) as { cards: TrendCard[] };
    return data.cards;
  } finally {
    clearTimeout(timeout);
  }
}
