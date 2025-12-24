import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  FlatList,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExerciseData, getDefaultExerciseData } from '../utils/exerciseData';
import ExerciseAnimation from './ExerciseAnimation';
import { generateWorkoutFeedback } from '../utils/workoutFeedback';
import { WorkoutProgress } from '../utils/adaptiveProgress';

// Animated Button Component with Ripple Effect
const AnimatedButton = ({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Ripple effect
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Scale effect
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface WorkoutPlan {
  planName?: string;
  skillLevel?: string;
  goal?: string;
  exercises?: string | string[];
  durationMinutes?: number;
}

interface Activity {
  name: string;
  duration: number;
  rest: number;
  sets: number;
}

interface ActivityProgress {
  activityIndex: number;
  activityName: string;
  status: 'not_started' | 'ready' | 'active' | 'completed' | 'skipped' | 'paused';
  plannedDuration: number;
  actualDuration?: number;
  setsPlanned: number;
  setsCompleted?: number;
  startTime?: number;
  endTime?: number;
  skippedAt?: number;
  timeRemaining: number;
}

interface WorkoutExecutionScreenProps {
  workoutPlan: WorkoutPlan;
  onComplete?: () => void;
}

type WorkoutState = 'idle' | 'countdown' | 'ready' | 'active' | 'rest' | 'completed' | 'paused';

const WORKOUT_PROGRESS_KEY = '@workout_progress';

export default function WorkoutExecutionScreen({ workoutPlan, onComplete }: WorkoutExecutionScreenProps) {
  const router = useRouter();
  const [state, setState] = useState<WorkoutState>('idle');
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  
  // Per-activity progress tracking
  const [activityProgresses, setActivityProgresses] = useState<ActivityProgress[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const activityStartTimeRef = useRef<number>(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Parse exercises into activities using exercise data mapping
  const parseExercises = (exercises: string | string[] | undefined): Activity[] => {
    if (!exercises) return [];
    
    const exerciseList = Array.isArray(exercises) 
      ? exercises 
      : (typeof exercises === 'string' ? exercises.split(';').map(e => e.trim()) : []);
    
    return exerciseList.map(ex => {
      const exerciseData = getExerciseData(ex) || getDefaultExerciseData(ex);
      return {
        name: exerciseData.name,
        duration: exerciseData.duration,
        rest: exerciseData.rest,
        sets: exerciseData.sets,
      };
    });
  };

  const activities = parseExercises(workoutPlan.exercises);
  const currentActivity = activities[currentActivityIndex];

  // Initialize activity progress tracking
  useEffect(() => {
    if (activities.length > 0 && activityProgresses.length === 0) {
      const initialProgresses: ActivityProgress[] = activities.map((activity, index) => ({
        activityIndex: index,
        activityName: activity.name,
        status: 'not_started',
        plannedDuration: activity.duration * activity.sets + activity.rest * (activity.sets - 1),
        setsPlanned: activity.sets,
        timeRemaining: activity.duration,
      }));
      setActivityProgresses(initialProgresses);
    }
  }, [activities]);

  // Timer using Date.now() for accurate timing
  useEffect(() => {
    if (state === 'active' || state === 'rest') {
      // Set start time when activity/rest begins
      activityStartTimeRef.current = Date.now();
      const targetDuration = state === 'active' ? currentActivity.duration : currentActivity.rest;
      
      // Update activity progress status
      setActivityProgresses(prev => prev.map((prog, idx) => 
        idx === currentActivityIndex 
          ? { ...prog, status: state === 'active' ? 'active' : 'paused', startTime: activityStartTimeRef.current }
          : prog
      ));
      
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activityStartTimeRef.current) / 1000);
        const remaining = Math.max(0, targetDuration - elapsed);
        
        setTimeRemaining(remaining);
        
        // Update activity progress time remaining
        setActivityProgresses(prev => prev.map((prog, idx) => 
          idx === currentActivityIndex 
            ? { ...prog, timeRemaining: remaining }
            : prog
        ));
        
        setTotalTimeElapsed((prev) => {
          const totalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          return totalElapsed;
        });
        
        if (remaining <= 0) {
          handleTimeUp();
        }
      }, 100); // Update every 100ms for smoother display
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, currentActivityIndex, currentSet]);

  useEffect(() => {
    // Animate progress ring with smooth easing
    if (state === 'active' && currentActivity) {
      const progress = (currentActivity.duration - timeRemaining) / currentActivity.duration;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else if (state === 'rest' && currentActivity) {
      const progress = (currentActivity.rest - timeRemaining) / currentActivity.rest;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, state]);

  const handleTimeUp = () => {
    if (state === 'active') {
      // Activity completed, start rest
      if (currentSet < currentActivity.sets) {
        activityStartTimeRef.current = Date.now();
        setState('rest');
        setTimeRemaining(currentActivity.rest);
        setCurrentSet(currentSet + 1);
        
        // Update sets completed
        setActivityProgresses(prev => prev.map((prog, idx) => 
          idx === currentActivityIndex 
            ? { ...prog, setsCompleted: currentSet }
            : prog
        ));
      } else {
        // All sets done, mark activity as completed
        const completedTime = Date.now() - activityStartTimeRef.current;
        
        // Show completion animation
        const completionAnim = new Animated.Value(0);
        Animated.spring(completionAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        setActivityProgresses(prev => prev.map((prog, idx) => 
          idx === currentActivityIndex 
            ? { 
                ...prog, 
                status: 'completed',
                actualDuration: Math.floor(completedTime / 1000),
                setsCompleted: currentActivity.sets,
                endTime: Date.now()
              }
            : prog
        ));
        
        // Move to next activity - show ready screen instead of auto-starting
        if (currentActivityIndex < activities.length - 1) {
          const nextIndex = currentActivityIndex + 1;
          setCurrentActivityIndex(nextIndex);
          setCurrentSet(1);
          setState('ready'); // Show ready screen instead of auto-starting
        } else {
          // Workout complete
          handleWorkoutComplete();
        }
      }
    } else if (state === 'rest') {
      // Rest done, show ready screen for next set
      setState('ready');
    }
  };

  const handleStart = () => {
    if (activities.length === 0) {
      Alert.alert('Error', 'No exercises in this workout plan');
      return;
    }
    startTimeRef.current = Date.now();
    setState('countdown');
    setTimeRemaining(3);
    
    const countdownStartTime = Date.now();
    const countdownTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
      const remaining = Math.max(0, 3 - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        activityStartTimeRef.current = Date.now();
        setState('active');
        setTimeRemaining(currentActivity.duration);
      }
    }, 100);
  };

  const handlePause = () => {
    if (state === 'active' || state === 'rest') {
      setState('paused');
      setActivityProgresses(prev => prev.map((prog, idx) => 
        idx === currentActivityIndex 
          ? { ...prog, status: 'paused' }
          : prog
      ));
    } else if (state === 'paused') {
      // Resume - adjust start time to continue from where we paused
      activityStartTimeRef.current = Date.now() - (currentActivity.duration - timeRemaining);
      setState('active');
      setActivityProgresses(prev => prev.map((prog, idx) => 
        idx === currentActivityIndex 
          ? { ...prog, status: 'active' }
          : prog
      ));
    }
  };

  const handleSkipActivity = (activityIndex: number) => {
    Alert.alert(
      'Skip Activity',
      `Are you sure you want to skip "${activities[activityIndex].name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            // Mark as skipped
            setActivityProgresses(prev => prev.map((prog, idx) => 
              idx === activityIndex 
                ? { 
                    ...prog, 
                    status: 'skipped',
                    skippedAt: Date.now()
                  }
                : prog
            ));
            
            // Move to next activity
            if (activityIndex < activities.length - 1) {
              const nextIndex = activityIndex + 1;
              setCurrentActivityIndex(nextIndex);
              setCurrentSet(1);
              setState('rest');
              setTimeRemaining(activities[nextIndex].rest);
              activityStartTimeRef.current = Date.now();
            } else {
              handleWorkoutComplete();
            }
          },
        },
      ]
    );
  };

  const handleCompleteActivity = (activityIndex: number) => {
    const activity = activities[activityIndex];
    const progress = activityProgresses[activityIndex];
    const completedTime = progress.startTime 
      ? Math.floor((Date.now() - progress.startTime) / 1000)
      : activity.duration;
    
    // Mark as completed
    setActivityProgresses(prev => prev.map((prog, idx) => 
      idx === activityIndex 
        ? { 
            ...prog, 
            status: 'completed',
            actualDuration: completedTime,
            setsCompleted: activity.sets,
            endTime: Date.now()
          }
        : prog
    ));
    
    // Move to next activity
    if (activityIndex < activities.length - 1) {
      const nextIndex = activityIndex + 1;
      setCurrentActivityIndex(nextIndex);
      setCurrentSet(1);
      setState('rest');
      setTimeRemaining(activities[nextIndex].rest);
      activityStartTimeRef.current = Date.now();
    } else {
      handleWorkoutComplete();
    }
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: handleWorkoutComplete,
        },
      ]
    );
  };

  const handleWorkoutComplete = async () => {
    setState('completed');
    
    const completedActivities = activityProgresses.filter(p => p.status === 'completed');
    const skippedActivities = activityProgresses.filter(p => p.status === 'skipped');
    const completionRate = activities.length > 0 
      ? (completedActivities.length / activities.length) * 100 
      : 0;

    const workoutRecord = {
      date: new Date().toISOString(),
      planName: workoutPlan.planName || 'Workout',
      totalDurationPlanned: workoutPlan.durationMinutes || 0,
      totalDurationActual: Math.floor(totalTimeElapsed / 60),
      activities: activityProgresses.map(prog => ({
        name: prog.activityName,
        status: prog.status,
        durationPlanned: prog.plannedDuration,
        durationActual: prog.actualDuration,
        setsPlanned: prog.setsPlanned,
        setsCompleted: prog.setsCompleted,
        completedAt: prog.endTime ? new Date(prog.endTime).toISOString() : undefined,
        skippedAt: prog.skippedAt ? new Date(prog.skippedAt).toISOString() : undefined,
      })),
      completionRate: Math.round(completionRate),
      activitiesCompleted: completedActivities.length,
      activitiesSkipped: skippedActivities.length,
    };

    // Save to AsyncStorage
    try {
      const existing = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.push(workoutRecord);
      await AsyncStorage.setItem(WORKOUT_PROGRESS_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving workout progress:', error);
    }

    // Generate feedback
    try {
      const existing = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      const history = existing ? JSON.parse(existing) : [];
      const feedback = generateWorkoutFeedback(workoutRecord as WorkoutProgress, history);
      
      const feedbackMessage = feedback.length > 0 
        ? `\n\n${feedback.join('\n\n')}`
        : '';
      
      Alert.alert(
        'Workout Complete!',
        `You completed ${completedActivities.length} activities in ${Math.floor(totalTimeElapsed / 60)} minutes.${feedbackMessage}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onComplete) {
                onComplete();
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error generating feedback:', error);
      Alert.alert(
        'Workout Complete!',
        `You completed ${completedActivities.length} activities in ${Math.floor(totalTimeElapsed / 60)} minutes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onComplete) {
                onComplete();
              } else {
                router.back();
              }
            },
          },
        ]
      );
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (): string => {
    if (state === 'rest') return '#FF9500';
    if (state === 'active') return '#007AFF';
    return '#ccc';
  };

  const getActivityStatusIcon = (status: ActivityProgress['status']): string => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'skipped':
        return 'cancel';
      case 'active':
        return 'play-circle-filled';
      case 'paused':
        return 'pause-circle-filled';
      default:
        return 'radio-button-unchecked';
    }
  };

  const getActivityStatusColor = (status: ActivityProgress['status']): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'skipped':
        return '#FF3B30';
      case 'active':
        return '#007AFF';
      case 'paused':
        return '#FF9500';
      default:
        return '#ccc';
    }
  };

  if (state === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.completedTitle}>Workout Complete!</Text>
          <Text style={styles.completedText}>
            Activities: {activityProgresses.filter(p => p.status === 'completed').length}/{activities.length}
          </Text>
          <Text style={styles.completedText}>
            Time: {formatTime(totalTimeElapsed)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.idleContainer}>
          <Text style={styles.planTitle}>{workoutPlan.planName}</Text>
          <Text style={styles.planSubtitle}>
            {activities.length} activities • {workoutPlan.durationMinutes || 30} minutes
          </Text>
          <ScrollView style={styles.activitiesPreview}>
            {activities.map((activity, idx) => (
              <View key={idx} style={styles.previewItem}>
                <Text style={styles.previewItemText}>
                  {idx + 1}. {activity.name} ({activity.sets} sets × {activity.duration}s)
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Icon name="play-arrow" size={32} color="#fff" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'countdown') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
          <Text style={styles.countdownLabel}>Get Ready!</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'ready') {
    const exerciseData = getExerciseData(currentActivity.name) || getDefaultExerciseData(currentActivity.name);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.readyContainer}>
          <Text style={styles.readyTitle}>Ready for {currentActivity.name}?</Text>
          
          {/* Exercise Animation Preview */}
          <View style={styles.readyAnimationContainer}>
            <ExerciseAnimation exerciseName={currentActivity.name} size={200} />
          </View>
          
          <Text style={styles.readyDescription}>{exerciseData.description}</Text>
          <View style={styles.readyDetailsContainer}>
            <View style={styles.readyDetailItem}>
              <Icon name="timer" size={20} color="#007AFF" />
              <Text style={styles.readyDetailText}>{currentActivity.duration}s per set</Text>
            </View>
            <View style={styles.readyDetailItem}>
              <Icon name="repeat" size={20} color="#007AFF" />
              <Text style={styles.readyDetailText}>{currentActivity.sets} sets</Text>
            </View>
            <View style={styles.readyDetailItem}>
              <Icon name="pause-circle-filled" size={20} color="#FF9500" />
              <Text style={styles.readyDetailText}>{currentActivity.rest}s rest</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.startActivityButton}
            onPress={() => {
              activityStartTimeRef.current = Date.now();
              setState('active');
              setTimeRemaining(currentActivity.duration);
              setActivityProgresses(prev => prev.map((prog, idx) => 
                idx === currentActivityIndex 
                  ? { ...prog, status: 'active', startTime: Date.now() }
                  : prog
              ));
            }}
          >
            <Icon name="play-arrow" size={32} color="#fff" />
            <Text style={styles.startActivityButtonText}>Start Activity</Text>
          </TouchableOpacity>
          
          <View style={styles.readyActionsContainer}>
            <TouchableOpacity 
              style={styles.readyActionButton}
              onPress={() => handleSkipActivity(currentActivityIndex)}
            >
              <Icon name="skip-next" size={20} color="#FF9500" />
              <Text style={styles.readyActionText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.readyActionButton}
              onPress={handleEndWorkout}
            >
              <Icon name="stop" size={20} color="#FF3B30" />
              <Text style={styles.readyActionText}>End Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const progressColor = getProgressColor();
  const progress = state === 'active' 
    ? (currentActivity.duration - timeRemaining) / currentActivity.duration
    : (currentActivity.rest - timeRemaining) / currentActivity.rest;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.workoutContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {state === 'active' ? 'Activity' : state === 'rest' ? 'Rest' : 'Paused'}
          </Text>
          <Text style={styles.headerSubtext}>
            {currentActivityIndex + 1} of {activities.length}
          </Text>
        </View>

        {/* Current Activity Display */}
        <View style={styles.currentActivityContainer}>
          {/* Exercise Animation */}
          {state === 'active' && (
            <View style={styles.animationContainer}>
              <ExerciseAnimation exerciseName={currentActivity.name} size={150} />
            </View>
          )}

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <View style={styles.progressRing}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: progressColor,
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.progressInner}>
                <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
                <Text style={styles.activityName}>{currentActivity.name}</Text>
                <Text style={styles.setText}>
                  Set {currentSet} of {currentActivity.sets}
                </Text>
              </View>
            </View>
          </View>

          {/* Current Activity Controls */}
          <View style={styles.currentActivityControls}>
            <AnimatedButton
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => handleSkipActivity(currentActivityIndex)}
            >
              <Icon name="skip-next" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Skip</Text>
            </AnimatedButton>
            
            <AnimatedButton
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteActivity(currentActivityIndex)}
            >
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </AnimatedButton>
          </View>
        </View>

        {/* Activity List */}
        <View style={styles.activityListContainer}>
          <Text style={styles.activityListTitle}>Activity List</Text>
          <FlatList
            data={activities}
            keyExtractor={(item, index) => `activity-${index}`}
            renderItem={({ item, index }) => {
              const prog = activityProgresses[index] || { status: 'not_started' as const, timeRemaining: item.duration };
              const isCurrent = index === currentActivityIndex;
              return (
                <View style={[
                  styles.activityListItem,
                  isCurrent && styles.activityListItemCurrent,
                  prog.status === 'completed' && styles.activityListItemCompleted,
                  prog.status === 'skipped' && styles.activityListItemSkipped,
                ]}>
                  <Icon 
                    name={getActivityStatusIcon(prog.status)} 
                    size={24} 
                    color={getActivityStatusColor(prog.status)} 
                  />
                  <View style={styles.activityListItemContent}>
                    <Text style={styles.activityListItemName}>{item.name}</Text>
                    <Text style={styles.activityListItemDetails}>
                      {prog.status === 'active' || prog.status === 'paused' 
                        ? `Time: ${formatTime(prog.timeRemaining)}`
                        : prog.status === 'completed'
                        ? `Completed in ${prog.actualDuration}s`
                        : `${item.sets} sets × ${item.duration}s`
                      }
                    </Text>
                  </View>
                  <View style={styles.activityListItemActions}>
                    {prog.status === 'not_started' && !isCurrent && (
                      <>
                        <TouchableOpacity 
                          style={styles.listActionButton}
                          onPress={() => {
                            setCurrentActivityIndex(index);
                            setCurrentSet(1);
                            setState('ready');
                          }}
                        >
                          <Icon name="play-arrow" size={18} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.listActionButton}
                          onPress={() => handleSkipActivity(index)}
                        >
                          <Icon name="skip-next" size={18} color="#FF9500" />
                        </TouchableOpacity>
                      </>
                    )}
                    {(prog.status === 'active' || prog.status === 'ready' || isCurrent) && (
                      <>
                        <TouchableOpacity 
                          style={styles.listActionButton}
                          onPress={() => handleSkipActivity(index)}
                        >
                          <Icon name="skip-next" size={18} color="#FF9500" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.listActionButton}
                          onPress={() => handleCompleteActivity(index)}
                        >
                          <Icon name="check" size={18} color="#4CAF50" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            }}
            scrollEnabled={true}
            style={styles.activityList}
          />
        </View>

        {/* Main Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonPrimary]}
            onPress={handlePause}
          >
            <Icon
              name={state === 'paused' ? 'play-arrow' : 'pause'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleEndWorkout}>
            <Icon name="stop" size={28} color="#FF3B30" />
            <Text style={[styles.controlButtonText, { color: '#FF3B30' }]}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{formatTime(totalTimeElapsed)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>
              {activityProgresses.filter(p => p.status === 'completed').length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Skipped</Text>
            <Text style={styles.statValue}>
              {activityProgresses.filter(p => p.status === 'skipped').length}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  idleContainer: {
    flex: 1,
    padding: 20,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  activitiesPreview: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewItemText: {
    fontSize: 16,
    color: '#333',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  countdownLabel: {
    fontSize: 24,
    color: '#666',
    marginTop: 16,
  },
  workoutContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  currentActivityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 150,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.3,
  },
  progressInner: {
    alignItems: 'center',
    zIndex: 1,
  },
  timeText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  setText: {
    fontSize: 14,
    color: '#666',
  },
  currentActivityControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipButton: {
    backgroundColor: '#FF9500',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activityListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  activityListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  activityList: {
    flex: 1,
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityListItemCurrent: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginVertical: 4,
  },
  activityListItemCompleted: {
    opacity: 0.7,
  },
  activityListItemSkipped: {
    opacity: 0.5,
  },
  activityListItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityListItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityListItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  activityListItemActions: {
    flexDirection: 'row',
  },
  listActionButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  readyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  readyAnimationContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  readyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  readyDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  readyDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  readyDetailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  startActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 24,
    minWidth: 200,
  },
  startActivityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  readyActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  readyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  readyActionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
