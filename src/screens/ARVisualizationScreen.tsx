import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const techniques = [
  {
    id: 'catch-wave',
    name: 'Catching a Wave',
    description: 'Learn the timing and positioning for catching waves',
    icon: '🌊',
  },
  {
    id: 'pop-up',
    name: 'Pop-Up',
    description: 'Master the pop-up technique to get on your board',
    icon: '🏄',
  },
  {
    id: 'turning',
    name: 'Turning',
    description: 'Learn how to turn and maneuver on the wave',
    icon: '🔄',
  },
  {
    id: 'bottom-turn',
    name: 'Bottom Turn',
    description: 'Essential technique for setting up your ride',
    icon: '↪️',
  },
  {
    id: 'cutback',
    name: 'Cutback',
    description: 'Advanced maneuver to stay in the wave',
    icon: '⚡',
  },
];

export default function ARVisualizationScreen() {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const handleViewTechnique = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    // TODO: Integrate AR view here when FBX models are ready
    Alert.alert(
      'AR Visualization',
      'AR visualization will be available once FBX models are integrated. For now, you can practice the technique using the Pose Practice feature.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>AR Visualization</Text>
        <Text style={styles.subtitle}>
          Choose a surfing technique to visualize in AR
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📝 Note: FBX animation models are still being created. AR visualization will be available soon.
          </Text>
        </View>

        {techniques.map((technique) => (
          <TouchableOpacity
            key={technique.id}
            style={[
              styles.techniqueCard,
              selectedTechnique === technique.id && styles.techniqueCardSelected,
            ]}
            onPress={() => handleViewTechnique(technique.id)}
          >
            <Text style={styles.techniqueIcon}>{technique.icon}</Text>
            <View style={styles.techniqueContent}>
              <Text style={styles.techniqueName}>{technique.name}</Text>
              <Text style={styles.techniqueDescription}>
                {technique.description}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>AR View Placeholder</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              When FBX models are ready, the AR view will appear here showing
              the selected technique in your environment.
            </Text>
            <Text style={styles.placeholderText}>
              You'll be able to:
            </Text>
            <Text style={styles.placeholderBullet}>
              • See 3D animations of the technique
            </Text>
            <Text style={styles.placeholderBullet}>
              • View from different angles
            </Text>
            <Text style={styles.placeholderBullet}>
              • Understand timing and motion
            </Text>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
  },
  techniqueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techniqueCardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  techniqueIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  techniqueContent: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
    marginLeft: 8,
  },
  placeholderContainer: {
    marginTop: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  placeholderBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  placeholderBullet: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
});

