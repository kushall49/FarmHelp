import React, { useEffect, useState } from 'react';
import { useService } from '../../../context/ServiceContext';
import socketService from '../../../services/socketService';
import { getCurrentLocation, startLocationBroadcast, stopLocationBroadcast } from '../../../services/locationService';
import IncomingRequestModal from './IncomingRequestModal';
import { serviceApi } from '../../../services/serviceApi';

const CATEGORIES = ['Tractor', 'Harvester', 'Ploughing', 'Seeding', 'Irrigation', 'Pesticide', 'Farm Labor', 'Transport'];

const OperatorHome = () => {
  const { isOnline, setIsOnline, incomingRequest, activeRequestId } = useService();
  const [stats, setStats] = useState({ totalJobs: 0, rating: 5.0 });
  const [operatorProfile, setOperatorProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', equipmentType: '' });
  const [saving, setSaving] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await serviceApi.getOperatorProfile();
        if (response?.success && response.operator) {
          setOperatorProfile(response.operator);
          setForm({
            name: response.operator.name || '',
            phone: response.operator.phone || '',
            equipmentType: response.operator.equipmentType || '',
          });
          setStats({
            totalJobs: response.operator.totalJobs || 0,
            rating: response.operator.rating || 5.0,
          });
        }
      } catch (_error) {
        // Profile doesn't exist yet; show registration form.
      }
    };
    loadProfile();
  }, []);

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.equipmentType) {
      alert('Please fill name, phone and equipment category.');
      return;
    }
    try {
      setSaving(true);
      const response = await serviceApi.registerOperator(form);
      if (response.success) {
        setOperatorProfile(response.operator);
        setStats({
          totalJobs: response.operator.totalJobs || 0,
          rating: response.operator.rating || 5.0,
        });
      }
    } catch (error) {
      alert('Unable to save operator profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleOnline = async () => {
    if (!operatorProfile?._id) {
      alert('Please register your service details first.');
      return;
    }
    if (!isOnline) {
      try {
        // Ensure socket is connected (otherwise emits can be queued/dropped).
        const sock = socketService.connect();
        sock.on('connect', () => setSocketStatus('connected'));
        sock.on('disconnect', () => setSocketStatus('disconnected'));
        sock.on('connect_error', (e) => {
          console.warn('[socket] connect_error', e?.message || e);
          setSocketStatus('error');
        });

        const loc = await getCurrentLocation();
        socketService.operatorGoOnline(operatorProfile._id, {
          coordinates: [loc.lng, loc.lat]
        });
        startLocationBroadcast(operatorProfile._id, activeRequestId || null);
        setIsOnline(true);
      } catch (err) {
        console.error('Failed to go online:', err);
        const msg =
          err?.message ||
          (typeof err === 'string' ? err : null) ||
          'Could not get location. Ensure GPS is enabled and permission is allowed.';
        alert(msg);
      }
    } else {
      socketService.operatorGoOffline(operatorProfile._id);
      stopLocationBroadcast();
      setIsOnline(false);
    }
  };

  useEffect(() => {
    if (isOnline && operatorProfile?._id) {
      startLocationBroadcast(operatorProfile._id, activeRequestId || null);
    }
  }, [activeRequestId, isOnline, operatorProfile]);

  useEffect(() => {
    return () => {
      if (isOnline && operatorProfile?._id) {
        stopLocationBroadcast();
        socketService.operatorGoOffline(operatorProfile._id);
      }
    };
  }, [isOnline, operatorProfile]);

  if (!operatorProfile) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-2">Operator Registration</h2>
          <p className="text-gray-400 mb-6">Tell farmers what service you provide.</p>
          <input
            className="w-full mb-3 p-3 rounded-lg bg-[#0F172A] border border-white/20"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full mb-3 p-3 rounded-lg bg-[#0F172A] border border-white/20"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="w-full mb-4 p-3 rounded-lg bg-[#0F172A] border border-white/20"
            value={form.equipmentType}
            onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}
          >
            <option value="">Select equipment/service type</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button
            onClick={handleRegister}
            disabled={saving}
            className="w-full py-3 bg-[#52B788] hover:bg-[#40916c] rounded-xl font-bold"
          >
            {saving ? 'Saving...' : 'Register as Operator'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-6 flex flex-col items-center">
      {incomingRequest && <IncomingRequestModal />}

      <h1 className="text-3xl font-bold mb-8 mt-10">Operator Dashboard</h1>

      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center mb-8 shadow-xl">
        <div className={`w-32 h-32 rounded-full mb-6 flex items-center justify-center relative transition-colors ${
          isOnline ? 'bg-[#52B788]/20' : 'bg-gray-800'
        }`}>
          {isOnline && (
            <div className="absolute w-full h-full rounded-full border-4 border-[#52B788] animate-ping opacity-50"></div>
          )}
          <div className={`w-24 h-24 rounded-full shadow-inner ${isOnline ? 'bg-[#52B788]' : 'bg-gray-600'}`}></div>
        </div>

        <h2 className="text-2xl font-bold mb-2">{isOnline ? 'You are Online' : 'You are Offline'}</h2>
        <p className="text-gray-400 text-center mb-8">
          {isOnline ? 'Waiting for service requests...' : 'Go online to start receiving jobs'}
        </p>

        <button
          onClick={toggleOnline}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isOnline 
              ? 'bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30' 
              : 'bg-[#52B788] text-white hover:bg-[#40916c]'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        <div className="bg-[#1A1A2E] border border-white/10 p-6 rounded-2xl text-center">
          <p className="text-gray-400 text-sm mb-2">Total Jobs</p>
          <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
        </div>
        <div className="bg-[#1A1A2E] border border-white/10 p-6 rounded-2xl text-center">
          <p className="text-gray-400 text-sm mb-2">Rating</p>
          <p className="text-3xl font-bold text-yellow-400">★ {stats.rating.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default OperatorHome;
