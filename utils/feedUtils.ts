import { TrendCard } from '../constants/mockData';
import { FilterCategory } from '../store/AppContext';

export function getNumColumns(width: number): number {
  if (width >= 1200) return 4;
  if (width >= 768) return 3;
  return 2;
}

export function filterCards(
  cards: TrendCard[],
  selectedCategory: FilterCategory,
  searchQuery: string,
): TrendCard[] {
  let result = cards;

  if (selectedCategory !== 'all') {
    result = result.filter((c) => !c.isAd && c.category === selectedCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.hashtags.some((h) => h.toLowerCase().includes(q)),
    );
  }

  return result;
}
