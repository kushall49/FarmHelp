import { Platform } from 'react-native';

// Allow overriding via environment variables for native and process.env strings, 
// fallback to localhost or LAN IPs respectively
export const SOCKET_URL = Platform.OS === 'web'
  ? process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000'
  : process.env.SOCKET_URL || 'http://172.21.146.174:4000';

export const API_BASE_URL = Platform.OS === 'web'
  ? process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
  : process.env.API_URL || 'http://172.21.146.174:4000/api';
