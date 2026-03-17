import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  shadow?: 'sm' | 'md' | 'lg';
  padding?: number;
  radius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = 'md',
  padding,
  radius,
}) => {
  // Dynamic overrides derived from props — computed outside JSX markup
  const overrides: ViewStyle = {};
  if (padding !== undefined) overrides.padding = padding;
  if (radius !== undefined) overrides.borderRadius = radius;

  const cardStyle = [
    styles.card,
    shadow === 'sm' && styles.shadowSm,
    shadow === 'md' && styles.shadowMd,
    shadow === 'lg' && styles.shadowLg,
    overrides,
    style,
  ];

  if (onPress != null) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.94}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  // ── Shadow presets ───────────────────────────────────────────
  shadowSm: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
});

export default Card;
