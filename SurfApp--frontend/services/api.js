import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Get the correct base URL for API requests
 * ⚠️ IMPORTANT: Update YOUR_COMPUTER_IP with your actual IP address for physical devices
 * @returns {string}
 */
const getBaseURL = () => {
  // @ts-ignore - __DEV__ is a global variable in React Native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      // For Android Emulator: use 10.0.2.2 (special IP that maps to host's localhost)
      // For Android Physical Device: use your computer's IP address on the local network
      // To find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
      const IS_EMULATOR = false; // Set to true if using Android emulator
      const YOUR_COMPUTER_IP = '192.168.8.101'; // ✅ CORRECT
 // ⚠️ CHANGE THIS TO YOUR IP for physical devices
      
      if (IS_EMULATOR) {
        return 'http://10.0.2.2:3000'; // Android emulator special IP
      }
      return `http://${YOUR_COMPUTER_IP}:3000`; // Physical Android device
    }
    // iOS simulator can use localhost
    return 'http://localhost:3000';
  }
  return 'https://your-production-api.com';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // ✅ INCREASED from 20000 to 30000 for pose detection
});

/**
 * Health check function to verify backend connectivity
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('[API] Backend health check failed:', error);
    return false;
  }
};

// ✅ Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const method = config.method?.toUpperCase() || 'GET';
    console.log(`[API] ${method} ${url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a9af6247-da90-472c-8617-bf1275ff3bd4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:75',message:'API error interceptor entry',data:{errorCode:error?.code,errorMessage:error?.message,url:error?.config?.url,hasResponse:!!error?.response},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Reduced error logging - backend is optional for progress saving
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a9af6247-da90-472c-8617-bf1275ff3bd4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:77',message:'Network error branch',data:{url:error?.config?.baseURL+error?.config?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Single concise error message instead of 5 separate ones
      const url = error.config?.url || 'unknown';
      console.warn(`[API] Backend unavailable (${url}) - progress saving disabled. Start backend with: cd surfapp--backend && npm start`);
    } else if (error.response) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a9af6247-da90-472c-8617-bf1275ff3bd4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:85',message:'Response error branch',data:{status:error?.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error(`[API] Response error ${error.response.status}:`, error.response.data);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a9af6247-da90-472c-8617-bf1275ff3bd4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:87',message:'Other error branch',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('[API] Request error:', error.message);
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a9af6247-da90-472c-8617-bf1275ff3bd4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:90',message:'API error interceptor exit',data:{rejecting:true},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return Promise.reject(error);
  }
);

// ============================================================================
// POSE DETECTION API - FIXED VERSION
// ============================================================================

export const poseAPI = {
  /**
   * Health check for pose detection service
   * @returns {Promise<any>} Service health status
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/api/pose/health');
      return response.data;
    } catch (error) {
      console.error('[poseAPI] Health check failed:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
};

// ============================================================================
// CARDIO PLANS API
// ============================================================================

export const cardioAPI = {
  /**
   * Get cardio plan recommendations
   * @param {string} skillLevel
   * @param {string|string[]} goal
   * @param {{height?: number, weight?: number, age?: number, bmi?: number}} [userDetails]
   * @param {string} [durationRange]
   * @param {string[]} [limitations]
   * @param {string} [equipment]
   * @param {{intensityAdjustment?: number, restMultiplierAdjustment?: number, setsAdjustment?: number, exerciseDifficultyAdjustment?: 'easier'|'same'|'harder'}} [adaptiveAdjustments]
   * @returns {Promise<any>}
   */
  getRecommendations: async (
    skillLevel,
    goal,
    userDetails,
    durationRange,
    limitations,
    equipment,
    adaptiveAdjustments
  ) => {
    try {
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
    } catch (error) {
      console.error('❌ Error getting recommendations:', error);
      
      // Provide more helpful error messages
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.message?.includes('Network Error')) {
        throw new Error(
          'Cannot connect to backend server. Please ensure:\n' +
          '1. Backend server is running (cd surfapp--backend && npm start)\n' +
          '2. IP address in api.ts matches your computer\'s IP\n' +
          '3. Device/emulator can reach the backend server'
        );
      }
      
      // Re-throw with original error for other cases
      throw error;
    }
  },
};

// ============================================================================
// PROGRESS API
// ============================================================================

export const progressAPI = {
  /**
   * Save progress data
   * @param {string} [category]
   * @param {any} [data]
   * @param {string[]} [completedDrills]
   * @param {Record<string, number>} [scores]
   * @param {string[]} [badges]
   * @returns {Promise<any>}
   */
  saveProgress: async (category, data, completedDrills, scores, badges) => {
    const body = category && data
      ? { category, data }
      : { completedDrills, scores, badges };
    
    const response = await api.post('/api/progress/save', body);
    return response.data;
  },

  /**
   * Load progress data
   * @returns {Promise<any>}
   */
  loadProgress: async () => {
    const response = await api.get('/api/progress/load');
    return response.data;
  },
};

// ============================================================================
// GAMIFICATION API
// ============================================================================

export const gamificationAPI = {
  /**
   * Award points to user
   * @param {number} points
   * @param {string} [badge]
   * @param {number} [streak]
   * @returns {Promise<any>}
   */
  awardPoints: async (points, badge, streak) => {
    const response = await api.post('/api/gamification/award', {
      points,
      badge,
      streak,
    });
    return response.data;
  },

  /**
   * Get gamification stats
   * @returns {Promise<any>}
   */
  getStats: async () => {
    const response = await api.get('/api/gamification/stats');
    return response.data;
  },
};

// ============================================================================
// SESSION API
// ============================================================================

export const sessionAPI = {
  /**
   * Save a session
   * @param {{drillId: string, startTime: number, endTime: number, duration: number, landmarksHistory: Array<{timestamp: number, landmarks: any, score: number, feedback: string[]}>, finalScore: number, badgesEarned: string[], xpEarned: number}} sessionData
   * @returns {Promise<any>}
   */
  saveSession: async (sessionData) => {
    const userId = await AsyncStorage.getItem('userId');
    const response = await api.post('/api/sessions/save', {
      userId,
      ...sessionData,
    });
    return response.data;
  },
  
  /**
   * Get sessions
   * @param {{drillId?: string, limit?: number, skip?: number}} [options]
   * @returns {Promise<any>}
   */
  getSessions: async (options) => {
    const response = await api.get('/api/sessions', { params: options });
    return response.data;
  },
  
  /**
   * Get a specific session
   * @param {string} sessionId
   * @returns {Promise<any>}
   */
  getSession: async (sessionId) => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },
};

export default api;

