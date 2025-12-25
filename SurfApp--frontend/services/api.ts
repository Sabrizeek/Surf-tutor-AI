import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseURL = () => {
  // @ts-ignore - __DEV__ is a global variable in React Native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.8.100:3000'; // Your IP address
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
  timeout: 20000,
});

// ============================================================================
// CARDIO PLANS API - UPDATED TO USE ALL QUIZ DATA
// ============================================================================

export const cardioAPI = {
  getRecommendations: async (
    skillLevel: string,
    goal: string | string[],
    userDetails?: {
      height?: number;
      weight?: number;
      age?: number;
      bmi?: number;
    },
    durationRange?: string,
    limitations?: string[],
    equipment?: string, // ADD THIS PARAMETER
    adaptiveAdjustments?: {
      intensityAdjustment?: number;
      restMultiplierAdjustment?: number;
      setsAdjustment?: number;
      exerciseDifficultyAdjustment?: 'easier' | 'same' | 'harder';
    }
  ) => {
    // Ensure goal is sent as array
    const goalArray = Array.isArray(goal) ? goal : [goal];
    
    const response = await api.post('/api/recommend', {
      skillLevel,
      goal: goalArray,
      userDetails,
      durationRange, // ✅ Now sent to backend
      limitations,   // ✅ Now sent to backend
      equipment: equipment || 'None', // ✅ NEW: Send equipment
      adaptiveAdjustments,
    });
    
    return response.data;
  },
};

// ============================================================================
// OTHER APIs (unchanged)
// ============================================================================

export const progressAPI = {
  saveProgress: async (category?: string, data?: any, completedDrills?: string[], scores?: Record<string, number>, badges?: string[]) => {
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

export const poseAPI = {
  detectPose: async (imageBase64: string, drillId?: string, sessionId?: string) => {
    const response = await api.post('/api/pose/detect', {
      image: imageBase64,
      drillId,
      sessionId,
    });
    return response.data;
  },
};

export default api;