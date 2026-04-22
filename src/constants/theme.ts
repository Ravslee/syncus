// ============================================================
// SyncUs - Design Theme Tokens
// Matches dark purple/navy UI from mockups
// ============================================================

export const Colors = {

  // Strict 2-Color Cinder & Flame Palette
  primary: '#FF7F50',       // Flame
  primaryLight: '#FF7F50',
  primaryDark: '#1E2B2F',   // Cinder


  // Accent / gradient stops
  accentPink: '#FF7F50',
  accentCyan: '#1E2B2F',
  accentMint: '#FF7F50',
  accentOrange: '#FF7F50',

  // Background layers — Strict Cinder
  background: '#1E2B2F',
  backgroundLight: '#1E2B2F',
  surface: '#1E2B2F',
  surfaceBgOpacity: '#293235ff',
  surfaceLight: '#1E2B2F',
  surfaceDark: '#1E2B2F',
  surfaceAccent: '#FF7F50',

  // Card / glassmorphism
  glass: '#1E2B2F',
  glassBorder: '#FF7F50', // Solid Flame border
  glassHighlight: '#FF7F50',

  // Text 
  textPrimary: '#1E2B2F',   // White
  textSecondary: '#FFFFFF', // White
  textMuted: '#1E2B2F',     // Flame (as muted/secondary accent)
  textAccent: '#FF7F50',    // Flame

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
  primary: ['#FF7F50', '#FF7F50'] as [string, string],
  primaryDiagonal: ['#1E2B2F', '#FF7F50'] as [string, string],
  pinkPurple: ['#FF7F50', '#FF7F50'] as [string, string],
  cyanPurple: ['#1E2B2F', '#1E2B2F'] as [string, string],
  mintTeal: ['#FFFFFF', '#1E2B2F'] as [string, string],
  orangeYellow: ['#FF7F50', '#FF7F50'] as [string, string],
  background: ['#1E2B2F', '#1E2B2F'] as [string, string],
  card: ['#1E2B2F', '#1E2B2F'] as [string, string],
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
    shadowColor: '#FF7F50', // Flame shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#FF7F50', // Flame glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
};
