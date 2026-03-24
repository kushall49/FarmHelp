import { Platform } from 'react-native';

// API configuration
// Use localhost for web, local IP for mobile devices
const API_BASE_URL = Platform.OS === 'web' 
  ? (process.env.API_URL || 'http://localhost:4000')
  : (process.env.EXPO_PUBLIC_API_URL || 'http://10.253.160.3:4000');

export async function uploadImage(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/plant/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Upload error:', error);
    throw error;
  }
}

export async function getLastAnalyses(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/plant/last`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Get analyses error:', error);
    throw error;
  }
}

export async function findNearbyMachines(lng, lat, radius = 5000) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/machines/nearby?lng=${lng}&lat=${lat}&radius=${radius}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Find machines error:', error);
    throw error;
  }
}
