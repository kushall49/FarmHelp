import axios from 'axios';
import { AuthStorage } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// ---------------------------------------------------------------------------
// TypeScript interfaces
// ---------------------------------------------------------------------------

export interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  state?: string;
  isVerifiedFarmer?: boolean;
  isVerifiedProvider?: boolean;
  avatar?: string;
  bio?: string;
  farmSize?: number;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  images?: string[];
  tags?: string[];
  category?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface ServiceListing {
  _id: string;
  serviceType: string;
  title: string;
  description: string;
  provider: {
    _id: string;
    name: string;
    avatar?: string;
    isVerifiedProvider?: boolean;
  };
  location: {
    district?: string;
    taluk?: string;
    village?: string;
    state?: string;
  };
  phoneNumber: string;
  rate: {
    amount: number;
    unit: string;
  };
  images?: string[];
  isAvailable: boolean;
  views?: number;
  callsReceived?: number;
  averageRating?: number;
  createdAt: string;
}

export interface CropRecommendation {
  name: string;
  score: number;
  reasons: string[];
  yieldPotential?: string;
  marketDemand?: string;
  waterRequirement?: string;
  minTemp?: number;
  maxTemp?: number;
  seasons?: string[];
  suitableSoils?: string[];
}

export interface PlantAnalysisResult {
  crop: string;
  disease: string;
  confidence: number;
  severity?: string;
  recommendations: {
    symptoms: string[];
    chemical: string[];
    organic: string[];
    preventive: string[];
    urgency?: string;
  };
  fertilizers: Array<{
    name: string;
    dosage?: string;
    application?: string;
    legalStatus?: string;
    safetyWarning?: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon?: string;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Request interceptor – attach Bearer token from AuthStorage
client.interceptors.request.use(
  async (config) => {
    const token = await AuthStorage.getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle 401 and network errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AuthStorage.removeToken();
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    if (!error.response) {
      return Promise.reject(
        new Error(
          'Network error. Please check your internet connection and try again.',
        ),
      );
    }

    // Surface the server's error message when available
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  },
);

// ---------------------------------------------------------------------------
// Helper to unwrap axios response data
// ---------------------------------------------------------------------------
async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  const { data } = await promise;
  return data;
}

// ---------------------------------------------------------------------------
// Exported API object
// ---------------------------------------------------------------------------

export const api = {
  // ---- Auth ----------------------------------------------------------------

  register(data: {
    name: string;
    phone: string;
    email?: string;
    state?: string;
    password: string;
  }): Promise<AuthResponse> {
    return request(client.post<AuthResponse>('/auth/register', data));
  },

  login(
    data: { phone: string; password: string } | { email: string; password: string },
  ): Promise<AuthResponse> {
    return request(client.post<AuthResponse>('/auth/login', data));
  },

  getMe(): Promise<{ success: boolean; user: AuthUser }> {
    return request(client.get<{ success: boolean; user: AuthUser }>('/auth/me'));
  },

  updateProfile(
    data: Partial<AuthUser>,
  ): Promise<{ success: boolean; user: AuthUser }> {
    return request(
      client.put<{ success: boolean; user: AuthUser }>('/auth/profile', data),
    );
  },

  // ---- Plant Analysis ------------------------------------------------------

  analyzePlant(
    formData: FormData,
  ): Promise<{ success: boolean; result: PlantAnalysisResult }> {
    return request(
      client.post<{ success: boolean; result: PlantAnalysisResult }>(
        '/plant/analyze',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      ),
    );
  },

  getMyAnalyses(): Promise<{ success: boolean; analyses: any[] }> {
    return request(
      client.get<{ success: boolean; analyses: any[] }>('/plant/my-analyses'),
    );
  },

  // ---- Crops ---------------------------------------------------------------

  getCropRecommendations(params: {
    soil?: string;
    season?: string;
    state?: string;
    acres?: number;
    water?: string;
    budget?: number;
  }): Promise<{
    success: boolean;
    results: CropRecommendation[];
    conditions: object;
  }> {
    return request(
      client.get<{
        success: boolean;
        results: CropRecommendation[];
        conditions: object;
      }>('/crops/recommend', { params }),
    );
  },

  getSavedCrops(): Promise<{ success: boolean; crops: any[] }> {
    return request(
      client.get<{ success: boolean; crops: any[] }>('/crops/saved'),
    );
  },

  saveCrop(cropData: any): Promise<{ success: boolean; crop: any }> {
    return request(
      client.post<{ success: boolean; crop: any }>('/crops/saved', cropData),
    );
  },

  deleteSavedCrop(id: string): Promise<{ success: boolean }> {
    return request(
      client.delete<{ success: boolean }>(`/crops/saved/${id}`),
    );
  },

  // ---- Community -----------------------------------------------------------

  getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<{
    success: boolean;
    posts: Post[];
    total: number;
    page: number;
  }> {
    return request(
      client.get<{
        success: boolean;
        posts: Post[];
        total: number;
        page: number;
      }>('/posts', { params }),
    );
  },

  createPost(data: {
    content: string;
    images?: string[];
    tags?: string[];
    category?: string;
  }): Promise<{ success: boolean; post: Post }> {
    return request(
      client.post<{ success: boolean; post: Post }>('/posts', data),
    );
  },

  likePost(postId: string): Promise<{ success: boolean; likes: number }> {
    return request(
      client.post<{ success: boolean; likes: number }>(`/posts/${postId}/like`),
    );
  },

  addComment(
    postId: string,
    content: string,
  ): Promise<{ success: boolean; comment: any }> {
    return request(
      client.post<{ success: boolean; comment: any }>(
        `/posts/${postId}/comments`,
        { content },
      ),
    );
  },

  deletePost(postId: string): Promise<{ success: boolean }> {
    return request(
      client.delete<{ success: boolean }>(`/posts/${postId}`),
    );
  },

  getPostById(postId: string): Promise<{ success: boolean; post: Post }> {
    return request(
      client.get<{ success: boolean; post: Post }>(`/posts/${postId}`),
    );
  },

  // ---- Services ------------------------------------------------------------

  getServices(params?: {
    district?: string;
    category?: string;
    page?: number;
  }): Promise<{ success: boolean; services: ServiceListing[] }> {
    return request(
      client.get<{ success: boolean; services: ServiceListing[] }>(
        '/services',
        { params },
      ),
    );
  },

  createService(
    data: any,
  ): Promise<{ success: boolean; service: ServiceListing }> {
    return request(
      client.post<{ success: boolean; service: ServiceListing }>(
        '/services',
        data,
      ),
    );
  },

  updateService(
    id: string,
    data: any,
  ): Promise<{ success: boolean; service: ServiceListing }> {
    return request(
      client.put<{ success: boolean; service: ServiceListing }>(
        `/services/${id}`,
        data,
      ),
    );
  },

  deleteService(id: string): Promise<{ success: boolean }> {
    return request(
      client.delete<{ success: boolean }>(`/services/${id}`),
    );
  },

  trackServiceCall(id: string): Promise<{ success: boolean }> {
    return request(
      client.post<{ success: boolean }>(`/services/${id}/track-call`),
    );
  },

  // ---- Chat ----------------------------------------------------------------

  sendMessage(
    message: string,
    history: ChatMessage[],
  ): Promise<{ success: boolean; reply: string }> {
    return request(
      client.post<{ success: boolean; reply: string }>('/chat/message', {
        message,
        history,
      }),
    );
  },

  // ---- Weather -------------------------------------------------------------

  getWeather(
    lat: number,
    lon: number,
  ): Promise<{ success: boolean; weather: WeatherData }> {
    return request(
      client.get<{ success: boolean; weather: WeatherData }>('/weather', {
        params: { lat, lon },
      }),
    );
  },
};

export default api;
