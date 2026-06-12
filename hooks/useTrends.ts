import { useState, useEffect, useCallback } from 'react';
import { TrendCard } from '../constants/mockData';
import { fetchTrends } from '../services/api';
import { useApp } from '../store/AppContext';

interface UseTrendsResult {
  cards: TrendCard[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTrends(): UseTrendsResult {
  const { state } = useApp();
  const [cards, setCards] = useState<TrendCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchTrends(state.region, state.preferredCategories);
      setCards(fresh);
    } catch (err: any) {
      console.warn('[useTrends] failed to fetch trends:', err?.message);
      setError('Could not reach server');
    } finally {
      setLoading(false);
    }
  }, [state.region, state.preferredCategories]);

  useEffect(() => {
    load();
  }, [load]);

  return { cards, loading, error, refresh: load };
}

// Insert 1 ad after every 10 non-ad cards.
export function interleaveAds(cards: TrendCard[], ads: TrendCard[]): TrendCard[] {
  if (ads.length === 0) return cards;
  const result: TrendCard[] = [];
  let adIdx = 0;
  cards.forEach((card, i) => {
    result.push(card);
    if ((i + 1) % 10 === 0 && adIdx < ads.length) {
      result.push(ads[adIdx++]);
    }
  });
  return result;
}
