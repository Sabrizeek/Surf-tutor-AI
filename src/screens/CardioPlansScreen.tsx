import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cardioAPI } from '../services/api';

export default function CardioPlansScreen() {
  const [skillLevel, setSkillLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const goals = ['Endurance', 'Strength', 'Flexibility', 'Balance', 'Power'];

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        return weightInKg / (heightInMeters * heightInMeters);
      }
    }
    return null;
  };

  const handleGetRecommendations = async () => {
    if (!skillLevel || !goal) {
      Alert.alert('Error', 'Please select skill level and goal');
      return;
    }

    setLoading(true);
    try {
      const userDetails: any = {};
      if (height) userDetails.height = parseFloat(height);
      if (weight) userDetails.weight = parseFloat(weight);
      if (age) userDetails.age = parseFloat(age);
      
      const bmi = calculateBMI();
      if (bmi) userDetails.bmi = bmi;

      const response = await cardioAPI.getRecommendations(
        skillLevel,
        goal,
        Object.keys(userDetails).length > 0 ? userDetails : undefined
      );

      if (response.recommendedExercises) {
        setRecommendations(
          Array.isArray(response.recommendedExercises)
            ? response.recommendedExercises
            : [response.recommendedExercises]
        );
      } else {
        Alert.alert('Error', 'No recommendations received');
      }
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to get recommendations. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cardio Plans</Text>
        <Text style={styles.subtitle}>
          Enter your details to get personalized workout recommendations
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Skill Level *</Text>
          <View style={styles.buttonGroup}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.button,
                  skillLevel === level && styles.buttonActive,
                ]}
                onPress={() => setSkillLevel(level)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    skillLevel === level && styles.buttonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal *</Text>
          <View style={styles.buttonGroup}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.button, goal === g && styles.buttonActive]}
                onPress={() => setGoal(g)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    goal === g && styles.buttonTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g., 175"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g., 70"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="e.g., 25"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleGetRecommendations}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Get Recommendations</Text>
          )}
        </TouchableOpacity>

        {recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommended Exercises:</Text>
            {recommendations.map((exercise, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>• {exercise}</Text>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  buttonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

