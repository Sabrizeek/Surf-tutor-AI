import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { cardioProfileStorage, CardioProfile } from '../utils/cardioProfile';

interface CardioProfileContextType {
  profile: CardioProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: CardioProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  isQuizCompleted: boolean;
  refreshProfile: () => Promise<void>; // Alias for loadProfile
}

const CardioProfileContext = createContext<CardioProfileContextType | undefined>(undefined);

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
        refreshProfile: loadProfile, // Alias for loadProfile
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

