import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation, startLocationBroadcast, stopLocationBroadcast } from '../../../services/locationService';
import IncomingRequestModal from './IncomingRequestModal.native';

const OperatorHome = () => {
  const { isOnline, setIsOnline, incomingRequest } = useService();
  const [stats, setStats] = useState({ totalJobs: 0, rating: 5.0 });

  const pulseAnim = useRef(new Animated.Value(0)).current;

  const toggleOnline = async () => {
    if (!isOnline) {
      try {
        const loc = await getCurrentLocation();
        socketService.operatorGoOnline({
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        });
        startLocationBroadcast((newLoc) => {
          socketService.updateOperatorLocation({
            type: 'Point',
            coordinates: [newLoc.lng, newLoc.lat]
          });
        });
        setIsOnline(true);
      } catch (err) {
        console.log('Failed to go online:', err);
        Alert.alert('Location Error', 'Could not get location. Ensure GPS is enabled.');
      }
    } else {
      socketService.operatorGoOffline();
      stopLocationBroadcast();
      setIsOnline(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isOnline) {
        stopLocationBroadcast();
        socketService.operatorGoOffline();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isOnline, pulseAnim]);

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.container}>
      {incomingRequest && <IncomingRequestModal />}

      <Text style={styles.headerTitle}>Operator Dashboard</Text>

      <View style={styles.mainCard}>
        <View style={[styles.statusCircleWrap, isOnline ? styles.onlineBg : styles.offlineBg]}>
          {isOnline && (
            <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
          )}
          <View style={[styles.statusCircle, isOnline ? styles.onlineColor : styles.offlineColor]} />
        </View>

        <Text style={styles.statusTitle}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
        <Text style={styles.statusSubtitle}>
          {isOnline ? 'Waiting for service requests...' : 'Go online to start receiving jobs'}
        </Text>

        <TouchableOpacity
          onPress={toggleOnline}
          style={[styles.toggleBtn, isOnline ? styles.toggleBtnOffline : styles.toggleBtnOnline]}
        >
          <Text style={[styles.toggleBtnText, isOnline ? styles.toggleBtnTextRed : styles.toggleBtnTextWhite]}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Jobs</Text>
          <Text style={styles.statValue}>{stats.totalJobs}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rating</Text>
          <Text style={styles.statRating}>★ {stats.rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginVertical: 30 },
  mainCard: { width: '100%', backgroundColor: '#2b2b40', borderRadius: 25, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 30 },
  statusCircleWrap: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  onlineBg: { backgroundColor: 'rgba(82, 183, 136, 0.2)' },
  offlineBg: { backgroundColor: '#1f1f2e' },
  pulseRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#52B788' },
  statusCircle: { width: 80, height: 80, borderRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5 },
  onlineColor: { backgroundColor: '#52B788' },
  offlineColor: { backgroundColor: '#4b5563' },
  statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  statusSubtitle: { color: '#aaa', textAlign: 'center', marginBottom: 30 },
  toggleBtn: { width: '100%', paddingVertical: 16, borderRadius: 15, alignItems: 'center', borderWidth: 1 },
  toggleBtnOnline: { backgroundColor: '#52B788', borderColor: '#52B788' },
  toggleBtnOffline: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' },
  toggleBtnTextWhite: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleBtnTextRed: { color: '#ef4444', fontSize: 18, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 15 },
  statCard: { flex: 1, backgroundColor: '#2b2b40', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { color: '#888', fontSize: 14, marginBottom: 8 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statRating: { color: '#fbbf24', fontSize: 28, fontWeight: 'bold' }
});

export default OperatorHome;