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

const OperatorFoundScreen = () => {
  const navigation = useNavigation();
  const { jobStatus, currentRequest, operatorLocation, otp } = useService();
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation().then(loc => setMyLocation(loc)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobStatus === 'OTP_VERIFIED') {
      navigation.navigate('JobActiveScreen');
    }
  }, [jobStatus, navigation]);

  const operatorInfo = currentRequest?.operatorId || {};

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      <div className="flex-1 relative">
        {(myLocation || operatorLocation) && (
          <MapContainer 
            center={operatorLocation ? [operatorLocation.lat, operatorLocation.lng] : (myLocation ? [myLocation.lat, myLocation.lng] : [0,0])} 
            zoom={14} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {myLocation && (
              <Marker position={[myLocation.lat, myLocation.lng]}>
                <Popup>You</Popup>
              </Marker>
            )}
            {operatorLocation && (
              <Marker position={[operatorLocation.lat, operatorLocation.lng]}>
                <Popup>Operator</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 rounded-t-3xl shadow-2xl relative z-10 -mt-6 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-[#52B788]">Operator Found!</h2>
        
        <div className="bg-[#1A1A2E] p-4 rounded-xl mb-6 flex items-center justify-between border border-white/10">
          <div>
            <h3 className="font-bold text-lg">{operatorInfo.name || 'Operator'}</h3>
            <p className="text-gray-400">{operatorInfo.equipmentType || 'Equipment'}</p>
          </div>
          <div className="text-right">
            <span className="text-yellow-400 font-bold">★ {operatorInfo.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        <div className="text-center p-6 bg-[#52B788]/20 border border-[#52B788] rounded-xl">
          <p className="text-gray-300 mb-2">Show this OTP to the operator:</p>
          <span className="text-5xl font-mono tracking-widest text-[#52B788] drop-shadow-md">{otp || '----'}</span>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Waiting for operator to arrive and verify OTP...</p>
      </div>
    </div>
  );
};

export default OperatorFoundScreen;
