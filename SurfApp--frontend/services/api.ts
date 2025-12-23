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
    // For physical devices, use your computer's IP address
    // For Android emulator, use 10.0.2.2
    // For iOS simulator, use localhost
    if (Platform.OS === 'android') {
      // Check if running on emulator or physical device
      // Physical device: use computer's current IP (192.168.8.100)
      // Emulator: use 10.0.2.2
      return 'http://192.168.8.100:3000'; // Updated IP address
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
  timeout: 20000, // 20 seconds timeout for pose detection (increased for complex model)
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
  register: async (
    email: string,
    password: string,
    name?: string,
    profile?: { age?: number; weight?: number; height?: number; goal?: string | string[]; skillLevel?: string }
  ) => {
    // Send all fields at top level as backend expects
    const requestBody: any = { email, password };
    if (name) requestBody.name = name;
    if (profile) {
      if (profile.age !== undefined) requestBody.age = profile.age;
      if (profile.weight !== undefined) requestBody.weight = profile.weight;
      if (profile.height !== undefined) requestBody.height = profile.height;
      if (profile.goal) requestBody.goal = profile.goal;
      if (profile.skillLevel) requestBody.skillLevel = profile.skillLevel;
    }
    
    const response = await api.post('/api/auth/register', requestBody);
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
    // Verify token exists before making request
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    console.log('[API] Fetching profile with token:', token.substring(0, 20) + '...');
    const response = await api.get('/api/auth/profile');
    console.log('[API] Profile response:', response.data);
    return response.data;
  },

  updateProfile: async (updates: { name?: string; height?: number; weight?: number; age?: number; bio?: string; goal?: string | string[]; skillLevel?: string }) => {
    const response = await api.put('/api/auth/profile', updates);
    return response.data;
  },
};

// Cardio Plans API
export const cardioAPI = {
  getRecommendations: async (skillLevel: string, goal: string | string[], userDetails?: {
    height?: number;
    weight?: number;
    age?: number;
    bmi?: number;
  }) => {
    const userId = await AsyncStorage.getItem('userId');
    // Ensure goal is sent as array
    const goalArray = Array.isArray(goal) ? goal : [goal];
    const response = await api.post('/api/recommend', {
      skillLevel,
      goal: goalArray,
      userId,
      userDetails,
    });
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  saveProgress: async (category?: string, data?: any, completedDrills?: string[], scores?: Record<string, number>, badges?: string[]) => {
    // Support both new categorized format and legacy format
    const body = category && data
      ? { category, data }
      : { completedDrills, scores, badges };
    
    const response = await api.post('/api/progress/save', body);
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

// Session API - Phase 4.3: Session Replay
export const sessionAPI = {
  saveSession: async (sessionData: {
    drillId: string;
    startTime: number;
    endTime: number;
    duration: number;
    landmarksHistory: Array<{
      timestamp: number;
      landmarks: any;
      score: number;
      feedback: string[];
    }>;
    finalScore: number;
    badgesEarned: string[];
    xpEarned: number;
  }) => {
    const userId = await AsyncStorage.getItem('userId');
    const response = await api.post('/api/sessions/save', {
      userId,
      ...sessionData,
    });
    return response.data;
  },
  
  getSessions: async (options?: {
    drillId?: string;
    limit?: number;
    skip?: number;
  }) => {
    const response = await api.get('/api/sessions', { params: options });
    return response.data;
  },
  
  getSession: async (sessionId: string) => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },
};

// Pose Detection API
export const poseAPI = {
  detectPose: async (imageBase64: string, drillId?: string, sessionId?: string) => {
    const response = await api.post('/api/pose/detect', {
      image: imageBase64,
      drillId,
      sessionId, // For velocity tracking (Phase 5)
    });
    return response.data;
  },
};

export default api;

