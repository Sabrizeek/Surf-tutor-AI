import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../auth/AuthContext';

export default function ProfileScreen() {
  const { user, loading, refreshProfile, logout } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', height: '', weight: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', age: user.age || '', height: user.height || '', weight: user.weight || '', bio: user.bio || '' });
    }
  }, [user]);

  if (loading) return <ActivityIndicator style={{flex:1}} />;

  function validate() {
    if (!form.name) return 'Name required.';
    if (form.age && isNaN(Number(form.age))) return 'Age must be a number.';
    if (form.height && isNaN(Number(form.height))) return 'Height must be a number.';
    if (form.weight && isNaN(Number(form.weight))) return 'Weight must be a number.';
    return null;
  }

  async function onSave() {
    setSaving(true);
    const v = validate();
    if (v) { Alert.alert('Validation', v); setSaving(false); return; }
    try {
      // Use AuthContext's updateProfile method
      await updateProfile(form);
      await refreshProfile();
      setEditing(false);
      Alert.alert('Profile', 'Saved');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {!editing ? (
        <View>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || '-'}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user?.age || '-'}</Text>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>{user?.height || '-'}</Text>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{user?.weight || '-'}</Text>
          <Button title="Edit" onPress={() => setEditing(true)} />
          <View style={{ height: 8 }} />
          <Button title="Sign out" color="#d00" onPress={() => logout()} />
        </View>
      ) : (
        <View>
          <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="Full name" />
          <TextInput style={styles.input} value={form.age} onChangeText={(t) => setForm({ ...form, age: t })} placeholder="Age" keyboardType="numeric" />
          <TextInput style={styles.input} value={form.height} onChangeText={(t) => setForm({ ...form, height: t })} placeholder="Height (cm)" keyboardType="numeric" />
          <TextInput style={styles.input} value={form.weight} onChangeText={(t) => setForm({ ...form, weight: t })} placeholder="Weight (kg)" keyboardType="numeric" />
          <TextInput style={styles.input} value={form.bio} onChangeText={(t) => setForm({ ...form, bio: t })} placeholder="Short bio" />
          {saving ? <ActivityIndicator /> : <Button title="Save" onPress={onSave} />}
          <View style={{ height: 8 }} />
          <Button title="Cancel" onPress={() => setEditing(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 12, color: '#666', marginTop: 8 },
  value: { fontSize: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 6 }
});
