import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { cardioAPI } from '../services/api';
import { useCardioProfile } from '../context/CardioProfileContext';
import CardioQuizScreen from './CardioQuizScreen';
import WorkoutExecutionScreen from './WorkoutExecutionScreen';
import PlanExplanationModal from './PlanExplanationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateAdaptiveAdjustments, WorkoutProgress } from '../utils/adaptiveProgress';
import { useRouter } from 'expo-router';

const WORKOUT_PROGRESS_KEY = '@workout_progress';
const PLAN_HISTORY_KEY = '@cardio_plan_history';

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
  const router = useRouter();
  const { profile, isLoading: profileLoading, isQuizCompleted, refreshProfile } = useCardioProfile();
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<WorkoutPlan[]>([]);
  const [explanationPlan, setExplanationPlan] = useState<WorkoutPlan | null>(null);
  const [adaptiveAdjustments, setAdaptiveAdjustments] = useState<any>(null);

  useEffect(() => {
    if (!profileLoading && isQuizCompleted && profile) {
      // Auto-generate plans when quiz is completed
      handleGetRecommendations();
    }
  }, [profileLoading, isQuizCompleted, profile]);

  const handleQuizComplete = async () => {
    setShowQuiz(false);
    await refreshProfile();
    // Auto-generate plans after quiz completion
    setTimeout(() => {
      handleGetRecommendations();
    }, 100);
  };

  const loadCardioWorkouts = async (): Promise<WorkoutProgress[]> => {
    try {
      const data = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      if (data) {
        return JSON.parse(data) || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading cardio workouts:', error);
      return [];
    }
  };

  const savePlanToHistory = async (plans: WorkoutPlan[]) => {
    try {
      const existing = await AsyncStorage.getItem(PLAN_HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];
      
      const plansToSave = plans.map(plan => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        planName: plan.planName || 'Workout Plan',
        exercises: typeof plan.exercises === 'string' 
          ? plan.exercises.split(';').map(e => e.trim())
          : (Array.isArray(plan.exercises) ? plan.exercises : []),
        durationMinutes: plan.durationMinutes || 30,
        skillLevel: plan.skillLevel || profile?.fitnessLevel || 'Beginner',
        goal: plan.goal || profile?.goal || '',
        generatedAt: new Date().toISOString(),
        quizAnswers: profile ? {
          fitnessLevel: profile.fitnessLevel,
          goal: profile.goal,
          duration: profile.trainingDuration,
          bmi: profile.height && profile.weight 
            ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
            : 'N/A',
          limitations: profile.limitations || [],
        } : undefined,
      }));
      
      // Add to history (keep last 10)
      const updatedHistory = [...plansToSave, ...history].slice(0, 10);
      await AsyncStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving plan history:', error);
    }
  };

  const handleGetRecommendations = async () => {
    if (!profile || !profile.fitnessLevel || !profile.goal || !profile.trainingDuration) {
      Alert.alert('Error', 'Please complete the fitness quiz first');
      return;
    }

    setLoading(true);
    try {
      // Load workout history for adaptive adjustments
      const workouts = await loadCardioWorkouts();
      
      // Ensure workouts is an array
      const safeWorkouts = Array.isArray(workouts) ? workouts : [];
      const recentWorkouts = safeWorkouts.slice(-5); // Last 5 workouts
      const adjustments = calculateAdaptiveAdjustments(recentWorkouts);
      setAdaptiveAdjustments(adjustments);
      
      // Map quiz data to plan generation format
      const skillLevel = profile.fitnessLevel;
      let goal: string[] = [];
      
      // Map quiz goal to ML model goals
      if (profile.goal === 'Warm up only') {
        goal = ['Endurance'];
      } else if (profile.goal === 'Improve endurance') {
        goal = ['Endurance', 'Stamina'];
      } else if (profile.goal === 'Improve explosive pop-up speed') {
        goal = ['Power'];
      }

      const userDetails: any = {};
      if (profile.height) userDetails.height = profile.height;
      if (profile.weight) userDetails.weight = profile.weight;
      // Calculate BMI
      if (profile.height && profile.weight) {
        userDetails.bmi = profile.weight / Math.pow(profile.height / 100, 2);
      }

      const response = await cardioAPI.getRecommendations(
        skillLevel,
        goal,
          Object.keys(userDetails).length > 0 ? userDetails : undefined,
        profile.trainingDuration, // durationRange
        profile.limitations && profile.limitations.length > 0 && !profile.limitations.includes('None') 
          ? profile.limitations 
          : undefined, // limitations
        Object.keys(adjustments).length > 0 ? adjustments : undefined // adaptive adjustments
      );

      if (response.recommendedPlans && Array.isArray(response.recommendedPlans)) {
        setRecommendations(response.recommendedPlans);
        // Save plans to history
        await savePlanToHistory(response.recommendedPlans);
      } else if (response.recommendedExercises) {
        // Fallback: if we get old format, convert to new format
        const exercises = Array.isArray(response.recommendedExercises)
          ? response.recommendedExercises
          : [response.recommendedExercises];
        const plans: WorkoutPlan[] = exercises.map((ex, idx) => ({
          planName: `Workout Plan ${idx + 1}`,
          skillLevel,
          goal: goal.join(', '),
          exercises: typeof ex === 'string' ? ex.split(';') : ex,
          durationMinutes: 30,
          focus: goal.join(', '),
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

  const handleWorkoutComplete = () => {
    setSelectedWorkout(null);
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedWorkout) {
    return <WorkoutExecutionScreen workoutPlan={selectedWorkout} onComplete={handleWorkoutComplete} />;
  }

  if (showQuiz || !isQuizCompleted) {
    return <CardioQuizScreen onComplete={handleQuizComplete} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Cardio Plans</Text>
            <Text style={styles.subtitle}>
              Personalized workout recommendations
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => router.push('/cardio-history')}
            >
              <Icon name="history" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setShowQuiz(true)}
            >
              <Icon name="refresh" size={20} color="#007AFF" />
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {profile && (
          <View style={styles.profileInfo}>
            <Text style={styles.profileInfoText}>
              Fitness Level: {profile.fitnessLevel}
              {profile.height && ` • ${profile.height}cm`}
              {profile.weight && ` • ${profile.weight}kg`}
            </Text>
            <Text style={styles.profileInfoSubtext}>
              Goal: {profile.goal} • Duration: {profile.trainingDuration}
            </Text>
            {profile.limitations && profile.limitations.length > 0 && !profile.limitations.includes('None') && (
              <Text style={styles.profileInfoSubtext}>
                Limitations: {profile.limitations.filter(l => l !== 'None').join(', ')}
              </Text>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generating your workout plans...</Text>
          </View>
        ) : recommendations.length > 0 ? (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>
              Choose Your Workout Plan ({recommendations.length} options):
            </Text>
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
                    {plan.equipment && plan.equipment !== 'None' && (
                      <View style={styles.planDetailRow}>
                        <Icon name="build" size={16} color="#666" />
                        <Text style={styles.planDetailText}>Equipment: {plan.equipment}</Text>
                      </View>
                    )}
                  </View>

                  {exercises.length > 0 && (
                    <View style={styles.exercisesSection}>
                      <Text style={styles.exercisesTitle}>Exercises ({exercises.length}):</Text>
                      {exercises.slice(0, 5).map((exercise, exIndex) => (
                        <View key={exIndex} style={styles.exerciseItem}>
                          <Text style={styles.exerciseNumber}>{exIndex + 1}.</Text>
                          <Text style={styles.exerciseText}>{exercise}</Text>
                        </View>
                      ))}
                      {exercises.length > 5 && (
                        <Text style={styles.moreExercisesText}>... and {exercises.length - 5} more exercises</Text>
                      )}
                    </View>
                  )}

                  <View style={styles.planActions}>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() => setExplanationPlan(plan)}
                    >
                      <Icon name="info" size={18} color="#007AFF" />
                      <Text style={styles.infoButtonText}>Why this plan?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.startWorkoutButton}
                      onPress={() => setSelectedWorkout(plan)}
                    >
                      <Icon name="play-arrow" size={20} color="#fff" />
                      <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No workout plans yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete the fitness quiz to get personalized recommendations
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Plan Explanation Modal */}
      {explanationPlan && profile && (
        <PlanExplanationModal
          visible={!!explanationPlan}
          plan={explanationPlan}
          quizAnswers={profile}
          adaptiveAdjustments={adaptiveAdjustments}
          onClose={() => setExplanationPlan(null)}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  retakeButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
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
  },
  profileInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  profileInfoText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileInfoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
    fontSize: 20,
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
    marginBottom: 6,
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
  moreExercisesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    flex: 1,
    justifyContent: 'center',
  },
  infoButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
