import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (age && (isNaN(parseFloat(age)) || parseFloat(age) < 1 || parseFloat(age) > 120)) {
      Alert.alert('Error', 'Please enter a valid age (1-120)');
      return;
    }

    if (weight && (isNaN(parseFloat(weight)) || parseFloat(weight) < 1 || parseFloat(weight) > 500)) {
      Alert.alert('Error', 'Please enter a valid weight (1-500 kg)');
      return;
    }

    if (height && (isNaN(parseFloat(height)) || parseFloat(height) < 50 || parseFloat(height) > 300)) {
      Alert.alert('Error', 'Please enter a valid height (50-300 cm)');
      return;
    }

    setLoading(true);
    try {
      const profile: any = {};
      if (age) profile.age = parseFloat(age);
      if (weight) profile.weight = parseFloat(weight);
      if (height) profile.height = parseFloat(height);
      if (goal && goal.length > 0) profile.goal = goal;
      if (skillLevel) profile.skillLevel = skillLevel;

      await authAPI.register(email, password, name || undefined, profile);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create account. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Surf Tutor AI</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age in years"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter weight in kg"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter height in cm"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level (Optional)</Text>
            <View style={styles.rowBtns}>
              {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.pill, skillLevel === lvl && styles.pillActive]}
                  onPress={() => setSkillLevel(lvl)}
                >
                  <Text style={[styles.pillText, skillLevel === lvl && styles.pillTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goals (Optional - Select Multiple)</Text>
            <View style={styles.rowBtns}>
              {['Endurance', 'Power', 'Fat Loss', 'Stamina', 'Strength', 'Flexibility', 'Balance'].map((g) => {
                const isSelected = goal.includes(g);
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => {
                      if (isSelected) {
                        setGoal(goal.filter(goalItem => goalItem !== g));
                      } else {
                        setGoal([...goal, g]);
                      }
                    }}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {g} {isSelected ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Already have an account? Login
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
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff3b30',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rowBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: {
    backgroundColor: '#007AFF',
  },
  pillText: {
    color: '#333',
    fontSize: 14,
  },
  pillTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

