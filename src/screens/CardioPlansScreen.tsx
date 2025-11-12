import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { cardioAPI, authAPI } from '../services/api';

interface WorkoutPlan {
  planName?: string;
  skillLevel?: string;
  goal?: string;
  equipment?: string;
  durationMinutes?: number;
  focus?: string;
  exercises?: string | string[];
}

export default function CardioPlansScreen() {
  const [skillLevel, setSkillLevel] = useState('');
  const [goal, setGoal] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [recommendations, setRecommendations] = useState<WorkoutPlan[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
  const goals = ['Endurance', 'Strength', 'Flexibility', 'Balance', 'Power', 'Stamina', 'Fat Loss'];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await authAPI.getProfile();
      const user = response.user;
      setUserProfile(user);
      if (user.skillLevel) setSkillLevel(user.skillLevel);
      // Handle goal as array or string (backward compatibility)
      const userGoals = Array.isArray(user.goal) ? user.goal : (user.goal ? [user.goal] : []);
      setGoal(userGoals);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!skillLevel || !goal || goal.length === 0) {
      Alert.alert('Error', 'Please select skill level and at least one goal');
      return;
    }

    setLoading(true);
    try {
      const userDetails: any = {};
      if (userProfile) {
        if (userProfile.height) userDetails.height = userProfile.height;
        if (userProfile.weight) userDetails.weight = userProfile.weight;
        if (userProfile.age) userDetails.age = userProfile.age;
        if (userProfile.bmi) userDetails.bmi = userProfile.bmi;
      }

      const response = await cardioAPI.getRecommendations(
        skillLevel,
        goal,
        Object.keys(userDetails).length > 0 ? userDetails : undefined
      );

      if (response.recommendedPlans && Array.isArray(response.recommendedPlans)) {
        setRecommendations(response.recommendedPlans);
      } else if (response.recommendedExercises) {
        // Fallback: if we get old format, convert to new format
        const exercises = Array.isArray(response.recommendedExercises)
          ? response.recommendedExercises
          : [response.recommendedExercises];
        const plans: WorkoutPlan[] = exercises.map((ex, idx) => ({
          planName: `Workout Plan ${idx + 1}`,
          skillLevel,
          goal,
          exercises: typeof ex === 'string' ? ex.split(';') : ex,
          durationMinutes: 30,
          focus: goal,
        }));
        setRecommendations(plans);
      } else {
        Alert.alert('Error', 'No recommendations received');
      }
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      console.error('Error response:', error.response?.data);
      const errorData = error.response?.data || {};
      const errorMsg = errorData.error || 'Failed to get recommendations';
      const errorDetails = errorData.details || '';
      
      let displayMessage = errorMsg;
      if (errorDetails) {
        displayMessage += `\n\n${errorDetails}`;
      }
      
      // Special handling for model server errors
      if (errorMsg.includes('Model server') || errorMsg.includes('model server')) {
        displayMessage = 'AI Model Server Error\n\n' + (errorDetails || 'The AI model server is not running. Please ensure the Python model server is started on port 8000.');
      }
      
      Alert.alert('Error', displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const parseExercises = (exercises: string | string[] | undefined): string[] => {
    if (!exercises) return [];
    if (Array.isArray(exercises)) return exercises;
    if (typeof exercises === 'string') {
      return exercises.split(';').map(e => e.trim()).filter(e => e.length > 0);
    }
    return [];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cardio Plans</Text>
        <Text style={styles.subtitle}>
          Enter your details to get personalized workout recommendations
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Skill Level *</Text>
          <View style={styles.buttonGroup}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.button,
                  skillLevel === level && styles.buttonActive,
                ]}
                onPress={() => setSkillLevel(level)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    skillLevel === level && styles.buttonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goals * (Select Multiple)</Text>
          <View style={styles.buttonGroup}>
            {goals.map((g) => {
              const isSelected = goal.includes(g);
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.button, isSelected && styles.buttonActive]}
                  onPress={() => {
                    if (isSelected) {
                      setGoal(goal.filter(goalItem => goalItem !== g));
                    } else {
                      setGoal([...goal, g]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isSelected && styles.buttonTextActive,
                    ]}
                  >
                    {g} {isSelected ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {userProfile && (
          <View style={styles.profileInfo}>
            <Text style={styles.profileInfoText}>
              Using profile: {userProfile.name || userProfile.email}
              {userProfile.height && ` • ${userProfile.height}cm`}
              {userProfile.weight && ` • ${userProfile.weight}kg`}
              {userProfile.age && ` • ${userProfile.age}yrs`}
            </Text>
            <Text style={styles.profileInfoSubtext}>
              Update your profile to get better recommendations
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleGetRecommendations}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Get Recommendations</Text>
          )}
        </TouchableOpacity>

        {recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommended Workout Plans:</Text>
            {recommendations.map((plan, index) => {
              const exercises = parseExercises(plan.exercises);
              return (
                <View key={index} style={styles.planCard}>
                  <Text style={styles.planName}>{plan.planName || `Workout Plan ${index + 1}`}</Text>
                  
                  <View style={styles.planDetails}>
                    {plan.durationMinutes && (
                      <View style={styles.planDetailRow}>
                        <Icon name="schedule" size={16} color="#666" />
                        <Text style={styles.planDetailText}>{plan.durationMinutes} minutes</Text>
                      </View>
                    )}
                    {plan.focus && (
                      <View style={styles.planDetailRow}>
                        <Icon name="fitness-center" size={16} color="#666" />
                        <Text style={styles.planDetailText}>Focus: {plan.focus}</Text>
                      </View>
                    )}
                    {plan.equipment && (
                      <View style={styles.planDetailRow}>
                        <Icon name="build" size={16} color="#666" />
                        <Text style={styles.planDetailText}>Equipment: {plan.equipment}</Text>
                      </View>
                    )}
                  </View>

                  {exercises.length > 0 && (
                    <View style={styles.exercisesSection}>
                      <Text style={styles.exercisesTitle}>Exercises ({exercises.length}):</Text>
                      {exercises.map((exercise, exIndex) => (
                        <View key={exIndex} style={styles.exerciseItem}>
                          <Text style={styles.exerciseNumber}>{exIndex + 1}.</Text>
                          <Text style={styles.exerciseText}>{exercise}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  buttonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  profileInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileInfoText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  profileInfoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  planCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  planDetails: {
    marginBottom: 12,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  planDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  exercisesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  exerciseNumber: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 8,
    minWidth: 24,
  },
  exerciseText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
});

