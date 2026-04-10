import { axiosInstance as api } from './api';

export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface Operator {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  equipmentType: string;
  isOnline: boolean;
  location: LocationPoint;
  rating: number;
  totalJobs: number;
}

export interface ServiceRequest {
  _id: string;
  farmerId: any;
  operatorId: any;
  equipmentType: string;
  status: string;
  farmerLocation: LocationPoint;
  otp?: string;
  otpExpiry?: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
  createdAt: string;
}

export const serviceApi = {
  registerOperator: async (data: { name: string; phone: string; equipmentType: string }) => {
    const response = await api.post<{ success: boolean; operator: Operator }>('/services/operator/register', data);
    return response.data;
  },
  
  getOperatorProfile: async () => {
    const response = await api.get<{ success: boolean; operator: Operator }>('/services/operator/profile');
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get<{ success: boolean; history: ServiceRequest[] }>('/services/history');
    return response.data;
  },
  
  getActiveRequest: async () => {
    const response = await api.get<{ success: boolean; request: ServiceRequest | null }>('/services/active');
    return response.data;
  },
  
  rateRequest: async (requestId: string, rating: number) => {
    const response = await api.post<{ success: boolean; request: ServiceRequest }>(`/services/rate/${requestId}`, { rating });
    return response.data;
  }
};