import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// // import css
import L from 'leaflet';
import { getCurrentLocation } from '../../../services/locationService';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const JobActiveScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, operatorLocation, currentRequest } = useService();
  const [myLocation, setMyLocation] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    getCurrentLocation().then(loc => setMyLocation(loc)).catch(() => {});
    
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (jobStatus === 'COMPLETED') {
      navigation.navigate('JobCompleteScreen');
    }
  }, [jobStatus, navigation]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const operatorInfo = currentRequest?.operatorId || {};

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      <div className="p-4 bg-[#52B788]/10 text-center flex items-center justify-center gap-3">
        <div className="w-3 h-3 bg-[#52B788] rounded-full animate-pulse"></div>
        <span className="font-bold text-[#52B788] tracking-wider uppercase">Job In Progress</span>
      </div>

      <div className="flex-1 relative">
        {(myLocation || operatorLocation) && (
          <MapContainer 
            center={myLocation ? [myLocation.lat, myLocation.lng] : [0,0]} 
            zoom={15} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {myLocation && <Marker position={[myLocation.lat, myLocation.lng]}><Popup>You</Popup></Marker>}
            {operatorLocation && <Marker position={[operatorLocation.lat, operatorLocation.lng]}><Popup>Operator</Popup></Marker>}
          </MapContainer>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 shadow-2xl z-10 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400 text-sm uppercase tracking-wide">Elapsed Time</div>
          <div className="text-4xl font-mono font-light text-[#52B788]">{formatTime(seconds)}</div>
        </div>

        <div className="p-4 bg-[#1A1A2E] rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">OPERATOR</p>
            <h3 className="font-bold">{operatorInfo.name || 'Operator'}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">EQUIPMENT</p>
            <p className="font-semibold text-[#52B788]">{operatorInfo.equipmentType || 'Tractor'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobActiveScreen;
