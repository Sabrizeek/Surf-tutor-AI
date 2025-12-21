import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';
import { analyzePose, PoseLandmarks } from '../utils/poseDetection';
import {
  generateMockLandmarks,
  addVariation,
  adjustLandmarksForDrill,
} from '../utils/mockPoseDetector';

const { width, height } = Dimensions.get('window');

// All 8 surf drills with detailed information
const drills = [
  {
    id: 'stance',
    name: 'Stance',
    shortName: 'Stance',
    description: 'Hold a balanced surf stance',
    instruction: 'Keep knees bent (90-140 deg), hips hinged (140-170 deg), and maintain balance',
    icon: 'directions-walk',
    color: '#34C759',
    key: '1',
  },
  {
    id: 'popup',
    name: 'Pop-Up',
    shortName: 'Pop-Up',
    description: 'Practice the pop-up motion',
    instruction: 'Lie down, push up, then jump to your feet in one fluid motion',
    icon: 'arrow-upward',
    color: '#007AFF',
    key: '2',
  },
  {
    id: 'paddling',
    name: 'Paddling',
    shortName: 'Paddle',
    description: 'Arch back & look forward',
    instruction: 'Keep your back arched (less than 165 deg), head up, and look forward while paddling',
    icon: 'rowing',
    color: '#5AC8FA',
    key: '3',
  },
  {
    id: 'bottom_turn',
    name: 'Bottom Turn',
    shortName: 'Bottom Turn',
    description: 'Compress & rotate for bottom turn',
    instruction: 'Bend knees deep (less than 120 deg), rotate shoulders more than hips',
    icon: 'rotate-right',
    color: '#FF9500',
    key: '4',
  },
  {
    id: 'pumping',
    name: 'Pumping',
    shortName: 'Pump',
    description: 'Practice pumping motion (Up/Down)',
    instruction: 'Compress down (less than 110 deg), then extend up (more than 140 deg) in rhythmic motion',
    icon: 'trending-up',
    color: '#FF2D55',
    key: '5',
  },
  {
    id: 'tube_stance',
    name: 'Tube Stance',
    shortName: 'Tube',
    description: 'Hold deep crouch for tube',
    instruction: 'Get LOW! Bend knees (less than 90 deg) and hips (less than 100 deg) for deep crouch',
    icon: 'waves',
    color: '#AF52DE',
    key: '6',
  },
  {
    id: 'falling',
    name: 'Falling',
    shortName: 'Falling',
    description: 'Fall safely & cover your head',
    instruction: 'When falling, immediately cover your head with both hands',
    icon: 'warning',
    color: '#FF3B30',
    key: '7',
  },
  {
    id: 'cutback',
    name: 'Cutback',
    shortName: 'Cutback',
    description: 'Lead turn with head & shoulders',
    instruction: 'Turn head and shoulders first, keep stance balanced, lead with your head',
    icon: 'swap-horiz',
    color: '#FFCC00',
    key: '8',
  },
];

// Feedback types for real-time coaching
interface FeedbackItem {
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
  priority: number; // Higher priority = shown first
}

interface DrillStats {
  correctTime: number; // Time in correct position (ms)
  totalTime: number; // Total practice time (ms)
  reps: number; // Number of successful reps
  bestScore: number; // Best score achieved (0-100)
}

