// ============================================================
// SyncUs - Design Theme Tokens
// Matches dark purple/navy UI from mockups
// ============================================================

export const Colors = {
  // Primary palette — sakura petal pink (saturated for light bg)
  // primary: '#C25070',
  primary: '#E879A8',
  // primary: '#F9A8D4',

  primaryLight: '#E88FA8',
  primaryDark: '#8B3050',



  // Accent / gradient stops — from image
  accentPink: '#F2A5BE',    // medium petal pink
  accentCyan: '#8B5E4A',    // warm bark brown (branch color)
  accentMint: '#E0D0D4',    // pale petal border
  accentOrange: '#D4748C',  // deeper petal warmth

  // Background layers — light pale blush (matches image)
  background: '#FFF0F3',
  backgroundLight: '#FFE4EB',
  surface: '#FDD8E3',
  surfaceLight: '#F9C8D6',

  // Card / glassmorphism (light mode)
  glass: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(194, 80, 112, 0.18)',

  glassHighlight: 'rgba(255, 255, 255, 0.75)',

  // Text (dark for light background)
  textPrimary: '#3A1520',
  textSecondary: '#6B3448',
  textMuted: '#9E6070',
  textAccent: '#C25070',

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
  primary: ['#C25070', '#E88FA8'] as [string, string],
  primaryDiagonal: ['#8B3050', '#C25070'] as [string, string],
  pinkPurple: ['#D4748C', '#C25070'] as [string, string],
  cyanPurple: ['#8B5E4A', '#C25070'] as [string, string],
  mintTeal: ['#E88FA8', '#F2A5BE'] as [string, string],
  orangeYellow: ['#D4748C', '#E88FA8'] as [string, string],
  background: ['#FFF0F3', '#FFE4EB'] as [string, string],
  card: ['rgba(255, 240, 243, 0.85)', 'rgba(253, 216, 227, 0.7)'] as [string, string],
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
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#C25070',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#E88FA8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
};
