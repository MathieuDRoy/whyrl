import { formatTimestamp, formatEngagement } from '../components/CardDetailModal';

describe('formatTimestamp', () => {
  const NOW = new Date('2024-06-01T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "Just now" for timestamps under 1 minute ago', () => {
    const ts = new Date(NOW - 30_000).toISOString();
    expect(formatTimestamp(ts)).toBe('Just now');
  });

  it('returns minutes ago for timestamps under 1 hour', () => {
    const ts = new Date(NOW - 5 * 60_000).toISOString();
    expect(formatTimestamp(ts)).toBe('5m ago');
  });

  it('returns hours ago for timestamps under 24 hours', () => {
    const ts = new Date(NOW - 3 * 3600_000).toISOString();
    expect(formatTimestamp(ts)).toBe('3h ago');
  });

  it('returns days ago for timestamps 24+ hours old', () => {
    const ts = new Date(NOW - 2 * 24 * 3600_000).toISOString();
    expect(formatTimestamp(ts)).toBe('2d ago');
  });

  it('returns the original string for non-ISO human strings', () => {
    expect(formatTimestamp('Yesterday')).toBe('Yesterday');
  });

  it('returns empty string for empty input', () => {
    expect(formatTimestamp('')).toBe('');
  });
});

describe('formatEngagement', () => {
  it('formats numbers under 1000 as plain strings', () => {
    expect(formatEngagement(0)).toBe('0');
    expect(formatEngagement(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatEngagement(1000)).toBe('1K');
    expect(formatEngagement(1500)).toBe('2K');
    expect(formatEngagement(999_999)).toBe('1000K');
  });

  it('formats millions with M suffix', () => {
    expect(formatEngagement(1_000_000)).toBe('1.0M');
    expect(formatEngagement(2_500_000)).toBe('2.5M');
  });

  it('correctly calculates reshares (30%) and comments (12%)', () => {
    const engagements = 10_000;
    expect(formatEngagement(Math.floor(engagements * 0.3))).toBe('3K');
    expect(formatEngagement(Math.floor(engagements * 0.12))).toBe('1K');
  });
});
