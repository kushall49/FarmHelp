import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketService from '../services/socketService';
import { serviceApi, ServiceRequest, Operator } from '../services/serviceApi';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  return AsyncStorage.getItem('token');
};

// Note: Because there is no existing AuthContext in your src/context/ folder, 
// we fetch the token from AsyncStorage. Wrapping this Provider around your 
// ServicesStack ensures it only mounts after the user logs in and navigates there.
// If you eventually build an AuthContext, simply swap AsyncStorage with `const { token } = useAuth()`

type JobStatus = 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'OTP_VERIFIED' | 'IN_PROGRESS' | 'COMPLETED';

interface ServiceState {
  userRole: 'farmer' | 'operator' | null;
  isOnline: boolean;
  jobStatus: JobStatus;
  currentRequest: ServiceRequest | null;
  operatorLocation: { lat: number; lng: number } | null;
  nearbyOperators: Operator[];
  otp: string | null;
  activeRequestId: string | null;
  incomingRequest: any | null;
}

interface ServiceActions {
  setUserRole: (role: 'farmer' | 'operator' | null) => void;
  setIsOnline: (status: boolean) => void;
  setJobStatus: (status: JobStatus) => void;
  setCurrentRequest: (req: ServiceRequest | null) => void;
  setOperatorLocation: (loc: { lat: number; lng: number } | null) => void;
  setNearbyOperators: (ops: Operator[]) => void;
  setOtp: (otp: string | null) => void;
  setActiveRequestId: (id: string | null) => void;
  setIncomingRequest: (req: any | null) => void;
  resetServiceState: () => void;
}

type ServiceContextType = ServiceState & ServiceActions;

const initialState: ServiceState = {
  userRole: null,
  isOnline: false,
  jobStatus: 'IDLE',
  currentRequest: null,
  operatorLocation: null,
  nearbyOperators: [],
  otp: null,
  activeRequestId: null,
  incomingRequest: null,
};

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ServiceState>(initialState);
  // Optional: If you ever add an AuthContext, use this instead of manual AsyncStorage reads
  // const { token } = useAuth();
  const [localToken, setLocalToken] = useState<string | null>(null);

  // ==========================================
  // ACTIONS
  // ==========================================
  const setUserRole = (role: 'farmer' | 'operator' | null) => setState(s => ({ ...s, userRole: role }));
  const setIsOnline = (status: boolean) => setState(s => ({ ...s, isOnline: status }));
  const setJobStatus = (status: JobStatus) => setState(s => ({ ...s, jobStatus: status }));
  const setCurrentRequest = (req: ServiceRequest | null) => setState(s => ({ ...s, currentRequest: req }));
  const setOperatorLocation = (loc: { lat: number; lng: number } | null) => setState(s => ({ ...s, operatorLocation: loc }));
  const setNearbyOperators = (ops: Operator[]) => setState(s => ({ ...s, nearbyOperators: ops }));
  const setOtp = (otp: string | null) => setState(s => ({ ...s, otp }));
  const setActiveRequestId = (id: string | null) => setState(s => ({ ...s, activeRequestId: id }));
  const setIncomingRequest = (req: any | null) => setState(s => ({ ...s, incomingRequest: req }));
  
  const resetServiceState = () => {
    setState(prev => ({
      ...initialState,
      userRole: prev.userRole, // preserve role across resets
      isOnline: prev.isOnline  // preserve online status
    }));
  };

  // Bootstrap Token Check
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getToken();
      if (storedToken) setLocalToken(storedToken);
    };
    fetchToken();
  }, []);

  // ==========================================
  // INITIALIZATION: Fetch Active Request
  // ==========================================
  useEffect(() => {
    const initializeServiceState = async () => {
      try {
        if (!localToken) return;

        const response = await serviceApi.getActiveRequest();
        if (response.success && response.request) {
          const req = response.request;
          
          setState(prev => ({
            ...prev,
            currentRequest: req,
            jobStatus: req.status as JobStatus,
            activeRequestId: req._id,
            otp: req.otp || null
          }));

          if (req.operatorId && req.operatorId.location) {
             setState(prev => ({
               ...prev,
               operatorLocation: {
                 lat: req.operatorId.location.coordinates[1],
                 lng: req.operatorId.location.coordinates[0]
               }
             }));
          }
        } else {
          setJobStatus('IDLE');
        }
      } catch (err) {
        console.log('[ServiceContext] No active request found or error fetching:', err);
        setJobStatus('IDLE');
      }
    };

    initializeServiceState();
  }, [localToken]);

  // ==========================================
  // SOCKET LISTENER REGISTRATION
  // ==========================================
  useEffect(() => {
    if (!localToken) return;

    socketService.connect();

    socketService.registerListeners({
      onIncomingRequest: (data) => {
        console.log('[Socket] Incoming Request:', data);
        setIncomingRequest(data);
      },
      onJobConfirmed: (request) => {
        console.log('[Socket] Job Confirmed:', request);
        setCurrentRequest(request);
        setJobStatus('ACCEPTED');
        setActiveRequestId(request._id);
        setIncomingRequest(null);
      },
      onRequestAccepted: (data) => {
        console.log('[Socket] Request Accepted:', data);
        setCurrentRequest(data.request);
        setJobStatus('ACCEPTED');
        setOtp(data.otp);
        setActiveRequestId(data.request._id);
        
        if (data.request.operatorId && data.request.operatorId.location) {
          setOperatorLocation({
            lat: data.request.operatorId.location.coordinates[1],
            lng: data.request.operatorId.location.coordinates[0]
          });
        }
      },
      onOtpVerified: (request) => {
        console.log('[Socket] OTP Verified:', request);
        setCurrentRequest(request);
        // FIX: explicitly use OTP_VERIFIED
        setJobStatus('OTP_VERIFIED');
      },
      onOperatorLocationUpdate: (data) => {
        setOperatorLocation({
          lat: data.coordinates[1],
          lng: data.coordinates[0]
        });
      },
      onNoOperators: (data) => {
        console.log('[Socket] No operators:', data);
        setJobStatus('IDLE');
        setCurrentRequest(null);
        setActiveRequestId(null);
        alert(data.message || 'No operators found nearby');
      },
      onJobCompleted: (request) => {
        console.log('[Socket] Job Completed:', request);
        setCurrentRequest(request);
        setJobStatus('COMPLETED');
      },
      onError: (err) => {
        console.error('[Socket] Error:', err);
        alert(err.message || 'An error occurred');
      },
      onConnectError: (err) => {
        console.warn('[Socket] Connection failed. Connecting to server...', err.message);
        if (Platform.OS === 'web') {
          // Non-blocking for web
          console.log('Connecting to server...');
        } else {
          // Native toast - generic warning, don't crash
          console.warn('Connecting to server...');
        }
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [localToken]); // Triggers when the token is successfully established

  return (
    <ServiceContext.Provider
      value={{
        ...state,
        setUserRole,
        setIsOnline,
        setJobStatus,
        setCurrentRequest,
        setOperatorLocation,
        setNearbyOperators,
        setOtp,
        setActiveRequestId,
        setIncomingRequest,
        resetServiceState
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================
export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};