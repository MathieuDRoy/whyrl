import { formatTimestamp } from '../components/CardDetailModal';

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
