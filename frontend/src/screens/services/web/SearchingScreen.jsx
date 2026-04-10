import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
// // import css
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const SearchingScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, setJobStatus, activeRequestId } = useService();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation().then(loc => setLocation(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobStatus === 'ACCEPTED') {
      navigation.navigate('OperatorFoundScreen');
    } else if (jobStatus === 'IDLE') {
      alert('No operators found nearby.');
      navigation.navigate('ServicesHome');
    }
  }, [jobStatus, navigation]);

  const handleCancel = () => {
    if (activeRequestId) {
      socketService.farmerCancelRequest(activeRequestId);
    }
    setJobStatus('IDLE');
    navigation.navigate('ServicesHome');
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Map */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {location && (
          <MapContainer center={[location.lat, location.lng]} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.lat, location.lng]} />
          </MapContainer>
        )}
      </div>

      {/* Radar Animation Overlay */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 bg-[#52B788] rounded-full flex items-center justify-center relative mb-8">
          <div className="absolute w-full h-full border-4 border-[#52B788] rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute w-[150%] h-[150%] border-2 border-[#52B788] rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
          <span className="text-4xl">🚜</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Searching for nearby operators...</h2>
        <p className="text-gray-400 mb-12">Please wait while we connect you</p>

        <button
          onClick={handleCancel}
          className="px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl font-semibold transition-all"
        >
          Cancel Request
        </button>
      </div>
      
      {/* Tailwind specific custom animations can go into global.css, assuming ping works out of box */}
    </div>
  );
};

export default SearchingScreen;
