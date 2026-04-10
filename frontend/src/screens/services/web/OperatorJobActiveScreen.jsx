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

const OperatorJobActiveScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, jobStatus, resetServiceState } = useService();
  const [location, setLocation] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    getCurrentLocation().then(loc => setLocation(loc)).catch(() => {});
    
    // Safety check, clear out broadcast or we can let OperatorHome handle it.
    
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
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
    if (jobStatus === 'COMPLETED') {
      resetServiceState();
      navigation.navigate('ServicesHome');
    }
  }, [jobStatus, navigation, resetServiceState]);

  const handleMarkComplete = () => {
    if (!currentRequest?._id) return;
    socketService.operatorMarkComplete(currentRequest._id);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const farmerInfo = currentRequest?.farmerId || {};

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      <div className="p-4 bg-[#52B788]/10 text-center flex items-center justify-center gap-3">
        <div className="w-3 h-3 bg-[#52B788] rounded-full animate-pulse"></div>
        <span className="font-bold text-[#52B788] tracking-wider uppercase">Job In Progress</span>
      </div>

      <div className="flex-1 relative">
        {location && (
          <MapContainer center={[location.lat, location.lng]} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.lat, location.lng]}><Popup>You are Here</Popup></Marker>
          </MapContainer>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 shadow-2xl z-10 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400 text-sm uppercase tracking-wide">Elapsed Time</div>
          <div className="text-4xl font-mono font-light text-[#52B788]">{formatTime(seconds)}</div>
        </div>

        <div className="p-4 bg-[#1A1A2E] rounded-xl border border-white/10 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">FARMER</p>
            <h3 className="font-bold">{farmerInfo.name || 'Farmer'}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">STATUS</p>
            <p className="font-semibold text-blue-400">Active</p>
          </div>
        </div>

        <button
          onClick={handleMarkComplete}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all"
        >
          Mark Job Complete
        </button>
      </div>
    </div>
  );
};

export default OperatorJobActiveScreen;
