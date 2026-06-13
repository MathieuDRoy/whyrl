import { TrendCard } from '../constants/mockData';

// Set EXPO_PUBLIC_API_URL (in .env or eas.json env) to point at your deployed
// backend. Falls back to a local dev server — replace with your machine's
// local IP when testing on a physical device.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.4.113:3001';

export async function fetchTrends(
  region: string,
  categories: string[],
): Promise<TrendCard[]> {
  const params = new URLSearchParams({
    region,
    categories: categories.join(','),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 120s for Claude
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
