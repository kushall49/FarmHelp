import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { Text, Button, Card, Surface, ActivityIndicator, Chip, Divider, IconButton } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useSafeGoBack } from '../navigation/AppNavigator';
import api from '../services/api';

interface CropRecommendation {
  _id: string;
  name: string;
  score: number;
  rank: number;
  reasons: string[];
  suitableSoils: string[];
  seasons: string[];
  minTemp: number;
  maxTemp: number;
  minRainfall: number;
  maxRainfall: number;
  waterRequirement: string;
  yieldPotential: string;
  marketDemand: string;
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
  soilType: string;
  district: string;
  state: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
}

export default function LocationCropRecommendation() {
  const navigation = useNavigation();
  const handleGoBack = useSafeGoBack();

  // Location & Map States
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Environmental Data
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);

  // Crop Recommendations
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    requestLocationAndFetchCrops();
  }, []);

  async function requestLocationAndFetchCrops() {
    setLoadingLocation(true);
    setLocationError('');

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location access in settings.');
        Alert.alert(
          'Permission Required',
          'This feature needs location access to provide crop recommendations based on your area.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        setLoadingLocation(false);
        return;
      }

      // Get current location
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };

      // Get reverse geocoding for district/state
      const geocode = await Location.reverseGeocodeAsync(coords);
      const district = geocode[0]?.district || geocode[0]?.city || geocode[0]?.subregion || 'Unknown';
      const state = geocode[0]?.region || geocode[0]?.isoCountryCode || 'Unknown';

      const locationInfo: LocationData = {
        ...coords,
        district,
        state,
      };

      setLocation(locationInfo);
      setLoadingLocation(false);

      // Fetch crop recommendations
      await fetchCropRecommendations(locationInfo);

    } catch (error: any) {
      console.error('Location error:', error);
      setLocationError(error.message || 'Failed to get location');
      setLoadingLocation(false);
      
      Alert.alert(
        'Location Error',
        'Could not fetch your location. Please check your GPS settings and try again.',
        [{ text: 'Retry', onPress: requestLocationAndFetchCrops }]
      );
    }
  }

  async function fetchCropRecommendations(locationData: LocationData) {
    setLoadingRecommendations(true);
    
    try {
      const response = await api.getLocationBasedCrops({
        lat: locationData.latitude,
        long: locationData.longitude,
      });

      setEnvironmentalData(response.environmental);
      setRecommendations(response.recommendations);
      
    } catch (error: any) {
      console.error('Crop recommendation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch crop recommendations',
        [{ text: 'Retry', onPress: () => fetchCropRecommendations(locationData) }]
      );
    } finally {
      setLoadingRecommendations(false);
    }
  }

  function getRankColor(rank: number): string {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#4CAF50'; // Green
    }
  }

  function getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🌾';
    }
  }

  if (loadingLocation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>📍 Detecting your location...</Text>
        <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
      </View>
    );
  }

  if (locationError && !location) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Access Required</Text>
        <Text style={styles.errorText}>{locationError}</Text>
        <Button mode="contained" onPress={requestLocationAndFetchCrops} style={styles.retryButton}>
          Retry Location Access
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Map Preview */}
      {location && (
        <Surface style={styles.mapContainer} elevation={3}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description={`${location.district}, ${location.state}`}
            />
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.locationText}>📍 {location.district}, {location.state}</Text>
            <Text style={styles.coordsText}>
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </Text>
          </View>
        </Surface>
      )}

      {/* Environmental Dashboard */}
      {environmentalData && (
        <Card style={styles.dashboardCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.dashboardTitle}>
              🌍 Climate Intelligence Dashboard
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🌡️</Text>
                <Text style={styles.statValue}>{environmentalData.temperature}°C</Text>
                <Text style={styles.statLabel}>Temperature</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>💧</Text>
                <Text style={styles.statValue}>{environmentalData.humidity}%</Text>
                <Text style={styles.statLabel}>Humidity</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🌧️</Text>
                <Text style={styles.statValue}>{environmentalData.rainfall}mm</Text>
                <Text style={styles.statLabel}>Rainfall</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🌿</Text>
                <Text style={styles.statValue}>{environmentalData.soilType}</Text>
                <Text style={styles.statLabel}>Soil Type</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.seasonRow}>
              <Chip icon="weather-sunny" style={styles.seasonChip}>
                {environmentalData.season}
              </Chip>
              <Text style={styles.seasonText}>Current Season</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Loading State for Recommendations */}
      {loadingRecommendations && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>🌾 Analyzing climate data...</Text>
          <Text style={styles.loadingSubtext}>Computing best crops for your region</Text>
        </View>
      )}

      {/* Crop Recommendations */}
      {!loadingRecommendations && recommendations.length > 0 && (
        <>
          <Surface style={styles.recommendationsHeader} elevation={1}>
            <Text variant="headlineSmall" style={styles.recommendationsTitle}>
              🎯 Top {recommendations.length} Recommended Crops
            </Text>
            <Text style={styles.recommendationsSubtitle}>
              Based on your location's climate and soil conditions
            </Text>
          </Surface>

          {recommendations.map((crop) => (
            <Card key={crop._id} style={styles.cropCard} elevation={2}>
              <Card.Content>
                {/* Crop Header */}
                <View style={styles.cropHeader}>
                  <View style={styles.cropTitleContainer}>
                    <Text style={styles.rankEmoji}>{getRankEmoji(crop.rank)}</Text>
                    <View>
                      <Text variant="titleLarge" style={styles.cropName}>
                        {crop.name}
                      </Text>
                      <Text style={styles.cropRank}>Rank #{crop.rank}</Text>
                    </View>
                  </View>
                  <Surface
                    style={[styles.scoreBadge, { backgroundColor: getRankColor(crop.rank) }]}
                    elevation={3}
                  >
                    <Text style={styles.scoreText}>{crop.score}</Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </Surface>
                </View>

                {/* Why Recommended */}
                <View style={styles.reasonsSection}>
                  <Text style={styles.reasonsTitle}>✅ Why Recommended:</Text>
                  {crop.reasons.map((reason, index) => (
                    <View key={index} style={styles.reasonRow}>
                      <Text style={styles.reasonBullet}>•</Text>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />

                {/* Crop Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌍</Text>
                    <Text style={styles.detailLabel}>Soil Types</Text>
                    <Text style={styles.detailValue}>
                      {crop.suitableSoils.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌦️</Text>
                    <Text style={styles.detailLabel}>Seasons</Text>
                    <Text style={styles.detailValue}>
                      {crop.seasons.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌡️</Text>
                    <Text style={styles.detailLabel}>Temperature</Text>
                    <Text style={styles.detailValue}>
                      {crop.minTemp}°C - {crop.maxTemp}°C
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌧️</Text>
                    <Text style={styles.detailLabel}>Rainfall</Text>
                    <Text style={styles.detailValue}>
                      {crop.minRainfall}-{crop.maxRainfall}mm
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💧</Text>
                    <Text style={styles.detailLabel}>Water Need</Text>
                    <Text style={styles.detailValue}>{crop.waterRequirement}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📈</Text>
                    <Text style={styles.detailLabel}>Yield Potential</Text>
                    <Text style={styles.detailValue}>{crop.yieldPotential}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailLabel}>Market Demand</Text>
                    <Text style={styles.detailValue}>{crop.marketDemand}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Empty State */}
      {!loadingRecommendations && recommendations.length === 0 && location && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
            <Text style={styles.emptyText}>
              We couldn't find crop recommendations for your location.
            </Text>
            <Button
              mode="contained"
              onPress={() => location && fetchCropRecommendations(location)}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  coordsText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  dashboardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  dashboardTitle: {
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonChip: {
    marginRight: 12,
  },
  seasonText: {
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  recommendationsHeader: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  recommendationsTitle: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  recommendationsSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  cropCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cropName: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cropRank: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  reasonsSection: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginBottom: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  reasonBullet: {
    color: '#16A34A',
    marginRight: 8,
    fontSize: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#15803D',
    lineHeight: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
});
