import axios from 'axios';
import { API_BASE_URL } from '../config/serviceConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** Default 60s — Render free tier cold start + ML can exceed 10s (was causing plant analyzer timeouts). */
export const axiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

// Add auth token to requests
axiosInstance.interceptors.request.use(async (config) => {
  let token: string | null = null;
  try {
    token = await AsyncStorage.getItem('token');
  } catch (_e) {
    token = null;
  }

  if (!token && Platform.OS === 'web') {
    try {
      token = localStorage.getItem('token');
    } catch (_e) {
      token = null;
    }
  }
  console.log('[API] Request to:', config.url);
  console.log('[API] Token present:', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[API] No auth token found! User may need to login.');
  }
  return config;
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[API] Response from:', response.config.url);
    console.log('[API] Status:', response.status);
    return response;
  },
  (error) => {
    console.error('[API] Error from:', error.config?.url);
    console.error('[API] Status:', error.response?.status);
    console.error('[API] Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('[API] Unauthorized! Token may be expired.');
    }
    
    return Promise.reject(error);
  }
);

export default {
  signup: (data: any) => axiosInstance.post('/auth/signup', data),
  login: (data: any) => axiosInstance.post('/auth/login', data),
  uploadPlant: (formData: any) =>
    axiosInstance.post('/plant/upload-plant', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  getCrops: (params: any) => axiosInstance.get('/crops', { params, timeout: 60000 }),
  getLocationBasedCrops: (params: { lat: number; long: number }) => axiosInstance.get('/crops/location', { params }),
  chatbot: (message: string) =>
    axiosInstance.post('/chatbot', { message }, { timeout: 120000 }),
  
  // Services Marketplace APIs
  // Service Listings
  getServiceListings: (params: any) => axiosInstance.get('/services', { params }),
  getServiceById: (id: string) => axiosInstance.get(`/services/${id}`),
  createServiceListing: (data: any) => axiosInstance.post('/services', data),
  updateServiceListing: (id: string, data: any) => axiosInstance.put(`/services/${id}`, data),
  deleteServiceListing: (id: string) => axiosInstance.delete(`/services/${id}`),
  trackCall: (id: string) => axiosInstance.post(`/services/${id}/track-call`),
  
  // Job Requests
  getJobRequests: (params: any) => axiosInstance.get('/jobs', { params }),
  getJobById: (id: string) => axiosInstance.get(`/jobs/${id}`),
  createJobRequest: (data: any) => axiosInstance.post('/jobs', data),
  updateJobRequest: (id: string, data: any) => axiosInstance.put(`/jobs/${id}`, data),
  deleteJobRequest: (id: string) => axiosInstance.delete(`/jobs/${id}`),
  trackResponse: (id: string) => axiosInstance.post(`/jobs/${id}/track-response`),
  
  // Ratings
  rateProvider: (providerId: string, data: any) => axiosInstance.post(`/users/rate/${providerId}`, data),
  getProviderRatings: (providerId: string, params: any) => axiosInstance.get(`/users/ratings/${providerId}`, { params }),
};
