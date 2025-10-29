import React, { createContext, useState, useEffect } from 'react';
import ApiClient from './ApiClient';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshProfile: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await ApiClient.getToken();
      if (t) {
        setToken(t);
        try {
          const res = await ApiClient.getProfile();
          setUser(res.user || null);
        } catch (e) {
          console.warn('Failed to refresh profile', e.message || e);
          setUser(null);
          await ApiClient.setToken(null);
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login({ email, password }) {
    const res = await ApiClient.login({ email, password });
    if (res && res.token) {
      await ApiClient.setToken(res.token);
      setToken(res.token);
      setUser(res.user || null);
    }
    return res;
  }

  async function register({ email, password, name }) {
    const res = await ApiClient.register({ email, password, name });
    if (res && res.token) {
      await ApiClient.setToken(res.token);
      setToken(res.token);
      setUser(res.user || null);
    }
    return res;
  }

  async function logout() {
    await ApiClient.setToken(null);
    setToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    try {
      const res = await ApiClient.getProfile();
      setUser(res.user || null);
      return res;
    } catch (e) {
      console.warn('refreshProfile failed', e.message || e);
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
