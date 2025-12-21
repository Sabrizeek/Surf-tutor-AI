import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
// @ts-ignore - react-native-vector-icons doesn't have TypeScript definitions
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authAPI } from '../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');

  const goals = ['Endurance', 'Strength', 'Flexibility', 'Balance', 'Power', 'Stamina', 'Fat Loss'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('[ProfileScreen] Loading profile...');
      const response = await authAPI.getProfile();
      console.log('[ProfileScreen] Profile loaded:', response);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      const user = response.user;
      console.log('[ProfileScreen] User data:', user);
      
      setProfile(user);
      setName(user.name || '');
      setAge(user.age?.toString() || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      // Handle goal as array or string (backward compatibility)
      const userGoals = Array.isArray(user.goal) ? user.goal : (user.goal ? [user.goal] : []);
      setGoal(userGoals);
      setSkillLevel(user.skillLevel || '');
      
      console.log('[ProfileScreen] Profile state updated successfully');
    } catch (error: any) {
      console.error('[ProfileScreen] Error loading profile:', error);
      console.error('[ProfileScreen] Error response:', error.response?.data);
      console.error('[ProfileScreen] Error status:', error.response?.status);
      console.error('[ProfileScreen] Full error:', JSON.stringify(error.response?.data || error, null, 2));
      
      const errorData = error.response?.data || {};
      const errorMsg = errorData.error || error.message || 'Failed to load profile';
      const errorDetails = errorData.details || errorData.message || '';
      const errorName = errorData.name || '';
      
      let displayMessage = errorMsg;
      if (errorDetails) {
        displayMessage += `\n\nDetails: ${errorDetails}`;
      }
      if (errorName) {
        displayMessage += `\n\nType: ${errorName}`;
      }
      
      // Special handling for database errors
      if (errorMsg === 'database not available' || error.response?.status === 503) {
        displayMessage = 'Database connection issue.\n\nPlease ensure MongoDB is running and MONGODB_URI is configured correctly.';
      }
      
      Alert.alert(
        'Error', 
        errorMsg === 'invalid token' || errorMsg === 'missing auth' 
          ? 'Unable to load profile. Please re-login.' 
          : displayMessage,
        [
          { text: 'OK' },
          ...(errorMsg === 'invalid token' || errorMsg === 'missing auth' 
            ? [{ text: 'Re-login', onPress: async () => { 
                await authAPI.logout(); 
                router.replace('/login');
              } }]
            : [])
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates: any = {};
      if (name) updates.name = name;
      if (age) {
        const ageNum = parseFloat(age);
        if (!isNaN(ageNum) && ageNum > 0) updates.age = ageNum;
      }
      if (height) {
        const heightNum = parseFloat(height);
        if (!isNaN(heightNum) && heightNum > 0) updates.height = heightNum;
      }
      if (weight) {
        const weightNum = parseFloat(weight);
        if (!isNaN(weightNum) && weightNum > 0) updates.weight = weightNum;
      }
      if (goal && goal.length > 0) updates.goal = goal;
      if (skillLevel) updates.skillLevel = skillLevel;

      await authAPI.updateProfile(updates);
      await loadProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authAPI.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const calculateBMI = () => {
    if (height && weight) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (h > 0 && w > 0) {
        return (w / Math.pow(h / 100, 2)).toFixed(1);
      }
    }
    return profile?.bmi?.toFixed(1) || 'N/A';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Icon name="edit" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.value}>{profile?.name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{profile?.age ? `${profile.age} years` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Height (cm)</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter height in cm"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{profile?.height ? `${profile.height} cm` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight (kg)</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight in kg"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{profile?.weight ? `${profile.weight} kg` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>BMI</Text>
          <Text style={styles.value}>{calculateBMI()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goals</Text>
          {editing ? (
            <View style={styles.buttonGroup}>
              {goals.map((g) => {
                const isSelected = goal.includes(g);
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.button, isSelected && styles.buttonActive]}
                    onPress={() => {
                      if (isSelected) {
                        setGoal(goal.filter(goalItem => goalItem !== g));
                      } else {
                        setGoal([...goal, g]);
                      }
                    }}
                  >
                    <Text style={[styles.buttonText, isSelected && styles.buttonTextActive]}>
                      {g} {isSelected ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.value}>
              {Array.isArray(profile?.goal) && profile.goal.length > 0
                ? profile.goal.join(', ')
                : (profile?.goal || 'Not set')}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Skill Level</Text>
          {editing ? (
            <View style={styles.buttonGroup}>
              {skillLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.button, skillLevel === level && styles.buttonActive]}
                  onPress={() => setSkillLevel(level)}
                >
                  <Text style={[styles.buttonText, skillLevel === level && styles.buttonTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>{profile?.skillLevel || 'Not set'}</Text>
          )}
        </View>

        {editing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditing(false);
                loadProfile();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    backgroundColor: '#f0f0f0',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

