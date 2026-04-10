import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const JobActiveScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, operatorLocation, currentRequest } = useService();
  const [myLocation, setMyLocation] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    getCurrentLocation().then(loc => setMyLocation(loc)).catch(() => {});

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (jobStatus === 'COMPLETED') {
      navigation.navigate('JobCompleteScreen');
    }
  }, [jobStatus, navigation]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const operatorInfo = currentRequest?.operatorId || {};
  const mapCenter = myLocation || operatorLocation;

  return (
    <View style={styles.container}>
      <View style={styles.statusBanner}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusText}>Job In Progress</Text>
      </View>

      <View style={styles.mapContainer}>
        {mapCenter && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: mapCenter.lat,
              longitude: mapCenter.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {myLocation && <Marker coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }} title="You" />}
            {operatorLocation && <Marker coordinate={{ latitude: operatorLocation.lat, longitude: operatorLocation.lng }} title="Operator" pinColor="blue" />}
          </MapView>
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Elapsed Time</Text>
          <Text style={styles.timerValue}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.operatorBox}>
          <View>
            <Text style={styles.boxLabel}>OPERATOR</Text>
            <Text style={styles.boxValue}>{operatorInfo.name || 'Operator'}</Text>
          </View>
          <View style={styles.rightAlign}>
            <Text style={styles.boxLabel}>EQUIPMENT</Text>
            <Text style={styles.boxValueHighlight}>{operatorInfo.equipmentType || 'Tractor'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  statusBanner: { backgroundColor: 'rgba(82, 183, 136, 0.1)', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#52B788', marginRight: 10 },
  statusText: { color: '#52B788', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: { backgroundColor: '#2b2b40', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, marginTop: -20 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  timerLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { color: '#52B788', fontSize: 36, fontFamily: 'monospace', fontWeight: '300' },
  operatorBox: { backgroundColor: '#1A1A2E', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  boxLabel: { color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  boxValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  boxValueHighlight: { color: '#52B788', fontSize: 16, fontWeight: 'bold' },
  rightAlign: { alignItems: 'flex-end' }
});

export default JobActiveScreen;