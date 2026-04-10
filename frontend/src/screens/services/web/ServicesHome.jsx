import React, { useState } from 'react';
import { useService } from '../../../context/ServiceContext';
import CustomerHome from './CustomerHome';
import OperatorHome from './OperatorHome';

const ServicesHome = () => {
  const { userRole, setUserRole } = useService();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role) => {
    setLoading(true);
    try {
      // Set the role in our React Context
      setUserRole(role);
      
      // TODO: Future API hook to save role permanently to the DB
      // await serviceApi.updateProfile({ role });
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setLoading(false);
    }
  };

  // Route to the correct home screen if role is already selected
  if (userRole === 'farmer') return <CustomerHome />;
  if (userRole === 'operator') return <OperatorHome />;

  // Render role selection if null
  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white/5 p-8 rounded-2xl border border-white/10 text-center shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Welcome to FarmMate</h1>
        <p className="text-gray-400 mb-8">Are you looking to book equipment, or are you providing a service?</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => handleSelectRole('farmer')}
            disabled={loading}
            className="w-full py-4 bg-[#52B788] hover:bg-[#40916c] text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center shadow-lg shadow-[#52B788]/20"
          >
            I need a Service
          </button>
          
          <button 
            onClick={() => handleSelectRole('operator')}
            disabled={loading}
            className="w-full py-4 border-2 border-[#52B788] text-[#52B788] hover:bg-[#52B788]/10 rounded-xl font-semibold text-lg transition-all flex items-center justify-center"
          >
            I am an Operator
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesHome;
