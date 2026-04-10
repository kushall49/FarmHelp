import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const CATEGORIES = ['Tractor', 'Harvester', 'Ploughing', 'Seeding', 'Irrigation', 'Pesticide', 'Farm Labor', 'Transport'];

const CustomerHome = () => {
  const navigation = useNavigation();
  const { setJobStatus } = useService();
  const [location, setLocation] = useState(null);
  const [selectedEquip, setSelectedEquip] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => console.log("Location error:", err));
  }, []);

  const handleRequest = () => {
    if (!location || !selectedEquip) return;
    setLoading(true);
    setJobStatus('SEARCHING');
    socketService.farmerRequestService({
      equipmentType: selectedEquip,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    });
    navigation.navigate('SearchingScreen');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title="You are here" />
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Select Equipment</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <View style={styles.categoriesWrap}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, selectedEquip === cat && styles.categoryPillSelected]}
                onPress={() => setSelectedEquip(cat)}
              >
                <Text style={[styles.categoryText, selectedEquip === cat && styles.categoryTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.requestBtn, (!location || !selectedEquip || loading) && styles.requestBtnDisabled]}
          disabled={!location || !selectedEquip || loading}
          onPress={handleRequest}
        >
          <Text style={styles.requestBtnText}>{loading ? 'Requesting...' : 'Request Now'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  mapContainer: { height: height * 0.4 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff' },
  contentContainer: { flex: 1, padding: 20, backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#52B788', marginBottom: 15 },
  categoriesContainer: { flexGrow: 0, marginBottom: 20 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#52B788', margin: 5 },
  categoryPillSelected: { backgroundColor: '#52B788' },
  categoryText: { color: '#52B788', fontWeight: '600' },
  categoryTextSelected: { color: '#fff' },
  footer: { padding: 20, paddingBottom: 40 },
  requestBtn: { backgroundColor: '#52B788', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  requestBtnDisabled: { backgroundColor: '#4a4a4a' },
  requestBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CustomerHome;