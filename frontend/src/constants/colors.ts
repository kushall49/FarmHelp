export const Colors = {
  // Primary Palette
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  primaryDark: '#003300',
  accent: '#4CAF50',
  accentLight: '#81C784',
  accentSoft: '#E8F5E9',

  // Semantic / Functional
  warning: '#FF8F00',
  warningLight: '#FFF8E1',
  error: '#C62828',
  errorLight: '#FFEBEE',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  // Backgrounds
  background: '#F8FAF5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F8F2',
  border: '#E8F0E9',
  divider: '#EEEEEE',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#546E7A',
  textMuted: '#90A4AE',
  textInverse: '#FFFFFF',
  textPlaceholder: '#B0BEC5',

  // Navigation
  navActive: '#1B5E20',
  navInactive: '#90A4AE',
  navBackground: '#FFFFFF',
  navBorder: '#E8F0E9',

  // Misc
  overlay: 'rgba(27,94,32,0.85)',
  shadow: '#1B5E20',
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',

  // Category Badges
  badgeGreen: '#E8F5E9',
  badgeGreenText: '#1B5E20',
  badgeAmber: '#FFF8E1',
  badgeAmberText: '#E65100',
  badgeBlue: '#E3F2FD',
  badgeBlueText: '#1565C0',
  badgeRed: '#FFEBEE',
  badgeRedText: '#C62828',
  badgePurple: '#F3E5F5',
  badgePurpleText: '#6A1B9A',
};

export type ColorKeys = keyof typeof Colors;
