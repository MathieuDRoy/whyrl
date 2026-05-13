export const theme = {
  colors: {
    bg: '#0A0A0A',
    surface: '#111111',
    surfaceElevated: '#1A1A1A',
    surfaceBorder: '#252525',
    accent: '#00C853',
    accentDim: 'rgba(0, 200, 83, 0.12)',
    accentGlow: 'rgba(0, 200, 83, 0.25)',
    accentDark: '#007535',
    textPrimary: '#F0F0F0',
    textSecondary: '#888888',
    textMuted: '#444444',
    white: '#FFFFFF',
    adBg: '#1A1500',
    adBorder: '#3A3000',

    category: {
      politics: '#FF6B6B',
      finance: '#FFD93D',
      sport: '#6BCB77',
      entertainment: '#C77DFF',
      tech: '#4ECDC4',
      world: '#00C853',
    } as Record<string, string>,

    categoryBg: {
      politics: 'rgba(255, 107, 107, 0.12)',
      finance: 'rgba(255, 217, 61, 0.12)',
      sport: 'rgba(107, 203, 119, 0.12)',
      entertainment: 'rgba(199, 125, 255, 0.12)',
      tech: 'rgba(78, 205, 196, 0.12)',
      world: 'rgba(0, 200, 83, 0.12)',
    } as Record<string, string>,

    categoryGradient: {
      politics: ['#3D0A0A', '#1A0505'] as [string, string],
      finance: ['#2A2000', '#141000'] as [string, string],
      sport: ['#0A1F0A', '#050F05'] as [string, string],
      entertainment: ['#1E0A2A', '#0F0514'] as [string, string],
      tech: ['#0A1E1E', '#050F0F'] as [string, string],
      world: ['#0A1F0F', '#051008'] as [string, string],
    } as Record<string, [string, string]>,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};

export type Category = 'politics' | 'finance' | 'sport' | 'entertainment' | 'tech' | 'world';
export const CATEGORIES: { key: Category | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '⚡' },
  { key: 'politics', label: 'Politics', emoji: '🏛️' },
  { key: 'finance', label: 'Finance', emoji: '📈' },
  { key: 'sport', label: 'Sport', emoji: '⚽' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { key: 'tech', label: 'Tech', emoji: '💻' },
  { key: 'world', label: 'World', emoji: '🌍' },
];

export const REGIONS = [
  { key: 'US', label: '🇺🇸 United States' },
  { key: 'GB', label: '🇬🇧 United Kingdom' },
  { key: 'CA', label: '🇨🇦 Canada' },
  { key: 'AU', label: '🇦🇺 Australia' },
  { key: 'DE', label: '🇩🇪 Germany' },
  { key: 'FR', label: '🇫🇷 France' },
  { key: 'JP', label: '🇯🇵 Japan' },
  { key: 'BR', label: '🇧🇷 Brazil' },
  { key: 'IN', label: '🇮🇳 India' },
];
