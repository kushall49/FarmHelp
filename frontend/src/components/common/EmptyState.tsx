import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const showAction = actionLabel != null && onAction != null;

  return (
    <View style={styles.container}>
      {icon != null && <Text style={styles.icon}>{icon}</Text>}

      <Text style={styles.title}>{title}</Text>

      {subtitle != null && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {showAction && (
        <View style={styles.buttonWrapper}>
          <Button
            title={actionLabel as string}
            onPress={onAction as () => void}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  // ── Decorative icon ──────────────────────────────────────────
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  // ── Title ────────────────────────────────────────────────────
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  // ── Subtitle ─────────────────────────────────────────────────
  subtitle: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  // ── Action button ─────────────────────────────────────────────
  buttonWrapper: {
    marginTop: 24,
    minWidth: 160,
    alignSelf: 'center',
  },
});

export default EmptyState;
