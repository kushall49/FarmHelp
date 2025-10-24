import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ServiceCardProps {
  service: any;
  onPress: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const {
    provider,
    serviceType,
    title,
    description,
    location,
    rate,
    images,
    views,
    callsReceived,
  } = service;

  const handleCall = (e: any) => {
    e.stopPropagation();
    if (service.phoneNumber) {
      Linking.openURL(`tel:${service.phoneNumber}`).catch((err) =>
        console.error('Error opening dialer:', err)
      );
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.card}>
        {/* Image Section */}
        {images && images.length > 0 && (
          <Image
            source={{ uri: images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Content Section */}
        <View style={styles.content}>
          {/* Service Type Badge */}
          <Chip
            icon="tractor"
            style={styles.typeBadge}
            textStyle={styles.typeBadgeText}
          >
            {serviceType}
          </Chip>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Provider Info */}
          <View style={styles.providerContainer}>
            <View style={styles.avatarContainer}>
              {provider.avatar ? (
                <Image source={{ uri: provider.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={24} color="#999" />
                </View>
              )}
            </View>

            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{provider.name}</Text>
                {provider.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#4CAF50"
                  />
                )}
              </View>

              {/* Rating */}
              {provider.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {provider.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.locationText}>
              {location.taluk}, {location.district}
            </Text>
          </View>

          {/* Rate and Action */}
          <View style={styles.footer}>
            <View style={styles.rateContainer}>
              <Text style={styles.rateAmount}>₹{rate.amount}</Text>
              <Text style={styles.rateUnit}>/ {rate.unit}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#fff" />
              <Text style={styles.callButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>

          {/* Analytics */}
          <View style={styles.analytics}>
            <View style={styles.analyticItem}>
              <MaterialCommunityIcons name="eye" size={14} color="#999" />
              <Text style={styles.analyticText}>{views} views</Text>
            </View>
            <View style={styles.analyticItem}>
              <MaterialCommunityIcons name="phone" size={14} color="#999" />
              <Text style={styles.analyticText}>{callsReceived} calls</Text>
            </View>
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
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    marginBottom: 12,
  },
  typeBadgeText: {
    color: '#4CAF50',
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
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
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
    marginBottom: 12,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  rateAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rateUnit: {
    fontSize: 12,
    color: '#999',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});
