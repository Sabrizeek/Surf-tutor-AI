import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help & Tutorials</Text>
      <Text style={styles.section}>Getting Started</Text>
      <Text>- Register or log in to create your profile.</Text>
      <Text>- Use the Cardio screen to get a personalized plan.</Text>
      <Text>- Try the AR Sea Drill screen to view technique guides.</Text>
      <Text>- Track your progress and earn badges!</Text>
      <Text style={styles.section}>FAQ</Text>
      <Text>- How do I reset my password? (Feature coming soon)</Text>
      <Text>- How do I earn points? Complete drills and use the app regularly.</Text>
      <Text>- Where are my stats? See the Profile screen for your progress.</Text>
      <Text style={styles.section}>Contact & Support</Text>
      <Text>Email: support@surftutor.ai</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  section: { fontWeight: 'bold', marginTop: 18, marginBottom: 6 }
});