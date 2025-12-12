#!/usr/bin/env node

/**
 * API Test Script
 * Quick script to test authentication endpoints
 * 
 * Usage:
 *   node scripts/test-api.js
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'SecurePass123!'
};

let authToken = '';

/**
 * Make HTTP request
 */
const makeRequest = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

/**
 * Test health endpoint
 */
const testHealth = async () => {
  console.log('\n🏥 Testing Health Endpoint...');
  try {
    const response = await makeRequest('/health');
    console.log(`✅ Status: ${response.status}`);
    console.log(`   Response:`, response.body);
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Test user registration
 */
const testRegister = async () => {
  console.log('\n📝 Testing User Registration...');
  console.log(`   Email: ${testUser.email}`);
  
  try {
    const response = await makeRequest('/auth/register', 'POST', testUser);
    console.log(`✅ Status: ${response.status}`);
    
    if (response.body.success && response.body.data) {
      authToken = response.body.data.token;
      console.log(`   User ID: ${response.body.data.user.id}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Test user login
 */
const testLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  
  try {
    const response = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    if (response.body.success && response.body.data) {
      authToken = response.body.data.token;
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Test get current user
 */
const testGetMe = async () => {
  console.log('\n👤 Testing Get Current User...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Skipping test.');
    return;
  }
  
  try {
    const response = await makeRequest('/auth/me', 'GET', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    if (response.body.success && response.body.data) {
      console.log(`   User:`, response.body.data.user);
    } else {
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Test invalid login
 */
const testInvalidLogin = async () => {
  console.log('\n🚫 Testing Invalid Login (should fail)...');
  
  try {
    const response = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: 'WrongPassword123!'
    });
    
    console.log(`✅ Status: ${response.status} (Expected: 401)`);
    console.log(`   Message: ${response.body.message}`);
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Test protected route without token
 */
const testUnauthorized = async () => {
  console.log('\n🔒 Testing Protected Route Without Token (should fail)...');
  
  try {
    const response = await makeRequest('/auth/me', 'GET');
    
    console.log(`✅ Status: ${response.status} (Expected: 401)`);
    console.log(`   Message: ${response.body.message}`);
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
};

/**
 * Run all tests
 */
const runTests = async () => {
  console.log('🧪 Starting API Tests...');
  console.log('Make sure the server is running on', BASE_URL);
  
  await testHealth();
  await testRegister();
  await testLogin();
  await testGetMe();
  await testInvalidLogin();
  await testUnauthorized();
  
  console.log('\n✨ Tests completed!\n');
};

// Run tests
runTests().catch(console.error);
