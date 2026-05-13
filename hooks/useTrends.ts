import { useState, useEffect, useCallback } from 'react';
import { TrendCard, MOCK_CARDS } from '../constants/mockData';
import { fetchTrends } from '../services/api';
import { useApp } from '../store/AppContext';
import { usePurchase } from '../store/PurchaseContext';

interface UseTrendsResult {
  cards: TrendCard[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTrends(): UseTrendsResult {
  const { state } = useApp();
  const { isPremium } = usePurchase();
  const [cards, setCards] = useState<TrendCard[]>(MOCK_CARDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchTrends(state.region, state.preferredCategories);
      const ads = MOCK_CARDS.filter((c) => c.isAd);
      setCards(isPremium ? fresh : interleaveAds(fresh, ads));
    } catch (err: any) {
      console.warn('[useTrends] falling back to mock data:', err?.message);
      setError('Could not reach server — showing sample data');
      const ads = MOCK_CARDS.filter((c) => c.isAd);
      const nonAds = MOCK_CARDS.filter((c) => !c.isAd);
      setCards(isPremium ? nonAds : interleaveAds(nonAds, ads));
    } finally {
      setLoading(false);
    }
  }, [state.region, state.preferredCategories, isPremium]);

  useEffect(() => {
    load();
  }, [load]);

  return { cards, loading, error, refresh: load };
}

// Insert 1 ad after every 10 non-ad cards.
function interleaveAds(cards: TrendCard[], ads: TrendCard[]): TrendCard[] {
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
