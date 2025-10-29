import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function setToken(token) {
  if (!token) return AsyncStorage.removeItem('auth_token');
  return AsyncStorage.setItem('auth_token', token);
}

async function getToken() {
  return AsyncStorage.getItem('auth_token');
}

async function fetchWithAuth(path, opts = {}) {
  const token = await getToken();
  const headers = Object.assign({}, opts.headers || {}, {
    'Content-Type': 'application/json'
  });
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, Object.assign({}, opts, { headers }));
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json && json.error ? json.error : `HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export default {
  API_BASE,
  setToken,
  getToken,
  fetchWithAuth,
  // auth endpoints
  async register({ email, password, name }) {
    return fetchWithAuth('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
  },
  async login({ email, password }) {
    return fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  async getProfile() {
    return fetchWithAuth('/api/auth/profile', { method: 'GET' });
  },
  async updateProfile(updates) {
    return fetchWithAuth('/api/auth/profile', { method: 'PUT', body: JSON.stringify(updates) });
  }
};
