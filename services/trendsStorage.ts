import { supabase } from './supabase';
import { TrendCard } from '../constants/mockData';

const BUCKET = 'trend-cards';

// The backend's Postgres/PostgREST occasionally times out individual
// requests under no real load (undersized compute tier) - retry a few
// times with backoff before giving up, since a repeat attempt usually
// succeeds.
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 600): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
}

// React Native's Blob polyfill (unlike the browser's) doesn't implement
// .text(), so calling it directly silently throws on iOS/Android while
// working fine on web. FileReader.readAsText is supported on both.
function blobToText(blob: Blob): Promise<string> {
  if (typeof (blob as any).text === 'function') {
    return (blob as any).text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsText(blob);
  });
}

export async function getSavedTrendIds(userId: string): Promise<string[]> {
  try {
    const data = await withRetry(async () => {
      const { data, error } = await supabase.from('trends').select('id').eq('user_id', userId);
      if (error) throw error;
      return data;
    });
    return data.map((r) => r.id);
  } catch (error: any) {
    console.warn('[trendsStorage] getSavedTrendIds:', error?.message);
    return [];
  }
}

// Unlike getSavedTrendIds, this throws after retries are exhausted so the
// caller (profile screen) can tell "you have no saved stories" apart from
// "we couldn't load your saved stories" and offer a retry instead of
// silently showing an empty list.
export async function getSavedTrends(userId: string): Promise<TrendCard[]> {
  const rows = await withRetry(async () => {
    const { data, error } = await supabase.from('trends').select('id').eq('user_id', userId);
    if (error) throw error;
    return data;
  });

  // trend-cards is served with cache-control: max-age=3600, so on a repeat
  // fetch iOS's networking layer revalidates and gets back a bodyless 304 -
  // which storage-js treats as an error (any non-2xx throws), silently
  // dropping the card. cacheNonce busts the URL so every call is a fresh,
  // uncached 200.
  const cacheNonce = String(Date.now());

  const cards = await Promise.all(
    rows.map(async (row) => {
      try {
        const file = await withRetry(async () => {
          const { data: file, error: downloadError } = await supabase.storage
            .from(BUCKET)
            .download(`${userId}/${row.id}.json`, { cacheNonce });
          if (downloadError || !file) throw downloadError ?? new Error('empty download');
          return file;
        });
        return JSON.parse(await blobToText(file)) as TrendCard;
      } catch (err: any) {
        console.warn('[trendsStorage] getSavedTrends download:', err?.message);
        return null;
      }
    }),
  );

  return cards.filter((c): c is TrendCard => c !== null);
}

export async function saveTrend(userId: string, card: TrendCard): Promise<void> {
  const path = `${userId}/${card.id}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(card));

  await withRetry(async () => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: 'application/json', upsert: true });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
  });

  await withRetry(async () => {
    const { error } = await supabase.from('trends').upsert({
      id: card.id,
      user_id: userId,
      name: card.title,
      country: card.region,
      date: card.timestamp,
      category: card.category,
    });
    if (error) throw new Error(`DB insert failed: ${error.message}`);
  });
}

export async function deleteTrend(userId: string, cardId: string): Promise<void> {
  const [dbResult, storageResult] = await Promise.allSettled([
    withRetry(async () => {
      const { error } = await supabase.from('trends').delete().eq('user_id', userId).eq('id', cardId);
      if (error) throw error;
    }),
    withRetry(async () => {
      const { error } = await supabase.storage.from(BUCKET).remove([`${userId}/${cardId}.json`]);
      if (error) throw error;
    }),
  ]);

  if (dbResult.status === 'rejected') console.warn('[trendsStorage] deleteTrend db:', dbResult.reason?.message);
  if (storageResult.status === 'rejected') console.warn('[trendsStorage] deleteTrend storage:', storageResult.reason?.message);
}
