import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const OperatorFoundScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, currentRequest, operatorLocation, otp } = useService();
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation().then(loc => setMyLocation(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobStatus === 'OTP_VERIFIED') {
      navigation.navigate('JobActiveScreen');
    }
  }, [jobStatus, navigation]);

  const operatorInfo = currentRequest?.operatorId || {};
  const mapCenter = operatorLocation || myLocation;

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Operator Found!</Text>

        <View style={styles.operatorCard}>
          <View>
            <Text style={styles.operatorName}>{operatorInfo.name || 'Operator'}</Text>
            <Text style={styles.operatorEquipment}>{operatorInfo.equipmentType || 'Equipment'}</Text>
          </View>
          <Text style={styles.ratingText}>★ {operatorInfo.rating?.toFixed(1) || '5.0'}</Text>
        </View>

        <View style={styles.otpBox}>
          <Text style={styles.otpLabel}>Show this OTP to the operator:</Text>
          <Text style={styles.otpValue}>{otp || '----'}</Text>
        </View>

        <Text style={styles.waitingText}>Waiting for operator to arrive and verify OTP...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: { backgroundColor: '#2b2b40', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, marginTop: -20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#52B788', marginBottom: 20 },
  operatorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A2E', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  operatorName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  operatorEquipment: { fontSize: 14, color: '#888', marginTop: 4 },
  ratingText: { fontSize: 16, fontWeight: 'bold', color: '#fbbf24' },
  otpBox: { backgroundColor: 'rgba(82, 183, 136, 0.2)', padding: 25, borderRadius: 15, borderWidth: 1, borderColor: '#52B788', alignItems: 'center' },
  otpLabel: { color: '#ccc', fontSize: 14, marginBottom: 10 },
  otpValue: { fontSize: 40, fontWeight: 'bold', letterSpacing: 10, color: '#52B788' },
  waitingText: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 12 }
});

export default OperatorFoundScreen;