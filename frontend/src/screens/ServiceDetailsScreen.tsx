import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Linking, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Surface, IconButton, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';

export default function ServiceDetailsScreen({ route, navigation }: any) {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const { serviceId } = route.params;
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, []);

  const fetchService = async () => {
    try {
      const response = await api.getServiceById(serviceId);
      setService(response.data);
    } catch (error) {
      console.error('Fetch service error:', error);
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    try {
      await api.trackCall(serviceId);
      Linking.openURL(`tel:${service.phoneNumber}`);
    } catch (error) {
      console.error('Call error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text>Service not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Service Details</Text>
        <IconButton icon="share-variant" onPress={() => {}} />
      </Surface>

      <ScrollView>
        {service.images && service.images.length > 0 && (
          <Image source={{ uri: service.images[0] }} style={styles.image} />
        )}

        <View style={styles.content}>
          <Chip icon="tractor" style={styles.chip}>{service.serviceType}</Chip>
          
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.description}>{service.description}</Text>

          {/* Provider */}
          <Surface style={styles.providerCard}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.providerRow}>
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color="#999" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.providerName}>{service.provider.name}</Text>
                  {service.provider.isVerified && (
                    <MaterialCommunityIcons name="check-decagram" size={18} color="#4CAF50" />
                  )}
                </View>
                {service.provider.rating > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
                    <Text>{service.provider.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('RateProvider', { providerId: service.provider.userId })}
              >
                Rate
              </Button>
            </View>
          </Surface>

          {/* Location */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <Text>{service.location.taluk}, {service.location.district}</Text>
          </View>

          {/* Rate */}
          <View style={styles.rateSection}>
            <Text style={styles.rateAmount}>₹{service.rate.amount}</Text>
            <Text style={styles.rateUnit}>/ {service.rate.unit}</Text>
          </View>

          <Button
            mode="contained"
            icon="phone"
            onPress={handleCall}
            style={styles.callButton}
          >
            Call Now
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#262626' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, backgroundColor: '#F5F5F5' },
  content: { padding: 16 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#262626', marginBottom: 12 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  providerCard: { padding: 16, borderRadius: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  providerName: { fontSize: 16, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  rateSection: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
  rateAmount: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  rateUnit: { fontSize: 16, color: '#999', marginLeft: 8 },
  callButton: { backgroundColor: '#4CAF50', paddingVertical: 8 },
});
