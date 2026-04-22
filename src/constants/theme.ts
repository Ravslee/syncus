// ============================================================
// SyncUs - Design Theme Tokens
// Matches dark purple/navy UI from mockups
// ============================================================

export const Colors = {
  // FF7F50
  // 1E2B2F
  // Strict 2-Color Cinder & Flame Palette
  primary: '#abc82a',       // Flame
  primaryLight: '#abc82a',
  primaryDark: '#1a2417',   // Cinder


  // Accent / gradient stops
  accentPink: '#abc82a',
  accentCyan: '#1a2417',
  accentMint: '#abc82a',
  accentOrange: '#abc82a',

  // Background layers — Strict Cinder
  background: '#1a2417',
  backgroundLight: '#1a2417',
  surface: '#1a2417',
  surfaceBgOpacity: '#293235ff',
  surfaceLight: '#1a2417',
  surfaceDark: '#1a2417',
  surfaceAccent: '#abc82a',

  // Card / glassmorphism
  glass: '#1a2417',
  glassBorder: '#abc82a', // Solid Flame border
  glassHighlight: '#abc82a',

  // Text 
  textPrimary: '#1a2417',   // White
  textSecondary: '#FFFFFF', // White
  textMuted: '#1a2417',     // Flame (as muted/secondary accent)
  textAccent: '#abc82a',    // Flame

  // Status
  success: '#2A9D6F',
  error: '#D9534F',
  warning: '#D4880A',
  info: '#2D7DD2',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(58, 21, 32, 0.4)',
  divider: 'rgba(194, 80, 112, 0.15)',
};

export const Gradients = {
  primary: ['#abc82a', '#abc82a'] as [string, string],
  primaryDiagonal: ['#1a2417', '#abc82a'] as [string, string],
  pinkPurple: ['#abc82a', '#abc82a'] as [string, string],
  cyanPurple: ['#1a2417', '#1a2417'] as [string, string],
  mintTeal: ['#FFFFFF', '#1a2417'] as [string, string],
  orangeYellow: ['#abc82a', '#abc82a'] as [string, string],
  background: ['#1a2417', '#1a2417'] as [string, string],
  card: ['#1a2417', '#1a2417'] as [string, string],
};

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Nunito-Regular',
    medium: 'Nunito-SemiBold',
    semibold: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
    extrabold: 'Nunito-ExtraBold',
    // Playfair Display — use for hero titles & romantic headings
    // display: 'PlayfairDisplay-Regular',
    // displayBold: 'PlayfairDisplay-Bold',
    // displayExtrabold: 'PlayfairDisplay-ExtraBold',

    // Playfair Display — use for hero titles & romantic headings
    display: 'Nunito-Regular',
    displayBold: 'Nunito-Bold',
    displayExtrabold: 'Nunito-ExtraBold',
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
  xxxxs: 0.5,
  xxxs: 1,
  xxs: 2,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#abc82a', // Flame shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#abc82a', // Flame glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
};
