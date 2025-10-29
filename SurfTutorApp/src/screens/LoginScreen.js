import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../auth/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validate() {
    if (!email || !password) return 'Email and password required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }

  async function onSubmit() {
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
  {error ? <Text style={styles.error}>{error}</Text> : null}
  {loading ? <ActivityIndicator /> : <Button title="Sign In" onPress={onSubmit} />}

      <View style={styles.row}>
        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.link}> Register</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 6 },
  row: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
  link: { color: '#007AFF' },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' }
});
