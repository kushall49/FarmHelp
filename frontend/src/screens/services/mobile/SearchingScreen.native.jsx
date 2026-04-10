import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const SearchingScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, setJobStatus } = useService();
  const [location, setLocation] = useState(null);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation().then(loc => setLocation(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobStatus === 'ACCEPTED') {
      navigation.navigate('OperatorFoundScreen');
    } else if (jobStatus === 'IDLE') {
      Alert.alert('No Operators', 'No operators found nearby.');
      navigation.navigate('CustomerHome');
    }
  }, [jobStatus, navigation]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleCancel = () => {
    socketService.farmerCancelRequest();
    setJobStatus('IDLE');
    navigation.navigate('CustomerHome');
  };

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} />
          </MapView>
        )}
      </View>

      <View style={styles.overlay}>
        <View style={styles.radarContainer}>
          <Animated.View style={[styles.radarPulse, { transform: [{ scale }], opacity }]} />
          <View style={styles.radarIconContainer}>
            <Text style={styles.iconText}>🚜</Text>
          </View>
        </View>

        <Text style={styles.title}>Searching for nearby operators...</Text>
        <Text style={styles.subtitle}>Please wait while we connect you</Text>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  mapContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  map: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 10, padding: 20 },
  radarContainer: { alignItems: 'center', justifyContent: 'center', width: 120, height: 120, marginBottom: 40 },
  radarPulse: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#52B788' },
  radarIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#52B788', justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 30, borderWidth: 1, borderColor: '#ef4444', borderRadius: 12 },
  cancelBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});

export default SearchingScreen;