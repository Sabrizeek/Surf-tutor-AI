import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// NOTE: This is a scaffold for the AR Sea Drill screen. For MVP we recommend playing a video on an AR plane.

function ARSeaDrillScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR Sea Drill (scaffold)</Text>
      <Text style={styles.info}>This screen will let the user select a drill and view an AR visualization (video or 3D model).</Text>
      <Pressable style={styles.button} onPress={() => { /* open picker */ }}>
        <Text style={styles.buttonText}>Select Drill (placeholder)</Text>
      </Pressable>
      <Text style={styles.note}>Implementation: integrate ViroReact or react-native-vision-camera + AR plugin.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  info: { textAlign: 'center', marginBottom: 12 },
  note: { marginTop: 16, color: '#666' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' }
});

export default ARSeaDrillScreen;
