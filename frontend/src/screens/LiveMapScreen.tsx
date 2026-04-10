import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import * as Location from 'expo-location';
import { useSocket } from '../context/SocketContext';

// In a real app, this comes from AuthContext
const MOCK_FARMER_ID = "farmer_123"; 

export default function LiveMapScreen({ navigation }: any) {
  const { socket, isConnected, currentJob } = useSocket();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const handleRequestTractor = () => {
    if (!location || !socket) return;
    
    setIsSearching(true);
    socket.emit("requestService", {
      farmerId: MOCK_FARMER_ID,
      category: "TRACTOR",
      lat: location.coords.latitude,
      lng: location.coords.longitude
    });
  };

  if (!location) {
    return <View style={styles.center}><ActivityIndicator animating size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View 
        style={styles.map}
      >
        <Text>Map feature removed to allow Web application to run.</Text>
      </View>

      <Card style={styles.bottomSheet}>
        <Card.Title title="Live Service Request" subtitle="Find a nearby Tractor/Laborer" />
        <Card.Content>
          {!isConnected && <Text style={styles.error}>Socket Disconnected. Reconnecting...</Text>}
          
          {currentJob ? (
            <View>
              <Text style={{fontSize: 18, color: 'blue', fontWeight: 'bold'}}>
                ✅ Job Accepted! Status: {currentJob.status}
              </Text>
              <Text>Provider will arrive shortly.</Text>
            </View>
          ) : (
            <Button 
              mode="contained" 
              loading={isSearching} 
              disabled={isSearching || !isConnected} 
              onPress={handleRequestTractor}
            >
              {isSearching ? "Searching nearby 10km..." : "Request Immediate Tractor"}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomSheet: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 5, // Android shadow
  },
  error: { color: 'red', marginBottom: 10 }
});
