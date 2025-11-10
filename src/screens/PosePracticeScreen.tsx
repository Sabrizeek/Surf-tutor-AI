import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

const drills = [
  {
    id: 'pop-up',
    name: 'Pop-Up',
    description: 'Practice the pop-up motion on land',
    color: '#007AFF',
  },
  {
    id: 'stance',
    name: 'Stance',
    description: 'Perfect your surfing stance',
    color: '#34C759',
  },
  {
    id: 'balance',
    name: 'Balance',
    description: 'Improve your balance and stability',
    color: '#FF9500',
  },
];

export default function PosePracticeScreen() {
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('front');

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
  };

  const handleStopPractice = () => {
    setIsRecording(false);
    setSelectedDrill(null);
    // TODO: Process pose estimation results and show feedback
    Alert.alert(
      'Practice Complete',
      'Your pose has been analyzed. Real-time feedback will be available once pose estimation is fully integrated.',
      [{ text: 'OK' }]
    );
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Camera not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!selectedDrill ? (
        <View style={styles.selectionContainer}>
          <Text style={styles.title}>Pose Practice</Text>
          <Text style={styles.subtitle}>
            Select a drill to practice with real-time coaching
          </Text>

          {drills.map((drill) => (
            <TouchableOpacity
              key={drill.id}
              style={[styles.drillCard, { borderColor: drill.color }]}
              onPress={() => handleStartPractice(drill.id)}
            >
              <Text style={styles.drillName}>{drill.name}</Text>
              <Text style={styles.drillDescription}>{drill.description}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              • Select a drill to practice{'\n'}
              • Position yourself in front of the camera{'\n'}
              • Get real-time color-coded feedback on your form{'\n'}
              • Green = correct, Yellow = needs adjustment, Red = incorrect
            </Text>
          </View>
        </View>
      ) : (
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
              <View style={styles.overlay}>
                <View style={styles.overlayTop}>
                  <Text style={styles.drillNameOverlay}>
                    {drills.find((d) => d.id === selectedDrill)?.name}
                  </Text>
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackText}>
                      Position yourself in frame
                    </Text>
                    <Text style={styles.feedbackSubtext}>
                      Real-time feedback will appear here
                    </Text>
                  </View>
                </View>
                <View style={styles.overlayBottom}>
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopPractice}
                  >
                    <Text style={styles.stopButtonText}>Stop Practice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Camera permission required
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={checkCameraPermission}
              >
                <Text style={styles.permissionButtonText}>
                  Grant Permission
                </Text>
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
  selectionContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  drillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drillName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  drillDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    padding: 20,
    paddingTop: 40,
  },
  drillNameOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  feedbackBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  feedbackSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  overlayBottom: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