export default function PosePracticeScreen() {
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showDrillMenu, setShowDrillMenu] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [score, setScore] = useState(0); // 0-100 score
  const [personDetected, setPersonDetected] = useState(false);
  const [drillStats, setDrillStats] = useState<Record<string, DrillStats>>({});
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  
  const camera = useRef<Camera>(null);
  const frontDevice = useCameraDevice('front');
  const backDevice = useCameraDevice('back');
  const device = isFrontCamera ? frontDevice : backDevice;
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const previousDataRef = useRef<any>({});
  const frameCountRef = useRef(0);
  const lastAnalysisTimeRef = useRef(0);
  const humanFramesDetectedRef = useRef(0); // Temporal validation: count consecutive frames with human
  const lastPersonDetectedRef = useRef(false);

  // Initialize stats for all drills
  useEffect(() => {
    const initialStats: Record<string, DrillStats> = {};
    drills.forEach((drill) => {
      initialStats[drill.id] = {
        correctTime: 0,
        totalTime: 0,
        reps: 0,
        bestScore: 0,
      };
    });
    setDrillStats(initialStats);
  }, []);

  // Animate score changes
  useEffect(() => {
    Animated.spring(scoreAnimation, {
      toValue: score,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [score]);

  // Animate feedback appearance
  useEffect(() => {
    if (feedback.length > 0) {
      Animated.sequence([
        Animated.timing(feedbackAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      feedbackAnimation.setValue(0);
    }
  }, [feedback]);

  // Real-time pose detection and analysis with temporal validation
  useEffect(() => {
    if (!isRecording || !selectedDrill) {
      setPersonDetected(false);
      setFeedback([]);
      setScore(0);
      humanFramesDetectedRef.current = 0;
      lastPersonDetectedRef.current = false;
      return;
    }

    // Optimize frame rate: analyze every 3-4 frames (target 25-30 FPS)
    const targetFPS = 30;
    const analysisInterval = 1000 / targetFPS; // ~33ms per analysis
    const REQUIRED_CONSECUTIVE_FRAMES = 3; // Require 3 consecutive frames for confirmation

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastAnalysisTimeRef.current < analysisInterval) {
        return; // Skip this frame to maintain target FPS
      }
      lastAnalysisTimeRef.current = now;

      // Generate mock landmarks (in production, this would come from MediaPipe)
      // Simulate realistic person detection: 
      // - When camera is active and user is positioned correctly, person should be detected
      // - But occasionally (5% chance) simulate no detection for realism
      // In real implementation, MediaPipe would determine this based on actual keypoint detection
      const hasPerson = Math.random() > 0.05; // 95% detection rate when camera is active (realistic)
      
      // Generate and adjust landmarks for current drill
      let mockLandmarks: PoseLandmarks | null = null;
      if (hasPerson) {
        mockLandmarks = generateMockLandmarks(width, height, true);
        if (mockLandmarks) {
          mockLandmarks = adjustLandmarksForDrill(mockLandmarks, selectedDrill);
          mockLandmarks = addVariation(mockLandmarks, 0.01); // Add slight variation for realism
        }
      }
      
      // Analyze pose using our detection logic
      // This will check if person is actually detected based on keypoint visibility
      if (!mockLandmarks) {
        // No landmarks - reset temporal counter
        humanFramesDetectedRef.current = 0;
        lastPersonDetectedRef.current = false;
        setPersonDetected(false);
        setFeedback([{
          text: 'No person detected. Step into view.',
          type: 'error',
          priority: 1,
        }]);
        setScore(0);
        return;
      }
      
      const analysis = analyzePose(selectedDrill, mockLandmarks, previousDataRef.current);
      
      // Temporal validation: Require 3 consecutive frames with person detected
      if (analysis.personDetected) {
        humanFramesDetectedRef.current++;
        lastPersonDetectedRef.current = true;
      } else {
        // Person not detected in this frame - reset counter
        humanFramesDetectedRef.current = 0;
        lastPersonDetectedRef.current = false;
      }

      // Only confirm person detection after 3 consecutive frames
      const confirmedPersonDetected = humanFramesDetectedRef.current >= REQUIRED_CONSECUTIVE_FRAMES;
      setPersonDetected(confirmedPersonDetected);
      
      // STRICT: Only show scores and feedback if person is confirmed (3 consecutive frames)
      if (confirmedPersonDetected && analysis.personDetected) {
          // Convert analysis feedback to UI feedback items
          const newFeedback: FeedbackItem[] = analysis.feedback.map((text, index) => {
            let type: 'success' | 'warning' | 'error' | 'info' = 'info';
            let priority = 1;
            
            if (text.includes('GREAT') || text.includes('GOOD')) {
              type = 'success';
              priority = 3;
            } else if (text.includes('!') || text.includes('more') || text.includes('Adjust')) {
              type = 'warning';
              priority = 2;
            } else if (text.includes('Ensure') || text.includes('No person')) {
              type = 'error';
              priority = 1;
            }
            
            return { text, type, priority };
          });
          
          setFeedback(newFeedback);
          updateScore(analysis.score);
          
          // Update previous data for drills that need state tracking
          if (selectedDrill === 'pumping') {
            previousDataRef.current.pumpState = analysis.score > 70 ? 'HIGH' : 'LOW';
          } else if (selectedDrill === 'falling') {
            const lHip = mockLandmarks.leftHip;
            const rHip = mockLandmarks.rightHip;
            if (lHip && rHip) {
              previousDataRef.current.hipMid = {
                x: (lHip.x + rHip.x) / 2,
                y: (lHip.y + rHip.y) / 2,
              };
            }
          }
        } else {
          // Person not confirmed yet (less than 3 frames) or not detected
          if (humanFramesDetectedRef.current > 0 && humanFramesDetectedRef.current < REQUIRED_CONSECUTIVE_FRAMES) {
            // Show "Detecting..." message while waiting for confirmation
            setFeedback([{
              text: `Detecting person... (${humanFramesDetectedRef.current}/${REQUIRED_CONSECUTIVE_FRAMES})`,
              type: 'info',
              priority: 1,
            }]);
          } else {
            setFeedback([{
              text: analysis.feedback[0] || 'No person detected. Step into view.',
              type: 'error',
              priority: 1,
            }]);
          }
          setScore(0);
        }
      
      frameCountRef.current++;
    }, 33); // Check every 33ms (30 FPS)

    return () => {
      clearInterval(intervalId);
      humanFramesDetectedRef.current = 0;
      lastPersonDetectedRef.current = false;
    };
  }, [isRecording, selectedDrill, isFrontCamera]);


  const updateScore = (newScore: number) => {
    setScore(Math.min(100, Math.max(0, Math.round(newScore))));
    
    // Update stats
    if (selectedDrill) {
      setDrillStats((prev) => {
        const stats = prev[selectedDrill] || { correctTime: 0, totalTime: 0, reps: 0, bestScore: 0 };
        return {
          ...prev,
          [selectedDrill]: {
            ...stats,
            bestScore: Math.max(stats.bestScore, newScore),
            totalTime: stats.totalTime + 100,
            correctTime: newScore > 70 ? stats.correctTime + 100 : stats.correctTime,
          },
        };
      });
    }
  };

  React.useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status === 'granted') {
      setHasPermission(true);
    } else {
      const newStatus = await Camera.requestCameraPermission();
      setHasPermission(newStatus === 'granted');
    }
  };

  const handleStartPractice = (drillId: string) => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required for pose practice');
      return;
    }
    setSelectedDrill(drillId);
    setIsRecording(true);
    setShowDrillMenu(false);
    setFeedback([]);
    setScore(0);
    setPracticeStartTime(Date.now());
  };

  const handleStopPractice = () => {
    setIsRecording(false);
    const practiceTime = practiceStartTime ? Date.now() - practiceStartTime : 0;
    
    // Update final stats
    if (selectedDrill) {
      const stats = drillStats[selectedDrill] || { correctTime: 0, totalTime: 0, reps: 0, bestScore: 0 };
      const accuracy = stats.totalTime > 0 ? (stats.correctTime / stats.totalTime) * 100 : 0;
      
      Alert.alert(
        'Practice Complete',
        `Drill: ${drills.find((d) => d.id === selectedDrill)?.name}\n\n` +
        `Score: ${score}%\n` +
        `Best Score: ${stats.bestScore.toFixed(0)}%\n` +
        `Accuracy: ${accuracy.toFixed(1)}%\n` +
        `Practice Time: ${(practiceTime / 1000).toFixed(1)}s`,
        [
          { text: 'Continue', onPress: () => {} },
          { text: 'Back to Menu', onPress: () => setSelectedDrill(null) },
        ]
      );
    }
  };

  const handleDrillSwitch = (drillId: string) => {
    if (isRecording) {
      handleStopPractice();
    }
    handleStartPractice(drillId);
  };

  const getScoreColor = () => {
    if (score >= 80) return '#34C759'; // Green
    if (score >= 60) return '#FFCC00'; // Yellow
    return '#FF3B30'; // Red
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FFCC00';
      case 'error':
        return '#FF3B30';
      default:
        return '#5AC8FA';
    }
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholder}>
          <Icon name="camera-alt" size={64} color="#666" />
          <Text style={styles.placeholderText}>Camera not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentDrill = drills.find((d) => d.id === selectedDrill);

  return (
    <SafeAreaView style={styles.container}>
      {!selectedDrill ? (
        // Drill Selection Menu
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Surf Pose Coach</Text>
            <Text style={styles.menuSubtitle}>Select a drill to practice</Text>
          </View>

          <ScrollView 
            style={styles.drillsScrollView}
            contentContainerStyle={styles.drillsContainer}
            showsVerticalScrollIndicator={false}
          >
            {drills.map((drill, index) => {
              const stats = drillStats[drill.id] || { correctTime: 0, totalTime: 0, reps: 0, bestScore: 0 };
              const accuracy = stats.totalTime > 0 ? (stats.correctTime / stats.totalTime) * 100 : 0;
              
              return (
                <TouchableOpacity
                  key={drill.id}
                  style={[styles.drillCard, { borderLeftColor: drill.color, borderLeftWidth: 6 }]}
                  onPress={() => handleStartPractice(drill.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.drillCardHeader}>
                    <View style={[styles.drillIconContainer, { backgroundColor: drill.color + '20' }]}>
                      <Icon name={drill.icon} size={32} color={drill.color} />
                    </View>
                    <View style={styles.drillCardInfo}>
                      <View style={styles.drillCardTitleRow}>
                        <Text style={styles.drillCardNumber}>{drill.key}</Text>
                        <Text style={styles.drillCardName}>{drill.name}</Text>
                      </View>
                      <Text style={styles.drillCardDescription}>{drill.description}</Text>
                      <Text style={styles.drillCardInstruction}>{drill.instruction}</Text>
                    </View>
                  </View>
                  
                  {stats.bestScore > 0 && (
                    <View style={styles.drillStatsRow}>
                      <View style={styles.statItem}>
                        <Icon name="star" size={16} color="#FFCC00" />
                        <Text style={styles.statText}>Best: {stats.bestScore.toFixed(0)}%</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="check-circle" size={16} color="#34C759" />
                        <Text style={styles.statText}>Reps: {stats.reps}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="trending-up" size={16} color="#5AC8FA" />
                        <Text style={styles.statText}>{accuracy.toFixed(0)}%</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.menuFooter}>
            <Text style={styles.footerText}>
              Tip: Use the side panel buttons (1-8) to quickly switch between drills during practice
            </Text>
          </View>
        </View>
      ) : (
        // Practice View
        <View style={styles.cameraContainer}>
          {hasPermission ? (
            <>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isRecording}
                frameProcessor={undefined} // TODO: Add pose estimation frame processor
              />
              
              {/* Top Overlay - Drill Info & Score */}
              <View style={styles.overlayTop}>
                <View style={styles.topBar}>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                      if (isRecording) handleStopPractice();
                      setSelectedDrill(null);
                    }}
                  >
                    <Icon name="arrow-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <View style={styles.drillTitleContainer}>
                    <Text style={styles.drillTitleOverlay}>
                      {currentDrill?.key}. {currentDrill?.name}
                    </Text>
                  </View>
                  
                  {/* Camera Toggle Button */}
                  <TouchableOpacity
                    style={styles.cameraToggleButton}
                    onPress={() => setIsFrontCamera(!isFrontCamera)}
                  >
                    <Icon name={isFrontCamera ? "camera-front" : "camera-rear"} size={18} color="#fff" />
                    <Text style={styles.cameraToggleText}>{isFrontCamera ? "Front" : "Back"}</Text>
                  </TouchableOpacity>
                  
                  {personDetected ? (
                    <View style={[styles.scoreContainer, { backgroundColor: getScoreColor() + 'CC' }]}>
                      <Animated.Text style={[styles.scoreText, { opacity: scoreAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0.5, 1],
                      }) }]}>
                        {score}%
                      </Animated.Text>
                    </View>
                  ) : (
                    <View style={[styles.scoreContainer, { backgroundColor: 'rgba(128, 128, 128, 0.8)' }]}>
                      <Text style={styles.scoreText}>--</Text>
                    </View>
                  )}
                </View>

                {/* Real-time Feedback Display */}
                {personDetected && feedback.length > 0 && (
                  <Animated.View 
                    style={[
                      styles.feedbackContainer,
                      {
                        opacity: feedbackAnimation,
                        transform: [{
                          translateY: feedbackAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    {feedback
                      .sort((a, b) => b.priority - a.priority)
                      .slice(0, 3)
                      .map((item, index) => (
                        <View
                          key={index}
                          style={[
                            styles.feedbackItem,
                            { backgroundColor: getFeedbackColor(item.type) + 'E6' },
                          ]}
                        >
                          <Icon
                            name={
                              item.type === 'success'
                                ? 'check-circle'
                                : item.type === 'warning'
                                ? 'warning'
                                : 'error'
                            }
                            size={24}
                            color="#fff"
                            style={styles.feedbackIcon}
                          />
                          <Text style={styles.feedbackText}>{item.text}</Text>
                        </View>
                      ))}
                  </Animated.View>
                )}
              </View>

              {/* Side Panel - Quick Drill Switch */}
              <View style={styles.sidePanel}>
                <ScrollView 
                  style={styles.drillButtonsContainer}
                  contentContainerStyle={styles.drillButtonsContent}
                  showsVerticalScrollIndicator={false}
                >
                  {drills.map((drill) => (
                    <TouchableOpacity
                      key={drill.id}
                      style={[
                        styles.drillButton,
                        selectedDrill === drill.id && styles.drillButtonActive,
                        { borderColor: drill.color },
                      ]}
                      onPress={() => handleDrillSwitch(drill.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.drillButtonText, selectedDrill === drill.id && styles.drillButtonTextActive]}>
                        {drill.key}
                      </Text>
                      <Icon
                        name={drill.icon}
                        size={20}
                        color={selectedDrill === drill.id ? '#fff' : drill.color}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Bottom Overlay - Instructions & Controls */}
              <View style={styles.overlayBottom}>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionText}>{currentDrill?.instruction}</Text>
                </View>
                
                <View style={styles.controlsRow}>
                  {!isRecording ? (
                    <TouchableOpacity
                      style={[styles.controlButton, styles.startButton]}
                      onPress={() => setIsRecording(true)}
                    >
                      <Icon name="play-arrow" size={24} color="#fff" />
                      <Text style={styles.controlButtonText}>Start Practice</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.controlButton, styles.stopButton]}
                      onPress={handleStopPractice}
                    >
                      <Icon name="stop" size={24} color="#fff" />
                      <Text style={styles.controlButtonText}>Stop</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Progress Indicator */}
                {isRecording && selectedDrill && personDetected && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: scoreAnimation.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: getScoreColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>Form Accuracy</Text>
                  </View>
                )}
                
                {/* Person Detection Status */}
                {isRecording && !personDetected && (
                  <View style={styles.noPersonContainer}>
                    <Icon name="person-off" size={48} color="#fff" />
                    <Text style={styles.noPersonText}>No person detected</Text>
                    <Text style={styles.noPersonSubtext}>Position yourself in front of the camera</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Icon name="camera-alt" size={64} color="#666" />
              <Text style={styles.placeholderText}>Camera permission required</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={checkCameraPermission}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Menu Styles
  menuContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuHeader: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  drillsScrollView: {
    flex: 1,
  },
  drillsContainer: {
    padding: 16,
  },
  drillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drillCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  drillIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drillCardInfo: {
    flex: 1,
  },
  drillCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  drillCardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
    width: 24,
  },
  drillCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  drillCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  drillCardInstruction: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    lineHeight: 16,
  },
  drillStatsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  menuFooter: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
  },
  // Camera View Styles
  cameraContainer: {
    flex: 1,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drillTitleContainer: {
    flex: 1,
  },
  drillTitleOverlay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scoreContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackIcon: {
    marginRight: 12,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sidePanel: {
    position: 'absolute',
    right: 0,
    top: 80,
    bottom: 200,
    width: 60,
    zIndex: 10,
  },
  drillButtonsContainer: {
    flex: 1,
  },
  drillButtonsContent: {
    paddingVertical: 8,
  },
  drillButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 6,
  },
  drillButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderColor: '#fff',
  },
  drillButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  drillButtonTextActive: {
    color: '#fff',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    zIndex: 10,
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 150,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noPersonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 24,
    borderRadius: 12,
    width: 200,
    marginLeft: -100,
    marginTop: -50,
  },
  noPersonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  noPersonSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  cameraToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  cameraToggleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
