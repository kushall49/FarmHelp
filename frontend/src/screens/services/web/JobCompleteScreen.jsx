import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import { serviceApi } from '../../../services/serviceApi';

const JobCompleteScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, resetServiceState } = useService();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentRequest?._id) return;
    setSubmitting(true);
    try {
      await serviceApi.rateRequest(currentRequest._id, rating);
    } catch (error) {
      console.error('Rating error:', error);
    } finally {
      resetServiceState();
      navigation.navigate('ServicesHome');
    }
  };

  const operatorInfo = currentRequest?.operatorId || {};

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#52B788]"></div>
        
        <div className="w-20 h-20 bg-[#52B788]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>

        <h2 className="text-3xl font-bold mb-2">Job Completed!</h2>
        <p className="text-gray-400 mb-8">Thank you for using FarmMate Services.</p>

        <div className="bg-[#1A1A2E] p-4 rounded-xl border border-white/5 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Operator</p>
          <p className="font-semibold text-lg">{operatorInfo.name || 'Operator'}</p>
          <div className="w-full h-px bg-white/10 my-3"></div>
          <p className="text-sm text-gray-500 mb-1">Equipment</p>
          <p className="font-semibold text-[#52B788]">{operatorInfo.equipmentType || 'Equipment'}</p>
        </div>

        <div className="mb-8">
          <p className="mb-4 font-semibold">Rate your experience</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-4xl transition-transform ${
                  star <= (hoverRating || rating) ? 'text-yellow-400 scale-110' : 'text-gray-600 grayscale'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full py-4 bg-[#52B788] disabled:bg-gray-600 disabled:opacity-50 hover:bg-[#40916c] text-white rounded-xl font-bold transition-all"
        >
          {submitting ? 'Submitting...' : 'Submit & Home'}
        </button>
      </div>
    </div>
  );
};

export default JobCompleteScreen;
