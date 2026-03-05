import { Dimensions, Platform } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export { SCREEN_WIDTH, SCREEN_HEIGHT }

export const colors = {
  primary: '#FEEE00',
  primaryDark: '#E6D800',
  accent: '#3866DF',
  accentDark: '#2D52B5',

  background: '#F5F0EA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  expressGreen: '#00A862',
  expressBg: '#E8F8F0',
  discount: '#EF4444',
  discountBg: '#FEF2F2',
  star: '#F59E0B',
  starEmpty: '#E5E7EB',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F0F0F0',

  skeleton: '#E8E3DD',
  skeletonHighlight: '#F5F0EA',

  cartBadge: '#EF4444',
  overlay: 'rgba(0,0,0,0.4)',

  splashGradientStart: '#FEF3C7',
  splashGradientEnd: '#FDBA74',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  small: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14 },
  price: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  priceSmall: { fontSize: 14, fontWeight: '700' as const, lineHeight: 20 },
} as const

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
    android: { elevation: 8 },
  }),
} as const

export const CARD_GAP = spacing.sm
export const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2
export const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.1
export const CAROUSEL_HEIGHT = SCREEN_WIDTH * 0.85
export const BOTTOM_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64
