import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Optional: If you have a user Context or AsyncStorage, import it here to get the farmerId/providerId

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  currentJob: any | null; // Detailed tracking of the active job
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  isConnected: false,
  currentJob: null,
});

export const useSocket = () => useContext(SocketContext);

// Dynamic IP setup for Expo so it always connects automatically whether on Web or Phone
const getLocalIP = () => {
  if (Platform.OS === 'web') return 'http://127.0.0.1:6060';
  const debuggerHost = (Constants.expoConfig as any)?.hostUri || Constants.manifest?.debuggerHost || '127.0.0.1:19000';
  const ip = debuggerHost.split(':')[0];
  return `http://${ip}:6060`;
};

const SOCKET_URL = getLocalIP();

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);

  useEffect(() => {
    // 1. Establish Real-Time Connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🔗 WebSocket Connected: ', socketInstance.id);
      setIsConnected(true);
      
      // If we had a logged in user, we could register them here:
      // socketInstance.emit("registerFarmer", { farmerId: "USER_ID_HERE" });
    });

    socketInstance.on('disconnect', () => {
      console.log('⚠️ WebSocket Disconnected');
      setIsConnected(false);
    });

    // 2. Listen for Global Job Updates
    socketInstance.on('jobAccepted', (job) => {
      console.log('✅ Job Accepted by Provider: ', job);
      setCurrentJob(job);
    });

    socketInstance.on('jobConfirmed', (job) => {
      console.log('🤝 Job Confirmed for Provider: ', job);
      setCurrentJob(job);
    });

    socketInstance.on('locationUpdated', (data) => {
      // Background Location Ack
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, currentJob }}>
      {children}
    </SocketContext.Provider>
  );
};
