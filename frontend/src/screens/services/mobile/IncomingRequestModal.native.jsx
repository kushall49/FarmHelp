import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';

const { width } = Dimensions.get('window');

const IncomingRequestModal = () => {
  const navigation = useNavigation();
  const { incomingRequest, setIncomingRequest } = useService();
  const [countdown, setCountdown] = useState(20);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!incomingRequest) return;

    setCountdown(20);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 20000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleReject(); // auto reject
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      progressAnim.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingRequest]);

  const handleAccept = () => {
    if (!incomingRequest) return;
    socketService.operatorAcceptRequest({ requestId: incomingRequest.requestId });
    navigation.navigate('NavigateToFarmerScreen');
  };

  const handleReject = () => {
    if (!incomingRequest) return;
    socketService.operatorRejectRequest({ requestId: incomingRequest.requestId });
    setIncomingRequest(null);
  };

  if (!incomingRequest) return null;

  const reqLoc = incomingRequest.farmerLocation?.coordinates || [0, 0];
  const distanceMsg = incomingRequest.distanceText || 'Distance unknown';

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal visible={!!incomingRequest} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: reqLoc[1],
                longitude: reqLoc[0],
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: reqLoc[1], longitude: reqLoc[0] }} />
            </MapView>
            <View style={styles.mapGradient} />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>New Job Request</Text>
                <Text style={styles.equipText}>{incomingRequest.equipmentType} Needed</Text>
              </View>
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{distanceMsg}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
            <Text style={styles.timerText}>Auto-rejecting in {countdown}s</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: width - 40, backgroundColor: '#1A1A2E', borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#52B788', shadowColor: '#52B788', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  mapContainer: { height: 160, width: '100%', position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  mapGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 26, 46, 0.4)' },
  detailsContainer: { padding: 20, marginTop: -10, backgroundColor: '#1A1A2E', borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  equipText: { fontWeight: '600', color: '#52B788', fontSize: 16 },
  distBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  distText: { color: '#ccc', fontSize: 12, fontWeight: 'bold' },
  progressContainer: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: '#52B788' },
  timerText: { textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 15 },
  rejectBtn: { flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: '#ef4444', borderRadius: 12, alignItems: 'center' },
  rejectText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  acceptBtn: { flex: 2, paddingVertical: 14, backgroundColor: '#52B788', borderRadius: 12, alignItems: 'center', shadowColor: '#52B788', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  acceptText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default IncomingRequestModal;