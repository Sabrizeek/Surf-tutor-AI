import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ============================================================
 * API BASE URL (PHYSICAL PHONE – STABLE CONFIG)
 * ============================================================
 * Your PC IPv4 (from ipconfig): 192.168.8.101
 * Backend running on: http://localhost:3000
 * Phone + PC MUST be on same WiFi
 */
const API_BASE_URL = 'http://192.168.8.101:3000';

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 */
export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/health', { timeout: 5000 });
    return res.status === 200;
  } catch (err) {
    console.warn('[API] Backend health check failed');
    return false;
  }
};

/**
 * ============================================================
 * RESPONSE INTERCEPTOR (LIGHT LOGGING)
 * ============================================================
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.warn('[API] Backend unreachable. Check IP / WiFi / Firewall');
    }
    return Promise.reject(error);
  }
);

/**
 * ============================================================
 * POSE API (NATIVE EDGE AI – STUB)
 * ============================================================
 */
export const poseAPI = {
  detectPose: async () => {
    return {
      success: true,
      personDetected: false,
      landmarks: null,
    };
  },

  healthCheck: async () => {
    return { status: 'ok', mode: 'native_edge_ai' };
  },
};

/**
 * ============================================================
 * CARDIO PLANS API
 * ============================================================
 */
export const cardioAPI = {
  getRecommendations: async (
    skillLevel,
    goal,
    userDetails,
    durationRange,
    limitations,
    equipment,
    adaptiveAdjustments
  ) => {
    const goalArray = Array.isArray(goal) ? goal : [goal];

    const response = await api.post('/api/recommend', {
      skillLevel,
      goal: goalArray,
      userDetails,
      durationRange,
      limitations,
      equipment: equipment || 'None',
      adaptiveAdjustments,
    });

    return response.data;
  },
};

/**
 * ============================================================
 * PROGRESS API
 * ============================================================
 */
export const progressAPI = {
  saveProgress: async (category, data, completedDrills, scores, badges) => {
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

/**
 * ============================================================
 * GAMIFICATION API
 * ============================================================
 */
export const gamificationAPI = {
  awardPoints: async (points, badge, streak) => {
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

/**
 * ============================================================
 * SESSION API
 * ============================================================
 */
export const sessionAPI = {
  saveSession: async (sessionData) => {
    const userId = await AsyncStorage.getItem('userId');

    const response = await api.post('/api/sessions/save', {
      userId,
      ...sessionData,
    });

    return response.data;
  },

  getSessions: async (options) => {
    const response = await api.get('/api/sessions', { params: options });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },
};

export default api;
