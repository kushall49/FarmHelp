import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation } from '../../../services/locationService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// // import css
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CATEGORIES = ['Tractor', 'Harvester', 'Ploughing', 'Seeding', 'Irrigation', 'Pesticide', 'Farm Labor', 'Transport'];

const getFarmerIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.userId || decoded.id || null;
  } catch (error) {
    return null;
  }
};

const CustomerHome = () => {
  const navigation = useNavigation();
  const { setJobStatus, setCurrentRequest } = useService();
  const [location, setLocation] = useState(null);
  const [selectedEquip, setSelectedEquip] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Assumption: getCurrentLocation returns structured { lat, lng } or throws
    getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => console.error("Location error:", err));
  }, []);

  const handleRequest = () => {
    if (!location || !selectedEquip) return;
    const farmerId = getFarmerIdFromToken();
    if (!farmerId) {
      alert('Please login again to create a request.');
      return;
    }
    setLoading(true);
    setJobStatus('SEARCHING');
    setCurrentRequest(null);
    socketService.farmerRequestService(farmerId, selectedEquip, [location.lng, location.lat]);
    navigation.navigate('SearchingScreen');
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      <div className="h-64 w-full bg-gray-800 relative z-0">
        {location ? (
          <MapContainer center={[location.lat, location.lng]} zoom={13} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.lat, location.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">Getting location...</div>
        )}
      </div>

      <div className="flex-1 p-6 z-10 -mt-4 bg-[#1A1A2E] rounded-t-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-bold mb-4 text-[#52B788]">Select Equipment</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedEquip(cat)}
              className={`px-4 py-2 rounded-full border border-[#52B788] transition-all ${
                selectedEquip === cat ? 'bg-[#52B788] text-white' : 'text-[#52B788] hover:bg-[#52B788]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleRequest}
          disabled={!location || !selectedEquip || loading}
          className="w-full py-4 bg-[#52B788] disabled:bg-gray-600 disabled:text-gray-400 hover:bg-[#40916c] text-white rounded-xl font-semibold text-lg transition-all"
        >
          {loading ? 'Requesting...' : 'Request Now'}
        </button>
      </div>
    </div>
  );
};

export default CustomerHome;
