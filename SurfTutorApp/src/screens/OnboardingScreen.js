import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Surf Tutor AI!</Text>
      <Text style={styles.info}>This app helps you learn surfing techniques, track your progress, and get real-time feedback with AR and AI.</Text>
      <Text style={styles.section}>Features:</Text>
      <Text>- Personalized cardio plans</Text>
      <Text>- AR Sea Drill guides</Text>
      <Text>- Land drill coaching (coming soon)</Text>
      <Text>- Progress tracking & gamification</Text>
      <Text>- User profiles</Text>
      <Button title="Get Started" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  info: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  section: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 }
});