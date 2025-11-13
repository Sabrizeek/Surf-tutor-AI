import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Surf Tutor AI</Text>
          <Text style={styles.subtitle}>Your Personal Surfing Coach</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Cardio')}
          >
            <Icon name="fitness-center" size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>Cardio Plans</Text>
            <Text style={styles.cardDescription}>
              Get personalized AI-generated cardio workout recommendations
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('AR')}
          >
            <Icon name="3d-rotation" size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>AR Visualization</Text>
            <Text style={styles.cardDescription}>
              Watch AR guides for surfing techniques in your environment
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Practice')}
          >
            <Icon name="camera-alt" size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>Pose Practice</Text>
            <Text style={styles.cardDescription}>
              Practice land drills with real-time coaching feedback
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Progress')}
          >
            <Icon name="trending-up" size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>Progress</Text>
            <Text style={styles.cardDescription}>
              Track your progress, badges, and achievements
            </Text>
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
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardButton: {
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

