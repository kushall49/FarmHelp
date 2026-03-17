import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.variantPrimary,
    variant === 'secondary' && styles.variantSecondary,
    variant === 'outline' && styles.variantOutline,
    variant === 'danger' && styles.variantDanger,
    variant === 'ghost' && styles.variantGhost,
    size === 'sm' && styles.sizeSm,
    size === 'md' && styles.sizeMd,
    size === 'lg' && styles.sizeLg,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    (variant === 'primary' || variant === 'secondary' || variant === 'danger') && styles.labelLight,
    variant === 'outline' && styles.labelOutline,
    variant === 'ghost' && styles.labelGhost,
    size === 'sm' && styles.labelSm,
    size === 'md' && styles.labelMd,
    size === 'lg' && styles.labelLg,
  ];

  const indicatorColor =
    variant === 'outline' || variant === 'ghost' ? '#1B5E20' : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <View style={styles.inner}>
          {icon != null && <View style={styles.iconSlot}>{icon}</View>}
          <Text style={labelStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Variant backgrounds ──────────────────────────────────────
  variantPrimary: {
    backgroundColor: '#1B5E20',
  },
  variantSecondary: {
    backgroundColor: '#4CAF50',
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  variantDanger: {
    backgroundColor: '#C62828',
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  // ── Sizes ────────────────────────────────────────────────────
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // ── Modifiers ────────────────────────────────────────────────
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // ── Label base ───────────────────────────────────────────────
  label: {
    fontWeight: '600',
  },
  // ── Label colour per variant ─────────────────────────────────
  labelLight: {
    color: '#FFFFFF',
  },
  labelOutline: {
    color: '#1B5E20',
  },
  labelGhost: {
    color: '#546E7A',
  },
  // ── Label size per button size ───────────────────────────────
  labelSm: {
    fontSize: 13,
  },
  labelMd: {
    fontSize: 15,
  },
  labelLg: {
    fontSize: 16,
  },
});

export default Button;
