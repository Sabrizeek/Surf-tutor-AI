import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Get the correct base URL for API requests
 * ⚠️ IMPORTANT: Update YOUR_COMPUTER_IP with your actual IP address for physical devices
 */
const getBaseURL = () => {
  // @ts-ignore - __DEV__ is a global variable in React Native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      // For Android Emulator: use 10.0.2.2 (special IP that maps to host's localhost)
      // For Android Physical Device: use your computer's IP address on the local network
      // To find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
      const IS_EMULATOR = false; // Set to true if using Android emulator
      const YOUR_COMPUTER_IP = '192.168.8.100'; // ⚠️ CHANGE THIS TO YOUR IP for physical devices
      
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
 */
export const checkBackendHealth = async (): Promise<boolean> => {
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
    // Enhanced error logging
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('[API] ❌ Network Error - Backend server may not be running');
      console.error(`[API] Attempted URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error('[API] 💡 Troubleshooting:');
      console.error('   1. Ensure backend server is running: cd surfapp--backend && npm start');
      console.error('   2. Check if IP address is correct in api.ts (line 15)');
      console.error('   3. For Android emulator, use 10.0.2.2 instead of localhost');
      console.error('   4. For physical device, ensure device and computer are on same WiFi');
    } else if (error.response) {
      console.error(`[API] ❌ Response error ${error.response.status}:`, error.response.data);
    } else {
      console.error('[API] ❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// POSE DETECTION API - FIXED VERSION
// ============================================================================

export const poseAPI = {
  /**
   * Detect pose from base64 image
   * @param imageBase64 - Base64 encoded image data
   * @param drillId - Optional drill ID for context
   * @param sessionId - Optional session ID for velocity tracking
   * @returns Pose detection result with landmarks
   */
  detectPose: async (imageBase64: string, drillId?: string, sessionId?: string) => {
    try {
      console.log('[poseAPI] 📸 Sending pose detection request...');
      console.log('[poseAPI] Image size:', imageBase64.length, 'characters');
      console.log('[poseAPI] Drill:', drillId, '| Session:', sessionId);
      
      const response = await api.post('/api/pose/detect', {
        image: imageBase64,
        drillId,
        sessionId,
      });
      
      console.log('[poseAPI] ✅ Detection success:', response.data.personDetected);
      console.log('[poseAPI] Landmarks:', response.data.landmark_count);
      console.log('[poseAPI] Quality:', response.data.detectionQuality?.toFixed(2));
      
      return response.data;
    } catch (error: any) {
      console.error('[poseAPI] ❌ Detection failed:', error.message);
      
      // Return a safe error response
      return {
        success: false,
        personDetected: false,
        landmarks: null,
        confidence: 0,
        stability_score: 0,
        landmark_count: 0,
        error: error.message || 'Pose detection failed',
        boundingBox: null,
        detectionQuality: 0,
        bodyCompleteness: {
          head: false,
          torso: false,
          legs: false,
          feet: false
        },
        calibrationStatus: 'not_detected',
        averageVisibility: 0,
      };
    }
  },
  
  /**
   * Health check for pose detection service
   * @returns Service health status
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/api/pose/health');
      return response.data;
    } catch (error: any) {
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
    equipment?: string,
    adaptiveAdjustments?: {
      intensityAdjustment?: number;
      restMultiplierAdjustment?: number;
      setsAdjustment?: number;
      exerciseDifficultyAdjustment?: 'easier' | 'same' | 'harder';
    }
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
    } catch (error: any) {
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

// ============================================================================
// GAMIFICATION API
// ============================================================================

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

// ============================================================================
// SESSION API
// ============================================================================

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

export default api;