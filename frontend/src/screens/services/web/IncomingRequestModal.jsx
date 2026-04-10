import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// // import css
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const IncomingRequestModal = () => {
  const navigation = useNavigation();
  const { incomingRequest, setIncomingRequest } = useService();
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!incomingRequest) return;

    setCountdown(20);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleReject(); // auto reject
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingRequest]);

  const handleAccept = () => {
    if (!incomingRequest) return;
    const operatorId = incomingRequest.operatorId || incomingRequest.operator?._id;
    if (!operatorId) {
      alert('Operator profile missing. Please register again.');
      return;
    }
    socketService.operatorAcceptRequest(incomingRequest.requestId, operatorId);
    navigation.navigate('NavigateToFarmerScreen');
  };

  const handleReject = () => {
    if (!incomingRequest) return;
    socketService.operatorRejectRequest(incomingRequest.requestId);
    setIncomingRequest(null);
  };

  if (!incomingRequest) return null;

  const reqLoc = incomingRequest.farmerLocation?.coordinates || [0, 0];
  const distanceMsg = incomingRequest.distanceText || 'Distance unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1A1A2E] border border-[#52B788] rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100">
        
        {/* Map Header */}
        <div className="h-40 w-full relative pointer-events-none">
          <MapContainer center={[reqLoc[1], reqLoc[0]]} zoom={14} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[reqLoc[1], reqLoc[0]]}></Marker>
          </MapContainer>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] to-transparent z-10"></div>
        </div>

        <div className="p-6 relative z-20 -mt-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">New Job Request</h2>
              <p className="text-[#52B788] font-semibold">{incomingRequest.equipmentType} Needed</p>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
              {distanceMsg}
            </div>
          </div>

          <div className="w-full h-2 bg-gray-800 rounded-full mb-2 overflow-hidden">
            <div 
              className="h-full bg-[#52B788] transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 20) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-400 text-sm mb-6">Auto-rejecting in {countdown}s</p>

          <div className="flex gap-4">
            <button 
              onClick={handleReject}
              className="flex-1 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={handleAccept}
              className="flex-[2] py-3 bg-[#52B788] hover:bg-[#40916c] text-white rounded-xl font-bold shadow-lg shadow-[#52B788]/30 transition-colors"
            >
              Accept Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingRequestModal;
