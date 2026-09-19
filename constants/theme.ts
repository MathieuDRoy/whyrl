export const theme = {
  fonts: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semiBold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extraBold: 'Manrope_800ExtraBold',
    display: 'SpaceGrotesk_700Bold',
    displayMedium: 'SpaceGrotesk_600SemiBold',
  },

  colors: {
    // Deep Teal ground with Soft Sage accent; glass panels are translucent white over the bloom background.
    bg: '#152D35',
    screen: 'transparent',
    surface: 'rgba(255, 255, 255, 0.07)',
    surfaceElevated: 'rgba(255, 255, 255, 0.11)',
    surfaceSolid: '#1E3E47',
    surfaceBorder: 'rgba(255, 255, 255, 0.14)',
    field: 'rgba(255, 255, 255, 0.08)',
    accent: '#D4ECDD',
    accentDim: 'rgba(212, 236, 221, 0.14)',
    accentGlow: 'rgba(212, 236, 221, 0.30)',
    accentDark: '#0E232A',
    textPrimary: '#EAF6F2',
    textSecondary: '#A9C4BE',
    textMuted: '#7E9B95',
    white: '#FFFFFF',
    danger: '#FF7D96',
    adBg: 'rgba(255, 194, 75, 0.08)',
    adBorder: 'rgba(255, 194, 75, 0.30)',

    category: {
      politics: '#FF7D96',
      finance: '#FFC24B',
      sport: '#4ADE80',
      entertainment: '#F472B6',
      tech: '#D4ECDD',
      world: '#5CC8FA',
    } as Record<string, string>,

    categoryBg: {
      politics: 'rgba(255, 125, 150, 0.12)',
      finance: 'rgba(255, 194, 75, 0.12)',
      sport: 'rgba(74, 222, 128, 0.12)',
      entertainment: 'rgba(244, 114, 182, 0.12)',
      tech: 'rgba(212, 236, 221, 0.12)',
      world: 'rgba(92, 200, 250, 0.12)',
    } as Record<string, string>,

    // Header tint that fades to transparent so the glass card shows through.
    categoryGradient: {
      politics: ['rgba(255, 92, 122, 0.26)', 'rgba(255, 92, 122, 0)'] as [string, string],
      finance: ['rgba(255, 194, 75, 0.24)', 'rgba(255, 194, 75, 0)'] as [string, string],
      sport: ['rgba(74, 222, 128, 0.22)', 'rgba(74, 222, 128, 0)'] as [string, string],
      entertainment: ['rgba(244, 114, 182, 0.24)', 'rgba(244, 114, 182, 0)'] as [string, string],
      tech: ['rgba(212, 236, 221, 0.22)', 'rgba(212, 236, 221, 0)'] as [string, string],
      world: ['rgba(56, 189, 248, 0.24)', 'rgba(56, 189, 248, 0)'] as [string, string],
    } as Record<string, [string, string]>,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 22,
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
  { key: 'NA', label: '🌎 North America' },
  { key: 'EU', label: '🇪🇺 Europe' },
];
