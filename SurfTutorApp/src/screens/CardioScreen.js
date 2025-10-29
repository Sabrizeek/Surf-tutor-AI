import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import ApiClient from '../auth/ApiClient';

export default function CardioScreen() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  async function fetchPlan() {
    setLoading(true);
    setError(null);
    try {
      // Example payload; adapt as needed
      const res = await ApiClient.fetchWithAuth('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({ skillLevel: 'beginner', goal: 'cardio' })
      });
      setPlan(res.recommendedExercises || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cardio Plan</Text>
      <Button title="Get Cardio Plan" onPress={fetchPlan} disabled={loading} />
      {loading && <ActivityIndicator style={{marginTop:12}} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {plan && plan.length > 0 && (
        <View style={styles.planBox}>
          <Text style={styles.planTitle}>Recommended Exercises:</Text>
          {plan.map((ex, i) => (
            <Text key={i} style={styles.exercise}>{ex}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  error: { color: 'red', marginTop: 8, textAlign: 'center' },
  planBox: { marginTop: 20, padding: 12, backgroundColor: '#f6f6f6', borderRadius: 8 },
  planTitle: { fontWeight: 'bold', marginBottom: 8 },
  exercise: { fontSize: 16, marginBottom: 4 }
});