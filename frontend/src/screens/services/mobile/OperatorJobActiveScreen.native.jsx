import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const OperatorJobActiveScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, jobStatus, resetServiceState } = useService();
  const [location, setLocation] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    getCurrentLocation().then(loc => setLocation(loc)).catch(() => {});

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (jobStatus === 'COMPLETED') {
      resetServiceState();
      navigation.navigate('ServicesHome');
    }
  }, [jobStatus, navigation, resetServiceState]);

  const handleMarkComplete = () => {
    if (!currentRequest?._id) return;
    socketService.operatorMarkComplete({
      requestId: currentRequest._id
    });
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const farmerInfo = currentRequest?.farmerId || {};

  return (
    <View style={styles.container}>
      <View style={styles.statusBanner}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusText}>Job In Progress</Text>
      </View>

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
            <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title="You Are Here" pinColor="blue" />
          </MapView>
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Elapsed Time</Text>
          <Text style={styles.timerValue}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.farmerBox}>
          <View>
            <Text style={styles.boxLabel}>FARMER</Text>
            <Text style={styles.boxValue}>{farmerInfo.name || 'Farmer'}</Text>
          </View>
          <View style={styles.rightAlign}>
            <Text style={styles.boxLabel}>STATUS</Text>
            <Text style={styles.boxValueHighlight}>Active</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete}>
          <Text style={styles.completeBtnText}>Mark Job Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  statusBanner: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginRight: 10 },
  statusText: { color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: { backgroundColor: '#2b2b40', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, marginTop: -20 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  timerLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { color: '#52B788', fontSize: 36, fontFamily: 'monospace', fontWeight: '300' },
  farmerBox: { backgroundColor: '#1A1A2E', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 25 },
  boxLabel: { color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  boxValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  boxValueHighlight: { color: '#60a5fa', fontSize: 16, fontWeight: 'bold' },
  rightAlign: { alignItems: 'flex-end' },
  completeBtn: { width: '100%', backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 15, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  completeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default OperatorJobActiveScreen;