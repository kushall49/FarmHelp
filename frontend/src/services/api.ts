import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use localhost for web, local IP for mobile devices
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:4000/api' 
  : 'http://172.21.146.174:4000/api';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
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
api.interceptors.response.use(
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
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  uploadPlant: (formData: any) => api.post('/plant/upload-plant', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getCrops: (params: any) => api.get('/crops', { params }),
  chatbot: (message: string) => api.post('/chatbot', { message }),
  
  // Services Marketplace APIs
  // Service Listings
  getServiceListings: (params: any) => api.get('/services', { params }),
  getServiceById: (id: string) => api.get(`/services/${id}`),
  createServiceListing: (data: any) => api.post('/services', data),
  updateServiceListing: (id: string, data: any) => api.put(`/services/${id}`, data),
  deleteServiceListing: (id: string) => api.delete(`/services/${id}`),
  trackCall: (id: string) => api.post(`/services/${id}/track-call`),
  
  // Job Requests
  getJobRequests: (params: any) => api.get('/jobs', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJobRequest: (data: any) => api.post('/jobs', data),
  updateJobRequest: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  deleteJobRequest: (id: string) => api.delete(`/jobs/${id}`),
  trackResponse: (id: string) => api.post(`/jobs/${id}/track-response`),
  
  // Ratings
  rateProvider: (providerId: string, data: any) => api.post(`/users/rate/${providerId}`, data),
  getProviderRatings: (providerId: string, params: any) => api.get(`/users/ratings/${providerId}`, { params }),
};
