import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ServiceListing } from '../../services/api';
import Avatar from '../common/Avatar';
import { Colors } from '../../constants/colors';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceListing;
  onPress: () => void;
  onCall: (service: ServiceListing) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface BadgeColors {
  bg: string;
  text: string;
}

function getCategoryBadge(serviceType: string): BadgeColors {
  switch (serviceType.toLowerCase()) {
    case 'tractor':
      return { bg: Colors.badgeBlue, text: Colors.badgeBlueText };
    case 'harvester':
      return { bg: Colors.badgeAmber, text: Colors.badgeAmberText };
    case 'ploughing':
      return { bg: Colors.badgeGreen, text: Colors.badgeGreenText };
    default:
      return { bg: Colors.surfaceAlt, text: Colors.textSecondary };
  }
}

function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN');
}

function renderStars(rating: number): string {
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ─── Component ────────────────────────────────────────────────────────────────

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress, onCall }) => {
  const badge = getCategoryBadge(service.serviceType);

  // Category badge style derived once, never inline
  const categoryBadgeStyle: ViewStyle = {
    ...styles.categoryBadge,
    backgroundColor: badge.bg,
  };

  const locationParts = [service.location.village, service.location.district].filter(
    Boolean,
  );
  const locationText = locationParts.join(', ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* ── Row 1: Category badge + availability ────────────────────────── */}
      <View style={styles.row1}>
        <View style={categoryBadgeStyle}>
          <Text style={[styles.categoryBadgeText, { color: badge.text }]}>
            {service.serviceType}
          </Text>
        </View>

        <View style={styles.availabilityGroup}>
          <View
            style={[
              styles.availabilityDot,
              service.isAvailable ? styles.dotAvailable : styles.dotUnavailable,
            ]}
          />
          <Text
            style={[
              styles.availabilityLabel,
              service.isAvailable
                ? styles.availabilityLabelActive
                : styles.availabilityLabelInactive,
            ]}
          >
            {service.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      {/* ── Row 2: Title + verified tick ────────────────────────────────── */}
      <View style={styles.row2}>
        <Text style={styles.title} numberOfLines={1}>
          {service.title}
        </Text>
        {service.provider.isVerifiedProvider === true && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      {/* ── Row 3: Description ──────────────────────────────────────────── */}
      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>

      {/* ── Row 4: Provider ─────────────────────────────────────────────── */}
      <View style={styles.providerRow}>
        <Avatar
          name={service.provider.name}
          uri={service.provider.avatar}
          size={28}
        />
        <Text style={styles.providerName} numberOfLines={1}>
          {service.provider.name}
        </Text>
        {service.averageRating != null && (
          <View style={styles.ratingGroup}>
            <Text style={styles.starsText}>{renderStars(service.averageRating)}</Text>
            <Text style={styles.ratingValue}>{service.averageRating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* ── Row 5: Location ─────────────────────────────────────────────── */}
      {locationText.length > 0 && (
        <View style={styles.locationRow}>
          <Text style={styles.pinEmoji}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
      )}

      {/* ── Row 6: Price + Call button ──────────────────────────────────── */}
      <View style={styles.bottomRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceAmount}>₹{formatINR(service.rate.amount)}</Text>
          <Text style={styles.priceUnit}> /{service.rate.unit}</Text>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => onCall(service)}
          activeOpacity={0.85}
        >
          <Text style={styles.callButtonText}>📞  Call Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>👁  {service.views ?? 0} views</Text>
        <Text style={styles.statsDot}>·</Text>
        <Text style={styles.statsText}>📞  {service.callsReceived ?? 0} calls</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Row 1
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  dotAvailable: {
    backgroundColor: Colors.accent,
  },
  dotUnavailable: {
    backgroundColor: Colors.error,
  },
  availabilityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityLabelActive: {
    color: Colors.accent,
  },
  availabilityLabelInactive: {
    color: Colors.error,
  },

  // Row 2
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '700',
  },

  // Row 3
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Row 4
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsText: {
    fontSize: 12,
    color: Colors.warning,
    marginRight: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Row 5
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  pinEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Row 6
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  callButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  statsText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statsDot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
});

export default ServiceCard;
