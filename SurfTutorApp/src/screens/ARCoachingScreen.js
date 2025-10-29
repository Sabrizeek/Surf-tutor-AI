import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Scaffold for future AR coaching integration
export default function ARCoachingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR Coaching (Land Drills)</Text>
      <Text style={styles.info}>This screen will use the camera and pose estimation to provide real-time feedback for land drills.</Text>
      <Text style={styles.note}>Implementation: Integrate react-native-vision-camera and pose model (MoveNet/MediaPipe) in future.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  info: { textAlign: 'center', marginBottom: 12 },
  note: { marginTop: 16, color: '#666' }
});