import { getNumColumns, filterCards } from '../utils/feedUtils';
import { TrendCard } from '../constants/mockData';

// Minimal card factory
function makeCard(overrides: Partial<TrendCard>): TrendCard {
  return {
    id: overrides.id ?? 'c1',
    title: overrides.title ?? 'Test Title',
    summary: overrides.summary ?? 'Test summary',
    details: 'Details',
    category: overrides.category ?? 'tech',
    source: 'newsapi',
    region: 'US',
    timestamp: '1h ago',
    trendingScore: 90,
    engagements: 1000,
    hashtags: overrides.hashtags ?? [],
    isAd: overrides.isAd ?? false,
    ...overrides,
  };
}

describe('getNumColumns', () => {
  it('returns 2 columns for narrow mobile widths', () => {
    expect(getNumColumns(375)).toBe(2);
    expect(getNumColumns(767)).toBe(2);
  });

  it('returns 3 columns at tablet width (768px)', () => {
    expect(getNumColumns(768)).toBe(3);
    expect(getNumColumns(1199)).toBe(3);
  });

  it('returns 4 columns at wide desktop width (1200px+)', () => {
    expect(getNumColumns(1200)).toBe(4);
    expect(getNumColumns(1920)).toBe(4);
  });
});

describe('filterCards', () => {
  const cards: TrendCard[] = [
    makeCard({ id: '1', category: 'tech', title: 'Bitcoin Surges', summary: 'Crypto news', hashtags: ['crypto'] }),
    makeCard({ id: '2', category: 'finance', title: 'Stock Market Rally', summary: 'Wall Street gains', hashtags: ['stocks'] }),
    makeCard({ id: '3', category: 'sport', title: 'World Cup Final', summary: 'Soccer match', hashtags: ['football'] }),
    makeCard({ id: '4', category: 'tech', title: 'New AI Model', summary: 'Machine learning advances', hashtags: ['AI', 'tech'] }),
    makeCard({ id: 'ad-1', category: 'tech', isAd: true, title: 'Ad Content', summary: 'Advertisement' }),
  ];

  describe('category filter', () => {
    it('returns all cards when selectedCategory is "all"', () => {
      const result = filterCards(cards, 'all', '');
      expect(result).toHaveLength(cards.length);
    });

    it('filters to matching category', () => {
      const result = filterCards(cards, 'tech', '');
      const nonAdTechCards = result.filter((c) => !c.isAd);
      expect(nonAdTechCards.every((c) => c.category === 'tech')).toBe(true);
    });

    it('excludes ad cards when a category is selected', () => {
      const result = filterCards(cards, 'tech', '');
      expect(result.every((c) => !c.isAd)).toBe(true);
    });

    it('returns empty array when no cards match category', () => {
      const result = filterCards(cards, 'world', '');
      expect(result).toHaveLength(0);
    });
  });

  describe('search filter', () => {
    it('filters by title (case-insensitive)', () => {
      const result = filterCards(cards, 'all', 'bitcoin');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by summary', () => {
      const result = filterCards(cards, 'all', 'wall street');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('filters by hashtag', () => {
      const result = filterCards(cards, 'all', 'football');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('is case-insensitive', () => {
      const result = filterCards(cards, 'all', 'BITCOIN');
      expect(result).toHaveLength(1);
    });

    it('returns all cards for empty search query', () => {
      const result = filterCards(cards, 'all', '');
      expect(result).toHaveLength(cards.length);
    });

    it('returns all cards for whitespace-only query', () => {
      const result = filterCards(cards, 'all', '   ');
      expect(result).toHaveLength(cards.length);
    });

    it('returns empty array when nothing matches', () => {
      const result = filterCards(cards, 'all', 'xyzzy-no-match');
      expect(result).toHaveLength(0);
    });
  });

  describe('combined category + search filter', () => {
    it('applies both filters together', () => {
      const result = filterCards(cards, 'tech', 'ai');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('returns empty when category matches but search does not', () => {
      const result = filterCards(cards, 'finance', 'bitcoin');
      expect(result).toHaveLength(0);
    });
  });
});
