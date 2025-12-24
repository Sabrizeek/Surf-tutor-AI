import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutExecutionScreen from './WorkoutExecutionScreen';

const PLAN_HISTORY_KEY = '@cardio_plan_history';

interface SavedPlan {
  id: string;
  planName: string;
  exercises: string[];
  durationMinutes: number;
  skillLevel: string;
  goal: string;
  generatedAt: string;
  quizAnswers?: {
    fitnessLevel: string;
    goal: string;
    duration: string;
    bmi: string;
    limitations: string[];
  };
}

export default function CardioPlanHistoryScreen() {
  const router = useRouter();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    loadPlanHistory();
  }, []);

  const loadPlanHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(PLAN_HISTORY_KEY);
      if (data) {
        const plans = JSON.parse(data);
        setSavedPlans(plans || []);
      }
    } catch (error) {
      console.error('Error loading plan history:', error);
    }
  };

  const handleRepeatPlan = (plan: SavedPlan) => {
    setSelectedPlan(plan);
  };

  const handleDeletePlan = (planId: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = savedPlans.filter(p => p.id !== planId);
              await AsyncStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(updated));
              setSavedPlans(updated);
            } catch (error) {
              console.error('Error deleting plan:', error);
            }
          },
        },
      ]
    );
  };

  if (selectedPlan) {
    return (
      <WorkoutExecutionScreen
        workoutPlan={{
          planName: selectedPlan.planName,
          skillLevel: selectedPlan.skillLevel,
          goal: selectedPlan.goal,
          exercises: selectedPlan.exercises,
          durationMinutes: selectedPlan.durationMinutes,
        }}
        onComplete={() => setSelectedPlan(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cardio Plans</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {savedPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No plans saved yet</Text>
            <Text style={styles.emptySubtext}>
              Generate some cardio plans to see them here
            </Text>
          </View>
        ) : (
          savedPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planHeaderLeft}>
                  <Text style={styles.planName}>{plan.planName}</Text>
                  <Text style={styles.planMeta}>
                    {plan.durationMinutes} min • {plan.exercises.length} activities
                  </Text>
                  <Text style={styles.planDate}>
                    {new Date(plan.generatedAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePlan(plan.id)}
                >
                  <Icon name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.exercisesPreview}>
                {plan.exercises.slice(0, 3).map((exercise, idx) => (
                  <Text key={idx} style={styles.exerciseItem}>
                    {idx + 1}. {exercise}
                  </Text>
                ))}
                {plan.exercises.length > 3 && (
                  <Text style={styles.moreExercises}>
                    ... and {plan.exercises.length - 3} more
                  </Text>
                )}
              </View>

              <View style={styles.planActions}>
                <TouchableOpacity
                  style={styles.repeatButton}
                  onPress={() => handleRepeatPlan(plan)}
                >
                  <Icon name="play-arrow" size={20} color="#fff" />
                  <Text style={styles.repeatButtonText}>Repeat Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planHeaderLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  exercisesPreview: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exerciseItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  moreExercises: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  repeatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

