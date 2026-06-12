import { interleaveAds } from '../hooks/useTrends';
import { TrendCard } from '../constants/mockData';

function makeCard(id: string, isAd = false): TrendCard {
  return {
    id,
    title: `Card ${id}`,
    summary: 'Summary',
    details: 'Details',
    category: 'tech',
    source: 'newsapi',
    region: 'US',
    timestamp: '1h ago',
    trendingScore: 90,
    engagements: 1000,
    hashtags: [],
    isAd,
  };
}

function makeCards(count: number): TrendCard[] {
  return Array.from({ length: count }, (_, i) => makeCard(`c${i + 1}`));
}

describe('interleaveAds', () => {
  it('returns cards unchanged when no ads provided', () => {
    const cards = makeCards(15);
    const result = interleaveAds(cards, []);
    expect(result).toEqual(cards);
  });

  it('inserts one ad after every 10 content cards', () => {
    const cards = makeCards(10);
    const ads = [makeCard('ad-1', true)];
    const result = interleaveAds(cards, ads);

    expect(result).toHaveLength(11);
    expect(result[10].isAd).toBe(true);
    expect(result[10].id).toBe('ad-1');
  });

  it('inserts multiple ads for larger card sets', () => {
    const cards = makeCards(20);
    const ads = [makeCard('ad-1', true), makeCard('ad-2', true)];
    const result = interleaveAds(cards, ads);

    expect(result).toHaveLength(22);
    expect(result[10].id).toBe('ad-1');
    expect(result[21].id).toBe('ad-2');
  });

  it('does not insert more ads than available', () => {
    const cards = makeCards(30);
    const ads = [makeCard('ad-1', true)]; // only 1 ad, but 3 slots available
    const result = interleaveAds(cards, ads);

    const adCount = result.filter((c) => c.isAd).length;
    expect(adCount).toBe(1);
  });

  it('does not insert an ad when card count is not a multiple of 10', () => {
    const cards = makeCards(9);
    const ads = [makeCard('ad-1', true)];
    const result = interleaveAds(cards, ads);

    expect(result).toHaveLength(9);
    expect(result.every((c) => !c.isAd)).toBe(true);
  });

  it('preserves content card order', () => {
    const cards = makeCards(10);
    const ads = [makeCard('ad-1', true)];
    const result = interleaveAds(cards, ads);
    const contentCards = result.filter((c) => !c.isAd);

    expect(contentCards.map((c) => c.id)).toEqual(cards.map((c) => c.id));
  });
});
