import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CardioProfile } from '../utils/cardioProfile';
import { AdaptiveAdjustments } from '../utils/adaptiveProgress';

interface WorkoutPlan {
  planName?: string;
  skillLevel?: string;
  goal?: string;
  exercises?: string | string[];
  durationMinutes?: number;
}

interface PlanExplanationModalProps {
  visible: boolean;
  plan: WorkoutPlan;
  quizAnswers: CardioProfile;
  adaptiveAdjustments?: AdaptiveAdjustments;
  onClose: () => void;
}

function getBMICategory(height?: number, weight?: number): string {
  if (!height || !weight) return 'Normal';
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'Underweight';
  if (bmi > 25) return 'Overweight';
  return 'Normal';
}

export default function PlanExplanationModal({
  visible,
  plan,
  quizAnswers,
  adaptiveAdjustments,
  onClose,
}: PlanExplanationModalProps) {
  const bmiCategory = getBMICategory(quizAnswers.height, quizAnswers.weight);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Why This Plan?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Quiz Answers</Text>
              
              <View style={styles.infoRow}>
                <Icon name="fitness-center" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fitness Level</Text>
                  <Text style={styles.infoValue}>{quizAnswers.fitnessLevel}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="flag" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Goal</Text>
                  <Text style={styles.infoValue}>{quizAnswers.goal}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="timer" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{quizAnswers.trainingDuration}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="straighten" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>BMI Category</Text>
                  <Text style={styles.infoValue}>
                    {bmiCategory}
                    {quizAnswers.height && quizAnswers.weight && (
                      <Text style={styles.infoSubtext}>
                        {' '}(BMI: {(quizAnswers.weight / Math.pow(quizAnswers.height / 100, 2)).toFixed(1)})
                      </Text>
                    )}
                  </Text>
                </View>
              </View>

              {quizAnswers.limitations && quizAnswers.limitations.length > 0 && 
               !quizAnswers.limitations.includes('None') && (
                <View style={styles.infoRow}>
                  <Icon name="warning" size={20} color="#FF9500" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Limitations</Text>
                    <Text style={styles.infoValue}>
                      {quizAnswers.limitations.join(', ')}
                    </Text>
                    <Text style={styles.infoSubtext}>
                      Exercises that conflict with these limitations have been filtered out.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {adaptiveAdjustments && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adaptive Adjustments</Text>
                <Text style={styles.adaptiveDescription}>
                  Based on your recent workout performance, we've adjusted this plan:
                </Text>

                {adaptiveAdjustments.restMultiplierAdjustment !== 0 && (
                  <View style={styles.adjustmentRow}>
                    <Icon 
                      name={adaptiveAdjustments.restMultiplierAdjustment > 0 ? "timer" : "speed"} 
                      size={20} 
                      color={adaptiveAdjustments.restMultiplierAdjustment > 0 ? "#FF9500" : "#4CAF50"} 
                    />
                    <Text style={styles.adjustmentText}>
                      Rest time: {adaptiveAdjustments.restMultiplierAdjustment > 0 ? 'Increased' : 'Decreased'} by{' '}
                      {Math.abs(adaptiveAdjustments.restMultiplierAdjustment * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}

                {adaptiveAdjustments.setsAdjustment !== 0 && (
                  <View style={styles.adjustmentRow}>
                    <Icon 
                      name={adaptiveAdjustments.setsAdjustment > 0 ? "trending-up" : "trending-down"} 
                      size={20} 
                      color={adaptiveAdjustments.setsAdjustment > 0 ? "#4CAF50" : "#FF9500"} 
                    />
                    <Text style={styles.adjustmentText}>
                      Sets: {adaptiveAdjustments.setsAdjustment > 0 ? '+' : ''}{adaptiveAdjustments.setsAdjustment} per exercise
                    </Text>
                  </View>
                )}

                {adaptiveAdjustments.exerciseDifficultyAdjustment !== 'same' && (
                  <View style={styles.adjustmentRow}>
                    <Icon 
                      name={adaptiveAdjustments.exerciseDifficultyAdjustment === 'harder' ? "arrow-upward" : "arrow-downward"} 
                      size={20} 
                      color={adaptiveAdjustments.exerciseDifficultyAdjustment === 'harder' ? "#4CAF50" : "#FF9500"} 
                    />
                    <Text style={styles.adjustmentText}>
                      Difficulty: {adaptiveAdjustments.exerciseDifficultyAdjustment === 'harder' ? 'Increased' : 'Decreased'}
                    </Text>
                  </View>
                )}

                {adaptiveAdjustments.restMultiplierAdjustment === 0 && 
                 adaptiveAdjustments.setsAdjustment === 0 && 
                 adaptiveAdjustments.exerciseDifficultyAdjustment === 'same' && (
                  <Text style={styles.noAdjustments}>
                    No adjustments needed - your performance is optimal!
                  </Text>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plan Details</Text>
              <View style={styles.infoRow}>
                <Icon name="list" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Total Activities</Text>
                  <Text style={styles.infoValue}>
                    {typeof plan.exercises === 'string' 
                      ? plan.exercises.split(';').length 
                      : (Array.isArray(plan.exercises) ? plan.exercises.length : 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="schedule" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Estimated Duration</Text>
                  <Text style={styles.infoValue}>{plan.durationMinutes || 30} minutes</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  adaptiveDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  adjustmentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  noAdjustments: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 8,
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

