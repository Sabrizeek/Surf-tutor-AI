import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeLinearGradient from './SafeLinearGradient';
import { useCardioProfile, CardioProfile } from '../context/CardioProfileContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface QuizStep {
  id: number;
  title: string;
  question: string;
  icon: string;
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
  const [equipment, setEquipment] = useState('');

  // ✅ Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const steps: QuizStep[] = [
    { id: 0, title: 'Fitness Level', question: 'What is your current fitness level?', icon: 'trending-up' },
    { id: 1, title: 'Goal', question: 'What is your main goal before surfing?', icon: 'flag' },
    { id: 2, title: 'Duration', question: 'How long can you train before surfing?', icon: 'schedule' },
    { id: 3, title: 'Body Info', question: 'Enter your body measurements', icon: 'person' },
    { id: 4, title: 'Equipment', question: 'What equipment do you have?', icon: 'fitness-center' },
    { id: 5, title: 'Limitations', question: 'Any physical limitations?', icon: 'health-and-safety' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const fitnessLevels = [
    { value: 'Beginner', icon: 'star-outline', color: '#4CAF50', description: 'New to fitness' },
    { value: 'Intermediate', icon: 'star-half', color: '#FF9800', description: 'Some experience' },
    { value: 'Pro', icon: 'star', color: '#F44336', description: 'Very experienced' },
  ];

  const goals = [
    { value: 'Warm up only', icon: 'wb-sunny', description: 'Light preparation' },
    { value: 'Improve endurance', icon: 'directions-run', description: 'Build stamina' },
    { value: 'Improve explosive pop-up speed', icon: 'flash-on', description: 'Power & speed' },
  ];

  const durations = [
    { value: '5-10 minutes', icon: 'timer', description: 'Quick session' },
    { value: '10-20 minutes', icon: 'timer', description: 'Moderate session' },
    { value: '20+ minutes', icon: 'timer', description: 'Full session' },
  ];

  const equipmentOptions = [
    { value: 'None', icon: 'accessibility', description: 'Bodyweight only' },
    { value: 'Kettlebell', icon: 'fitness-center', description: 'KB exercises' },
    { value: 'Gym', icon: 'home', description: 'Full equipment' },
  ];

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

  const animateTransition = (direction: 'forward' | 'back') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'forward' ? -width : width,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
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
    if (currentStep === 4 && !equipment) {
      Alert.alert('Required', 'Please select your available equipment');
      return;
    }

    if (currentStep < steps.length - 1) {
      animateTransition('forward');
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition('back');
      setCurrentStep(currentStep - 1);
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
        equipment: equipment || 'None',
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.optionsContainer}>
            {fitnessLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionCard,
                  fitnessLevel === level.value && { borderColor: level.color, borderWidth: 3 },
                ]}
                onPress={() => setFitnessLevel(level.value)}
              >
                <Icon name={level.icon} size={40} color={level.color} />
                <Text style={styles.optionTitle}>{level.value}</Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
                {fitnessLevel === level.value && (
                  <View style={[styles.checkBadge, { backgroundColor: level.color }]}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
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
                key={g.value}
                style={[
                  styles.optionCard,
                  goal === g.value && styles.optionCardSelected,
                ]}
                onPress={() => setGoal(g.value)}
              >
                <Icon name={g.icon} size={40} color={goal === g.value ? '#667eea' : '#999'} />
                <Text style={styles.optionTitle}>{g.value}</Text>
                <Text style={styles.optionDescription}>{g.description}</Text>
                {goal === g.value && (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
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
                key={duration.value}
                style={[
                  styles.optionCard,
                  trainingDuration === duration.value && styles.optionCardSelected,
                ]}
                onPress={() => setTrainingDuration(duration.value)}
              >
                <Icon name={duration.icon} size={40} color={trainingDuration === duration.value ? '#667eea' : '#999'} />
                <Text style={styles.optionTitle}>{duration.value}</Text>
                <Text style={styles.optionDescription}>{duration.description}</Text>
                {trainingDuration === duration.value && (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.inputCard}>
              <Icon name="height" size={32} color="#667eea" />
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
            </View>

            <View style={styles.inputCard}>
              <Icon name="monitor-weight" size={32} color="#667eea" />
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

            <View style={styles.infoBox}>
              <Icon name="info-outline" size={20} color="#667eea" />
              <Text style={styles.infoText}>
                Optional: Height and weight help us calculate your BMI for better recommendations
              </Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.optionsContainer}>
            {equipmentOptions.map((eq) => (
              <TouchableOpacity
                key={eq.value}
                style={[
                  styles.optionCard,
                  equipment === eq.value && styles.optionCardSelected,
                ]}
                onPress={() => setEquipment(eq.value)}
              >
                <Icon name={eq.icon} size={40} color={equipment === eq.value ? '#667eea' : '#999'} />
                <Text style={styles.optionTitle}>{eq.value}</Text>
                <Text style={styles.optionDescription}>{eq.description}</Text>
                {equipment === eq.value && (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.limitationsContainer}>
            <View style={styles.limitationsGrid}>
              {limitationOptions.map((limitation) => {
                const isSelected = limitations.includes(limitation);
                return (
                  <TouchableOpacity
                    key={limitation}
                    style={[
                      styles.limitationChip,
                      isSelected && styles.limitationChipSelected,
                    ]}
                    onPress={() => toggleLimitation(limitation)}
                  >
                    <Text style={[
                      styles.limitationText,
                      isSelected && styles.limitationTextSelected,
                    ]}>
                      {limitation}
                    </Text>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color="#667eea" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <SafeLinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Icon name={steps[currentStep].icon} size={32} color="#fff" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fitness Quiz</Text>
            <Text style={styles.headerSubtitle}>Personalize your experience</Text>
          </View>
        </View>
      </SafeLinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.questionText}>{steps[currentStep].question}</Text>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons - Fixed at bottom */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color="#667eea" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <SafeLinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Text>
            <Icon name="arrow-forward" size={24} color="#fff" />
          </SafeLinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    minHeight: 200,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: '#667eea',
    borderWidth: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    gap: 16,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    flex: 1,
    marginLeft: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  limitationsContainer: {
    minHeight: 400,
  },
  limitationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  limitationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  limitationChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#667eea',
  },
  limitationText: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  limitationTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});