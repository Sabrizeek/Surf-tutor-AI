import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCardioProfile, CardioProfile } from '../context/CardioProfileContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QuizStep {
  id: number;
  title: string;
  question: string;
}

export default function CardioQuizScreen({ onComplete }: { onComplete: () => void }) {
  const { saveProfile } = useCardioProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [trainingDuration, setTrainingDuration] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [limitations, setLimitations] = useState<string[]>([]);

  const fitnessLevels = ['Beginner', 'Intermediate', 'Pro'];
  const goals = ['Warm up only', 'Improve endurance', 'Improve explosive pop-up speed'];
  const durations = ['5-10 minutes', '10-20 minutes', '20+ minutes'];
  const limitationOptions = [
    'None',
    'Knee discomfort',
    'Knee injury',
    'Lower back tightness',
    'Lower back pain',
    'Upper back pain',
    'Shoulder injury',
    'Shoulder pain',
    'Rotator cuff issues',
    'Ankle injury',
    'Ankle pain',
    'Ankle instability',
    'Wrist injury',
    'Wrist pain',
    'Carpal tunnel',
    'Hip discomfort',
    'Hip pain',
    'Hip injury',
    'Neck pain',
    'Neck injury',
    'Elbow pain',
    'Tennis elbow',
    'Golfer\'s elbow',
    'Asthma',
    'Breathing difficulties',
    'Heart conditions',
    'High blood pressure',
  ];

  const steps: QuizStep[] = [
    { id: 0, title: 'Fitness Level', question: 'What is your current fitness level?' },
    { id: 1, title: 'Goal', question: 'What is your main goal before surfing?' },
    { id: 2, title: 'Duration', question: 'How long can you train before surfing?' },
    { id: 3, title: 'Body Info', question: 'Enter your body measurements' },
    { id: 4, title: 'Limitations', question: 'Any physical limitations? (Optional)' },
  ];

  const toggleLimitation = (limitation: string) => {
    if (limitation === 'None') {
      setLimitations(['None']);
    } else {
      setLimitations((prev) => {
        const filtered = prev.filter((l) => l !== 'None');
        if (filtered.includes(limitation)) {
          return filtered.filter((l) => l !== limitation);
        } else {
          return [...filtered, limitation];
        }
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !fitnessLevel) {
      Alert.alert('Required', 'Please select your fitness level');
      return;
    }
    if (currentStep === 1 && !goal) {
      Alert.alert('Required', 'Please select your goal');
      return;
    }
    if (currentStep === 2 && !trainingDuration) {
      Alert.alert('Required', 'Please select training duration');
      return;
    }
    if (currentStep === 3) {
      // Height and weight are optional, but validate if provided
      if (height) {
        const h = parseFloat(height);
        if (isNaN(h) || h < 100 || h > 250) {
          Alert.alert('Invalid', 'Please enter a valid height (100-250 cm)');
          return;
        }
      }
      if (weight) {
        const w = parseFloat(weight);
        if (isNaN(w) || w < 30 || w > 200) {
          Alert.alert('Invalid', 'Please enter a valid weight (30-200 kg)');
          return;
        }
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const profile: CardioProfile = {
        fitnessLevel,
        goal,
        trainingDuration,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        limitations: limitations.length > 0 ? limitations : undefined,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await saveProfile(profile);
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.optionsContainer}>
            {fitnessLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, fitnessLevel === level && styles.optionButtonActive]}
                onPress={() => setFitnessLevel(level)}
              >
                <Text style={[styles.optionText, fitnessLevel === level && styles.optionTextActive]}>
                  {level}
                </Text>
                {fitnessLevel === level && (
                  <Icon name="check-circle" size={24} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.optionsContainer}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionButton, goal === g && styles.optionButtonActive]}
                onPress={() => setGoal(g)}
              >
                <Text style={[styles.optionText, goal === g && styles.optionTextActive]}>
                  {g}
                </Text>
                {goal === g && (
                  <Icon name="check-circle" size={24} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 2:
        return (
          <View style={styles.optionsContainer}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[styles.optionButton, trainingDuration === duration && styles.optionButtonActive]}
                onPress={() => setTrainingDuration(duration)}
              >
                <Text style={[styles.optionText, trainingDuration === duration && styles.optionTextActive]}>
                  {duration}
                </Text>
                {trainingDuration === duration && (
                  <Icon name="check-circle" size={24} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="e.g., 175"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g., 70"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.optionsContainer}>
            {limitationOptions.map((limitation) => {
              const isSelected = limitations.includes(limitation);
              return (
                <TouchableOpacity
                  key={limitation}
                  style={[styles.optionButton, isSelected && styles.optionButtonActive]}
                  onPress={() => toggleLimitation(limitation)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {limitation}
                  </Text>
                  {isSelected && (
                    <Icon name="check-circle" size={24} color="#fff" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Fitness Quiz</Text>
          <Text style={styles.subtitle}>Help us personalize your cardio plans</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.questionText}>{steps[currentStep].question}</Text>
        </View>

        <View style={styles.contentContainer}>{renderStepContent()}</View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Icon name="arrow-back" size={24} color="#007AFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Text>
            <Icon name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    minHeight: 200,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 12,
  },
  inputContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});

