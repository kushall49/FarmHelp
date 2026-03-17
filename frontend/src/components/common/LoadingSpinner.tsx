import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  overlay = false,
  color = '#1B5E20',
}) => {
  const spinner = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={color} />
      {message != null && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{spinner}</View>;
  }

  return spinner;
};

const styles = StyleSheet.create({
  // ── Full-screen overlay ──────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  // ── Inline content ───────────────────────────────────────────
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingSpinner;
