// Complete test flow: Register -> Login -> Get Profile
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  try {
    console.log('=== Testing Complete Profile Flow ===\n');
    
    // Step 1: Register
    const testEmail = `test${Date.now()}@test.com`;
    console.log('1. Registering user:', testEmail);
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: testEmail,
      password: 'test123456',
      name: 'Test User',
      age: 25,
      weight: 70,
      height: 175,
      goal: ['Endurance', 'Strength'],
      skillLevel: 'Intermediate'
    });
    
    console.log('✅ Registration successful');
    console.log('   User ID:', registerRes.data.user._id);
    console.log('   User ID type:', typeof registerRes.data.user._id);
    console.log('   Token (first 30 chars):', registerRes.data.token.substring(0, 30) + '...');
    
    const token = registerRes.data.token;
    const userId = registerRes.data.user._id;
    
    // Step 2: Decode token to see what's inside
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\n2. Decoded token payload:');
    console.log('   ', JSON.stringify(decoded, null, 2));
    console.log('   User ID in token:', decoded.id);
    console.log('   User ID type in token:', typeof decoded.id);
    
    // Step 3: Get Profile
    console.log('\n3. Getting profile with token...');
    const profileRes = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully!');
    console.log('   Profile data:', JSON.stringify(profileRes.data, null, 2));
    
    console.log('\n=== Test PASSED ===');
    
  } catch (error) {
    console.error('\n❌ Test FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    if (error.response?.data?.stack) {
      console.error('\nStack trace:', error.response.data.stack);
    }
    process.exit(1);
  }
}

testCompleteFlow();

