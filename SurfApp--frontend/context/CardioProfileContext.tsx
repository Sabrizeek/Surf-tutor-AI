import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@cardio_profile';

// ✅ UPDATED: Added equipment field
export interface CardioProfile {
  fitnessLevel: string;
  goal: string;
  trainingDuration: string;
  height?: number;
  weight?: number;
  equipment?: string; // ✅ NEW: Equipment field
  limitations?: string[];
  completed?: boolean;
  completedAt?: string;
}

interface CardioProfileContextType {
  profile: CardioProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: CardioProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  isQuizCompleted: boolean;
  refreshProfile: () => Promise<void>;
}

const CardioProfileContext = createContext<CardioProfileContextType | undefined>(undefined);

// ✅ UPDATED: Storage utilities with equipment support
export const cardioProfileStorage = {
  async load(): Promise<CardioProfile | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        const profile = JSON.parse(data);
        // Ensure equipment field exists (for backward compatibility)
        if (!profile.equipment) {
          profile.equipment = 'None';
        }
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error loading cardio profile:', error);
      return null;
    }
  },

  async save(profile: CardioProfile): Promise<void> {
    try {
      // Ensure equipment field is set
      if (!profile.equipment) {
        profile.equipment = 'None';
      }
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving cardio profile:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
    } catch (error) {
      console.error('Error clearing cardio profile:', error);
      throw error;
    }
  },
};

export function CardioProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CardioProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const loadedProfile = await cardioProfileStorage.load();
      setProfile(loadedProfile);
    } catch (error) {
      console.error('Error loading cardio profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile: CardioProfile) => {
    try {
      await cardioProfileStorage.save(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving cardio profile:', error);
      throw error;
    }
  };

  const clearProfile = async () => {
    try {
      await cardioProfileStorage.clear();
      setProfile(null);
    } catch (error) {
      console.error('Error clearing cardio profile:', error);
    }
  };

  return (
    <CardioProfileContext.Provider
      value={{
        profile,
        isLoading,
        loadProfile,
        saveProfile,
        clearProfile,
        refreshProfile: loadProfile,
        isQuizCompleted: profile?.completed === true,
      }}
    >
      {children}
    </CardioProfileContext.Provider>
  );
}

export function useCardioProfile() {
  const context = useContext(CardioProfileContext);
  if (context === undefined) {
    throw new Error('useCardioProfile must be used within a CardioProfileProvider');
  }
  return context;
}

export default CardioProfileContext;