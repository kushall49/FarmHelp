import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';

const { width, height } = Dimensions.get('window');

const NavigateToFarmerScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, jobStatus } = useService();
  const [operatorLoc, setOperatorLoc] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  useEffect(() => {
    getCurrentLocation().then(loc => setOperatorLoc(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobStatus === 'OTP_VERIFIED') {
      navigation.navigate('OperatorJobActiveScreen');
    }
  }, [jobStatus, navigation]);

  const handleVerify = () => {
    if (!currentRequest?._id || enteredOtp.length !== 4) return;
    socketService.operatorVerifyOTP({
      requestId: currentRequest._id,
      otp: enteredOtp
    });
  };

  const farmerLoc = currentRequest?.farmerId?.location?.coordinates || [0, 0];
  const mapCenter = farmerLoc[1] ? { lat: farmerLoc[1], lng: farmerLoc[0] } : operatorLoc;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Navigate to Farmer</Text>
        <Text style={styles.headerSubtitle}>Request ID: {currentRequest?._id?.slice(-6)}</Text>
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
            {farmerLoc[0] !== 0 && <Marker coordinate={{ latitude: farmerLoc[1], longitude: farmerLoc[0] }} title="Farmer" pinColor="green" />}
            {operatorLoc && <Marker coordinate={{ latitude: operatorLoc.lat, longitude: operatorLoc.lng }} title="You" />}
          </MapView>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.instructions}>Enter the 4-digit OTP from the farmer to start the job.</Text>

        <TextInput
          style={styles.otpInput}
          value={enteredOtp}
          onChangeText={(text) => setEnteredOtp(text.replace(/[^0-9]/g, ''))}
          maxLength={4}
          keyboardType="numeric"
          placeholder="----"
          placeholderTextColor="#888"
        />

        <TouchableOpacity 
          style={[styles.verifyBtn, enteredOtp.length !== 4 && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          disabled={enteredOtp.length !== 4}
        >
          <Text style={styles.verifyBtnText}>Verify OTP & Start Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: { padding: 20, backgroundColor: '#1f1f2e', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { color: '#888', fontSize: 12 },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: { backgroundColor: '#2b2b40', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, marginTop: -20 },
  instructions: { color: '#ccc', textAlign: 'center', marginBottom: 25, fontSize: 15 },
  otpInput: { width: '100%', backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff', textAlign: 'center', fontSize: 36, letterSpacing: 20, paddingVertical: 20, borderRadius: 15, fontFamily: 'monospace', marginBottom: 30 },
  verifyBtn: { width: '100%', backgroundColor: '#52B788', paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  verifyBtnDisabled: { backgroundColor: '#4a4a4a', opacity: 0.7 },
  verifyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default NavigateToFarmerScreen;