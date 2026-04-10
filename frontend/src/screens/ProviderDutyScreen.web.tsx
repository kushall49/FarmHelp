import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSocket } from '../context/SocketContext';
import * as Location from 'expo-location';

// MOCK Provider
const MOCK_PROVIDER_ID = "provider_999"; 

export default function ProviderDutyScreen() {
  const { socket, isConnected } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingJob, setIncomingJob] = useState<any>(null);

  // Background/Foreground Tracking Loop
  useEffect(() => {
    let locationInterval: ReturnType<typeof setInterval>;

    if (isOnline && isConnected && socket) {
      // 1. Initial Permission Setup
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required to go online.');
          setIsOnline(false);
          return;
        }

        // 2. Poll Location to Redis
        locationInterval = setInterval(async () => {
          const loc = await Location.getCurrentPositionAsync({});
          console.log("Pinging Redis with location: ", loc.coords);
          
          socket.emit("updateLocation", {
            providerId: MOCK_PROVIDER_ID,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude
          });
        }, 15000); // 15s Battery Saving Strategy
      })();
    }

    return () => clearInterval(locationInterval);
  }, [isOnline, isConnected, socket]);

  // Listen for Request broadcasts!
  useEffect(() => {
    if (!socket) return;
    
    socket.on("newJobRequest", (job: any) => {
      console.log("INCOMING JOB!", job);
      setIncomingJob(job);
    });

  }, [socket]);

  const handleAccept = () => {
    if (!incomingJob || !socket) return;
    
    socket.emit("acceptJob", {
      jobId: incomingJob.id,
      providerId: MOCK_PROVIDER_ID
    });

    setIncomingJob(null);
    Alert.alert("Job Accepted! Proceed to location.");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Duty Status" subtitle={isOnline ? "Online - Ready to work" : "Offline"} />
        <Card.Content>
          {!isConnected && <Text style={styles.error}>Connecting to servers...</Text>}
          
          <Button 
            mode={isOnline ? "contained-tonal" : "contained"}
            buttonColor={isOnline ? 'red' : 'green'}
            onPress={() => setIsOnline(!isOnline)}
            disabled={!isConnected}
          >
            {isOnline ? "Go Offline" : "Go Online 🟢"}
          </Button>
        </Card.Content>
      </Card>

      {/* Aggressive Notification Overlay */}
      {incomingJob && (
        <Card style={styles.alertCard}>
          <Card.Title title="🔥 NEW REQUEST!" subtitle={`Needed: ${incomingJob.categoryNeeded}`} />
          <Card.Content>
            <Text>Distance: (Calculating...)</Text>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>Est Earnings: ₹500</Text>
            
            <Button mode="contained" color="green" style={{marginTop: 15}} onPress={handleAccept}>
              ⚡ ACCEPT FAST
            </Button>
            <Button mode="text" color="grey" onPress={() => setIncomingJob(null)}>
              Ignore
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  card: { padding: 10, elevation: 4 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
  alertCard: { marginTop: 20, backgroundColor: '#ffe6e6', padding: 10, elevation: 10, borderColor: 'red', borderWidth: 2 }
});