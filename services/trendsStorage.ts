import { supabase } from './supabase';
import { TrendCard } from '../constants/mockData';

const BUCKET = 'trend-cards';

export async function getSavedTrendIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('trends')
    .select('id')
    .eq('user_id', userId);

  if (error) {
    console.warn('[trendsStorage] getSavedTrendIds:', error.message);
    return [];
  }
  return data.map((r) => r.id);
}

export async function getSavedTrends(userId: string): Promise<TrendCard[]> {
  const { data, error } = await supabase
    .from('trends')
    .select('id')
    .eq('user_id', userId);

  if (error) {
    console.warn('[trendsStorage] getSavedTrends:', error.message);
    return [];
  }

  const cards = await Promise.all(
    data.map(async (row) => {
      const { data: file, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(`${userId}/${row.id}.json`);

      if (downloadError || !file) {
        console.warn('[trendsStorage] getSavedTrends download:', downloadError?.message);
        return null;
      }

      try {
        return JSON.parse(await file.text()) as TrendCard;
      } catch (err: any) {
        console.warn('[trendsStorage] getSavedTrends parse:', err?.message);
        return null;
      }
    }),
  );

  return cards.filter((c): c is TrendCard => c !== null);
}

export async function saveTrend(userId: string, card: TrendCard): Promise<void> {
  const path = `${userId}/${card.id}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(card));

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'application/json', upsert: true });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: dbError } = await supabase.from('trends').upsert({
    id: card.id,
    user_id: userId,
    name: card.title,
    country: card.region,
    date: card.timestamp,
    category: card.category,
    storage_url: urlData.publicUrl,
  });

  if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);
}

export async function deleteTrend(userId: string, cardId: string): Promise<void> {
  const [{ error: dbError }, { error: storageError }] = await Promise.all([
    supabase.from('trends').delete().eq('user_id', userId).eq('id', cardId),
    supabase.storage.from(BUCKET).remove([`${userId}/${cardId}.json`]),
  ]);

  if (dbError) console.warn('[trendsStorage] deleteTrend db:', dbError.message);
  if (storageError) console.warn('[trendsStorage] deleteTrend storage:', storageError.message);
}
