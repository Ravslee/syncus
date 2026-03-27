// ============================================================
// SyncUs - Design Theme Tokens
// Matches dark purple/navy UI from mockups
// ============================================================

export const Colors = {
  // Primary palette
  primary: '#7C5CFC',
  primaryLight: '#A78BFA',
  primaryDark: '#5B3FD4',

  // Accent / gradient stops
  accentPink: '#E879A8',
  accentCyan: '#67E8F9',
  accentMint: '#6EE7B7',
  accentOrange: '#FDBA74',

  // Background layers
  background: '#0F0A1E',
  backgroundLight: '#1A1330',
  surface: '#241D3B',
  surfaceLight: '#2E2650',

  // Card / glassmorphism
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B0D2',
  textMuted: '#7A7194',
  textAccent: '#C4B5FD',

  // Status
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: 'rgba(255, 255, 255, 0.08)',
};

export const Gradients = {
  primary: ['#7C5CFC', '#A78BFA'] as [string, string],
  primaryDiagonal: ['#5B3FD4', '#A78BFA'] as [string, string],
  pinkPurple: ['#E879A8', '#7C5CFC'] as [string, string],
  cyanPurple: ['#67E8F9', '#7C5CFC'] as [string, string],
  mintTeal: ['#6EE7B7', '#34D399'] as [string, string],
  orangeYellow: ['#FDBA74', '#FBBF24'] as [string, string],
  background: ['#0F0A1E', '#1A1330'] as [string, string],
  card: ['rgba(36, 29, 59, 0.8)', 'rgba(46, 38, 80, 0.6)'] as [string, string],
};

export const Typography = {
  // Font families (using system fonts; swap for custom if needed)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C5CFC',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7C5CFC',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
