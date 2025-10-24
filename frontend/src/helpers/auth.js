import AsyncStorage from '@react-native-async-storage/async-storage';

const JWT_KEY = 'userJwt';

// Test token for development
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NGFiYzEyMzQ1Njc4OTBhYmNkZWYwMSIsInBob25lIjoiOTk5OTk5OTk5OSIsIm5hbWUiOiJUZXN0IEZhcm1lciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.test-signature';

export async function getJwt() {
  try {
    // Try to get stored JWT
    const token = await AsyncStorage.getItem(JWT_KEY);
    if (token) {
      console.log('[AUTH] Using stored JWT');
      return token;
    }

    // For development, use test token
    console.log('[AUTH] Using test JWT for development');
    await AsyncStorage.setItem(JWT_KEY, TEST_TOKEN);
    return TEST_TOKEN;
  } catch (error) {
    console.error('[AUTH] Error getting JWT:', error);
    return TEST_TOKEN; // Fallback to test token
  }
}

export async function setJwt(token) {
  try {
    await AsyncStorage.setItem(JWT_KEY, token);
    console.log('[AUTH] JWT stored');
  } catch (error) {
    console.error('[AUTH] Error storing JWT:', error);
  }
}

export async function clearJwt() {
  try {
    await AsyncStorage.removeItem(JWT_KEY);
    console.log('[AUTH] JWT cleared');
  } catch (error) {
    console.error('[AUTH] Error clearing JWT:', error);
  }
}

// Helper to create test token from backend
export async function createTestToken() {
  try {
    const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/auth/test-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create test token');
    }

    const data = await response.json();
    await setJwt(data.token);
    return data.token;
  } catch (error) {
    console.error('[AUTH] Error creating test token:', error);
    throw error;
  }
}
