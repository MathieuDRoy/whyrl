import { useState, useEffect, useCallback } from 'react';
import { TrendCard, MOCK_CARDS } from '../constants/mockData';
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
  const [cards, setCards] = useState<TrendCard[]>(MOCK_CARDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchTrends(state.region, state.preferredCategories);
      // Keep ad cards from mockData mixed in with live cards
      const ads = MOCK_CARDS.filter((c) => c.isAd);
      const merged = interleaveAds(fresh, ads);
      setCards(merged);
    } catch (err: any) {
      console.warn('[useTrends] falling back to mock data:', err?.message);
      setError('Could not reach server — showing sample data');
      setCards(MOCK_CARDS);
    } finally {
      setLoading(false);
    }
  }, [state.region, state.preferredCategories]);

  useEffect(() => {
    load();
  }, [load]);

  return { cards, loading, error, refresh: load };
}

function interleaveAds(cards: TrendCard[], ads: TrendCard[]): TrendCard[] {
  if (ads.length === 0) return cards;
  const result: TrendCard[] = [];
  const adStep = Math.max(Math.floor(cards.length / ads.length), 4);
  let adIdx = 0;
  cards.forEach((card, i) => {
    result.push(card);
    if ((i + 1) % adStep === 0 && adIdx < ads.length) {
      result.push(ads[adIdx++]);
    }
  });
  return result;
}
