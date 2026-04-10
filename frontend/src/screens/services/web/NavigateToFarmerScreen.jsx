import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// // import css
import L from 'leaflet';
import { getCurrentLocation, startLocationBroadcast, stopLocationBroadcast } from '../../../services/locationService';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const NavigateToFarmerScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, jobStatus } = useService();
  const [operatorLoc, setOperatorLoc] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  useEffect(() => {
    getCurrentLocation().then(loc => setOperatorLoc(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    const operatorId = currentRequest?.operatorId?._id;
    const requestId = currentRequest?._id;
    if (operatorId && requestId) {
      startLocationBroadcast(operatorId, requestId);
      return () => stopLocationBroadcast();
    }
    return undefined;
  }, [currentRequest]);

  useEffect(() => {
    if (jobStatus === 'OTP_VERIFIED') {
      navigation.navigate('OperatorJobActiveScreen');
    }
  }, [jobStatus, navigation]);

  const handleVerify = () => {
    if (!currentRequest?._id || enteredOtp.length !== 4) return;
    socketService.operatorVerifyOTP(currentRequest._id, enteredOtp);
  };

  const farmerLoc = currentRequest?.farmerLocation?.coordinates || [0, 0];

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      <div className="p-4 bg-gray-900 border-b border-white/10 text-center">
        <h2 className="font-bold text-lg">Navigate to Farmer</h2>
        <p className="text-sm text-gray-400">Request ID: {currentRequest?._id?.slice(-6)}</p>
      </div>

      <div className="flex-1 relative">
        <MapContainer 
          center={[farmerLoc[1] || 0, farmerLoc[0] || 0]} 
          zoom={14} 
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {farmerLoc[0] !== 0 && (
            <Marker position={[farmerLoc[1], farmerLoc[0]]}>
              <Popup>Farmer Location</Popup>
            </Marker>
          )}
          {operatorLoc && (
            <Marker position={[operatorLoc.lat, operatorLoc.lng]}>
              <Popup>You</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 shadow-2xl relative z-10 -mt-6 rounded-t-3xl backdrop-blur-xl">
        <p className="text-center text-gray-400 mb-4">Enter the 4-digit OTP from the farmer to start the job.</p>
        
        <input 
          type="text"
          maxLength={4}
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-[#1A1A2E] border border-white/20 text-white text-center text-3xl tracking-[1em] py-4 rounded-xl font-mono focus:outline-none focus:border-[#52B788] mb-6"
          placeholder="----"
        />

        <button
          onClick={handleVerify}
          disabled={enteredOtp.length !== 4}
          className="w-full py-4 bg-[#52B788] disabled:bg-gray-600 disabled:opacity-50 hover:bg-[#40916c] text-white rounded-xl font-bold text-lg transition-colors"
        >
          Verify OTP & Start Job
        </button>
      </div>
    </div>
  );
};

export default NavigateToFarmerScreen;
