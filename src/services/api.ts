import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - adjust for your environment
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
import { Platform } from 'react-native';

const getBaseURL = () => {
  // @ts-ignore - __DEV__ is a global variable in React Native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      // For physical device via USB, use your computer's IP address
      // Your IP: 172.28.18.132 (found via ipconfig)
      // For Android emulator, use: 'http://10.0.2.2:3000'
      // For physical device, use your computer's IP:
      return 'http://172.28.18.132:3000'; // Physical device (change to 10.0.2.2 for emulator)
    }
    return 'http://localhost:3000'; // iOS simulator
  }
  return 'https://your-production-api.com';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name?: string) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.user._id);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.user._id);
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (updates: { name?: string; height?: number; weight?: number; age?: number; bio?: string }) => {
    const response = await api.put('/api/auth/profile', updates);
    return response.data;
  },
};

// Cardio Plans API
export const cardioAPI = {
  getRecommendations: async (skillLevel: string, goal: string, userDetails?: {
    height?: number;
    weight?: number;
    age?: number;
    bmi?: number;
  }) => {
    const userId = await AsyncStorage.getItem('userId');
    const response = await api.post('/api/recommend', {
      skillLevel,
      goal,
      userId,
      userDetails,
    });
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  saveProgress: async (completedDrills: string[], scores: Record<string, number>, badges: string[]) => {
    const response = await api.post('/api/progress/save', {
      completedDrills,
      scores,
      badges,
    });
    return response.data;
  },

  loadProgress: async () => {
    const response = await api.get('/api/progress/load');
    return response.data;
  },
};

// Gamification API
export const gamificationAPI = {
  awardPoints: async (points: number, badge?: string, streak?: number) => {
    const response = await api.post('/api/gamification/award', {
      points,
      badge,
      streak,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/gamification/stats');
    return response.data;
  },
};

export default api;

