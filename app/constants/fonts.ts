import { Platform } from 'react-native';

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
};

export const FontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const FontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const Typography = {
  h1: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  h5: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: 22,
  },
  h6: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  },
  body1: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: 24,
  },
  body2: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: 20,
  },
  caption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: 16,
  },
  overline: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  subtitle1: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: 22,
  },
  subtitle2: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
  },
};