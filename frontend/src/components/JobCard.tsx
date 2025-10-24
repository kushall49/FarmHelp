import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface JobCardProps {
  job: any;
  onPress: () => void;
}

export default function JobCard({ job, onPress }: JobCardProps) {
  const {
    farmer,
    serviceNeeded,
    title,
    description,
    location,
    dateNeeded,
    budget,
    views,
    responsesReceived,
  } = job;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleCall = (e: any) => {
    e.stopPropagation();
    if (job.phoneNumber) {
      Linking.openURL(`tel:${job.phoneNumber}`).catch((err) =>
        console.error('Error opening dialer:', err)
      );
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.card}>
        <View style={styles.content}>
          {/* Urgent Badge and Service Type */}
          <View style={styles.headerRow}>
            <Chip
              icon="briefcase"
              style={styles.typeBadge}
              textStyle={styles.typeBadgeText}
            >
              {serviceNeeded}
            </Chip>

            {/* Urgency Indicator */}
            {new Date(dateNeeded).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && (
              <Chip
                icon="clock-alert"
                style={styles.urgentBadge}
                textStyle={styles.urgentBadgeText}
              >
                Urgent
              </Chip>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Farmer Info */}
          <View style={styles.farmerContainer}>
            <View style={styles.avatarContainer}>
              {farmer.avatar ? (
                <Image source={{ uri: farmer.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={24} color="#999" />
                </View>
              )}
            </View>

            <View style={styles.farmerInfo}>
              <View style={styles.farmerNameRow}>
                <Text style={styles.farmerName}>{farmer.name}</Text>
                {farmer.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#2196F3"
                  />
                )}
              </View>
              <Text style={styles.farmerLabel}>Farmer</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Location */}
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.detailText}>
                {location.taluk}, {location.district}
              </Text>
            </View>

            {/* Date Needed */}
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(dateNeeded)}</Text>
            </View>

            {/* Budget (if provided) */}
            {budget && (budget.min || budget.max) && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="currency-inr" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {budget.min && budget.max
                    ? `₹${budget.min} - ₹${budget.max}`
                    : budget.min
                    ? `₹${budget.min}+`
                    : `Up to ₹${budget.max}`}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.analytics}>
              <View style={styles.analyticItem}>
                <MaterialCommunityIcons name="eye" size={14} color="#999" />
                <Text style={styles.analyticText}>{views} views</Text>
              </View>
              <View style={styles.analyticItem}>
                <MaterialCommunityIcons name="message-reply" size={14} color="#999" />
                <Text style={styles.analyticText}>{responsesReceived} responses</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.respondButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#fff" />
              <Text style={styles.respondButtonText}>Respond</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
  },
  typeBadgeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
  },
  urgentBadgeText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  farmerLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  analytics: {
    flexDirection: 'row',
    gap: 16,
  },
  analyticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticText: {
    fontSize: 12,
    color: '#999',
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  respondButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
