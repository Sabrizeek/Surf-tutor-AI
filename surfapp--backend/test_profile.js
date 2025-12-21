// Test script to verify profile endpoint
require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testProfile() {
  try {
    console.log('Testing profile endpoint...');
    
    // First, register a test user
    console.log('\n1. Registering test user...');
    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
      email: `test${Date.now()}@test.com`,
      password: 'test123456',
      name: 'Test User',
      age: 25,
      weight: 70,
      height: 175,
      goal: ['Endurance', 'Strength'],
      skillLevel: 'Intermediate'
    });
    
    console.log('✅ Registration successful');
    console.log('User ID:', registerResponse.data.user._id);
    console.log('Token:', registerResponse.data.token.substring(0, 20) + '...');
    
    const token = registerResponse.data.token;
    
    // Now test profile endpoint
    console.log('\n2. Testing profile endpoint...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('Stack:', error.response.data.stack);
    }
  }
}

testProfile();

