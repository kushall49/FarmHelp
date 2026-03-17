import { Colors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FontSize = {
  micro: 11,
  caption: 13,
  body: 15,
  section: 18,
  title: 22,
  hero: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 20,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Typography = {
  hero: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  section: {
    fontSize: FontSize.section,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
  },
  micro: {
    fontSize: FontSize.micro,
    fontWeight: FontWeight.regular,
    color: Colors.textMuted,
  },
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  fontSize: FontSize,
  fontWeight: FontWeight,
  borderRadius: BorderRadius,
  shadow: Shadow,
  typography: Typography,
};
