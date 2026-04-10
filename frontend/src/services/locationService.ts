import { Platform } from 'react-native';
import socketService from './socketService';

const getLocation = () => {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return navigator.geolocation
  }
  return null
}

let broadcastInterval: ReturnType<typeof setInterval> | null = null;

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    const geo = getLocation();
    if (!geo) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }
    
    geo.getCurrentPosition(
      (position: any) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error: any) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

export const startLocationBroadcast = (operatorId: string, activeRequestId: string | null = null) => {
  // Clear any existing broadcast to avoid duplicate intervals
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
  }

  broadcastInterval = setInterval(async () => {
    try {
      const loc = await getCurrentLocation();
      
      // Emit the update via socketService
      // MongoDB GeoJSON format is [longitude, latitude]
      socketService.operatorUpdateLocation(
        operatorId,
        { coordinates: [loc.lng, loc.lat] },
        activeRequestId
      );
      
    } catch (err) {
      console.error('Error broadcasting location:', err);
    }
  }, 3000); // Update every 3 seconds
};

export const stopLocationBroadcast = () => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
};