import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';

// Eight farm-themed palette colours used for initials backgrounds
const FARM_COLORS: string[] = [
  '#2E7D32', // forest green
  '#388E3C', // medium green
  '#1565C0', // deep blue
  '#6A1B9A', // plum
  '#AD1457', // berry
  '#E65100', // harvest orange
  '#00695C', // teal
  '#4527A0', // deep purple
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getNameColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return FARM_COLORS[sum % FARM_COLORS.length];
}

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  style?: ViewStyle;
  showBorder?: boolean;
  verified?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  uri,
  size = 40,
  style,
  showBorder = false,
  verified = false,
}) => {
  const bgColor = getNameColor(name);
  const badgeSize = Math.max(12, Math.round(size * 0.3));

  // All size-derived styles are computed here, not inlined in JSX markup
  const wrapperDynamic: ViewStyle = {
    width: size,
    height: size,
  };

  const circleDynamic: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: bgColor,
  };

  const badgeDynamic: ViewStyle = {
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
  };

  const initsFontDynamic = {
    fontSize: Math.round(size * 0.38),
  };

  return (
    <View style={[styles.wrapper, wrapperDynamic, style]}>
      {/* Circular avatar — overflow hidden clips the image to a circle */}
      <View style={[styles.circle, circleDynamic, showBorder && styles.border]}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.fill}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.initials, initsFontDynamic]}>
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Verified badge — bottom-right corner */}
      {verified && (
        <View style={[styles.badge, badgeDynamic]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 2.5,
    borderColor: '#4CAF50',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // ── Verified badge ───────────────────────────────────────────
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
  },
});

export default Avatar;
