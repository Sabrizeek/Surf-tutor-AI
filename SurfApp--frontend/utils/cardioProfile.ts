import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CardioProfile {
  fitnessLevel: string;
  goal: string;
  trainingDuration: string;
  height?: number;
  weight?: number;
  limitations?: string[];
  completed: boolean;
  completedAt: string;
}

const CARDIO_PROFILE_KEY = '@cardio_profile';

export const cardioProfileStorage = {
  async save(profile: CardioProfile): Promise<void> {
    try {
      const profileData = {
        ...profile,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CARDIO_PROFILE_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving cardio profile:', error);
      throw error;
    }
  },

  async load(): Promise<CardioProfile | null> {
    try {
      const data = await AsyncStorage.getItem(CARDIO_PROFILE_KEY);
      if (data) {
        return JSON.parse(data) as CardioProfile;
      }
      return null;
    } catch (error) {
      console.error('Error loading cardio profile:', error);
      return null;
    }
  },

  async isCompleted(): Promise<boolean> {
    try {
      const profile = await this.load();
      return profile?.completed === true;
    } catch (error) {
      return false;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CARDIO_PROFILE_KEY);
    } catch (error) {
      console.error('Error clearing cardio profile:', error);
    }
  },
};

