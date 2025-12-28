#!/usr/bin/env node
/**
 * Standalone Authentication Endpoints Test Runner
 * Tests all authentication-related API endpoints
 */

import request from 'supertest';
import { writeFile } from 'fs/promises';

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'TestPass123!',
  fullName: 'Test User',
  company: 'Test Company',
  phone: '+1234567890'
};

const ADMIN_USER = {
  email: 'admin@molochain.com',
  password: 'admin123'
};

let userToken = '';
let adminToken = '';
let testResults = [];

// Helper function to log test results
function logTest(endpoint, method, status, passed, message = '') {
  const result = {
    endpoint,
    method,
    expectedStatus: status,
    passed,
    message
  };
  testResults.push(result);
  
  if (passed) {
    console.log(`✅ ${method} ${endpoint} - ${message || 'Passed'}`);
  } else {
    console.log(`❌ ${method} ${endpoint} - ${message || 'Failed'}`);
  }
}

// Helper function to make requests
async function testEndpoint(method, endpoint, data = null, token = null, expectedStatus = 200) {
  try {
    const req = request(API_BASE_URL)[method.toLowerCase()](endpoint);
    
    if (token) {
      req.set('Cookie', token);
    }
    
    if (data) {
      req.send(data);
    }
    
    const response = await req;
    
    return {
      status: response.status,
      body: response.body,
      headers: response.headers,
      passed: response.status === expectedStatus
    };
  } catch (error) {
    return {
      status: error.status || 500,
      body: error.response?.body || {},
      headers: error.response?.headers || {},
      passed: false,
      error: error.message
    };
  }
}

// Test Suite Functions
async function testRegistration() {
  console.log('\n🔵 === Testing Registration Endpoints ===\n');
  
  // Test successful registration
  let result = await testEndpoint('POST', '/api/auth/register', TEST_USER, null, 201);
  logTest('/api/auth/register', 'POST', 201, result.passed, 'New user registration');
  
  // Test duplicate email
  result = await testEndpoint('POST', '/api/auth/register', TEST_USER, null, 409);
  logTest('/api/auth/register', 'POST', 409, result.passed, 'Duplicate email rejection');
  
  // Test invalid email format
  result = await testEndpoint('POST', '/api/auth/register', {
    ...TEST_USER,
    email: 'invalid-email'
  }, null, 400);
  logTest('/api/auth/register', 'POST', 400, result.passed, 'Invalid email format');
  
  // Test weak password
  result = await testEndpoint('POST', '/api/auth/register', {
    ...TEST_USER,
    email: 'weak@example.com',
    password: 'weak'
  }, null, 400);
  logTest('/api/auth/register', 'POST', 400, result.passed, 'Weak password rejection');
  
  // Test missing fields
  result = await testEndpoint('POST', '/api/auth/register', {
    email: 'incomplete@example.com'
  }, null, 400);
  logTest('/api/auth/register', 'POST', 400, result.passed, 'Missing required fields');
}

async function testLogin() {
  console.log('\n🔵 === Testing Login Endpoints ===\n');
  
  // Test successful login
  let result = await testEndpoint('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  }, null, 200);
  
  if (result.passed && result.headers['set-cookie']) {
    userToken = result.headers['set-cookie'][0];
  }
  
  logTest('/api/auth/login', 'POST', 200, result.passed, 'Valid credentials login');
  
  // Test admin login
  result = await testEndpoint('POST', '/api/auth/login', ADMIN_USER, null, 200);
  
  if (result.passed && result.headers['set-cookie']) {
    adminToken = result.headers['set-cookie'][0];
  }
  
  logTest('/api/auth/login', 'POST', 200, result.passed, 'Admin login');
  
  // Test incorrect password
  result = await testEndpoint('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: 'WrongPassword123!'
  }, null, 401);
  logTest('/api/auth/login', 'POST', 401, result.passed, 'Incorrect password');
  
  // Test non-existent user
  result = await testEndpoint('POST', '/api/auth/login', {
    email: 'nonexistent@example.com',
    password: 'SomePassword123!'
  }, null, 401);
  logTest('/api/auth/login', 'POST', 401, result.passed, 'Non-existent user');
}

async function testAuthentication() {
  console.log('\n🔵 === Testing Authentication Status ===\n');
  
  // Test authenticated request
  let result = await testEndpoint('GET', '/api/auth/me', null, userToken, 200);
  logTest('/api/auth/me', 'GET', 200, result.passed, 'Authenticated user info');
  
  // Test unauthenticated request
  result = await testEndpoint('GET', '/api/auth/me', null, null, 401);
  logTest('/api/auth/me', 'GET', 401, result.passed, 'Unauthenticated rejection');
}

async function testProfile() {
  console.log('\n🔵 === Testing Profile Endpoints ===\n');
  
  // Get profile
  let result = await testEndpoint('GET', '/api/profile', null, userToken, 200);
  logTest('/api/profile', 'GET', 200, result.passed, 'Get user profile');
  
  // Update profile
  result = await testEndpoint('PUT', '/api/profile', {
    fullName: 'Updated User',
    company: 'Updated Company'
  }, userToken, 200);
  logTest('/api/profile', 'PUT', 200, result.passed, 'Update profile');
  
  // Change password
  result = await testEndpoint('POST', '/api/profile/change-password', {
    currentPassword: TEST_USER.password,
    newPassword: 'NewPass123!'
  }, userToken, 200);
  logTest('/api/profile/change-password', 'POST', 200, result.passed, 'Change password');
  
  // Get activity logs
  result = await testEndpoint('GET', '/api/profile/activity', null, userToken, 200);
  logTest('/api/profile/activity', 'GET', 200, result.passed, 'Get activity logs');
  
  // Test unauthenticated profile access
  result = await testEndpoint('GET', '/api/profile', null, null, 401);
  logTest('/api/profile', 'GET', 401, result.passed, 'Unauthenticated profile rejection');
}

async function test2FA() {
  console.log('\n🔵 === Testing 2FA Endpoints ===\n');
  
  // Generate 2FA secret
  let result = await testEndpoint('POST', '/api/auth/2fa/generate', null, userToken, 200);
  logTest('/api/auth/2fa/generate', 'POST', 200, result.passed, 'Generate 2FA secret');
  
  // Disable 2FA
  result = await testEndpoint('POST', '/api/auth/2fa/disable', null, userToken, 200);
  logTest('/api/auth/2fa/disable', 'POST', 200, result.passed, 'Disable 2FA');
  
  // Test unauthenticated 2FA access
  result = await testEndpoint('POST', '/api/auth/2fa/generate', null, null, 401);
  logTest('/api/auth/2fa/generate', 'POST', 401, result.passed, 'Unauthenticated 2FA rejection');
}

async function testAdmin() {
  console.log('\n🔵 === Testing Admin Endpoints ===\n');
  
  // Test admin endpoints with admin token
  let result = await testEndpoint('GET', '/api/admin/users', null, adminToken, 200);
  logTest('/api/admin/users', 'GET', 200, result.passed, 'Admin users list');
  
  result = await testEndpoint('GET', '/api/admin/stats', null, adminToken, 200);
  logTest('/api/admin/stats', 'GET', 200, result.passed, 'Admin stats');
  
  result = await testEndpoint('GET', '/api/admin/health', null, adminToken, 200);
  logTest('/api/admin/health', 'GET', 200, result.passed, 'Admin health check');
  
  result = await testEndpoint('GET', '/api/admin/cache/stats', null, adminToken, 200);
  logTest('/api/admin/cache/stats', 'GET', 200, result.passed, 'Admin cache stats');
  
  // Test admin endpoints with regular user token
  result = await testEndpoint('GET', '/api/admin/users', null, userToken, 403);
  logTest('/api/admin/users', 'GET', 403, result.passed, 'Non-admin rejection');
  
  // Test admin endpoints without authentication
  result = await testEndpoint('GET', '/api/admin/users', null, null, 401);
  logTest('/api/admin/users', 'GET', 401, result.passed, 'Unauthenticated admin rejection');
}

async function testLogout() {
  console.log('\n🔵 === Testing Logout ===\n');
  
  // Test logout
  let result = await testEndpoint('POST', '/api/auth/logout', null, userToken, 200);
  logTest('/api/auth/logout', 'POST', 200, result.passed, 'User logout');
  
  // Test access after logout
  result = await testEndpoint('GET', '/api/auth/me', null, userToken, 401);
  logTest('/api/auth/me', 'GET', 401, result.passed, 'Session invalidated after logout');
}

async function testSecurity() {
  console.log('\n🔵 === Testing Security Features ===\n');
  
  // Test SQL injection prevention
  let result = await testEndpoint('POST', '/api/auth/login', {
    email: "admin' OR '1'='1",
    password: "' OR '1'='1"
  }, null, 401);
  logTest('/api/auth/login', 'POST', 401, result.passed, 'SQL injection prevention');
  
  // Test XSS prevention (registration with script tag)
  result = await testEndpoint('POST', '/api/auth/register', {
    email: 'xss@example.com',
    username: 'xsstest',
    password: 'TestPass123!',
    fullName: '<script>alert("XSS")</script>'
  }, null, 201);
  
  if (result.body?.user?.fullName) {
    const hasScript = result.body.user.fullName.includes('<script>');
    logTest('/api/auth/register', 'POST', 201, !hasScript, 'XSS prevention');
  }
  
  // Test rate limiting (make multiple rapid requests)
  console.log('\n⚠️  Testing rate limiting (this may take a few seconds)...');
  let rateLimited = false;
  for (let i = 0; i < 20; i++) {
    const res = await testEndpoint('POST', '/api/auth/login', {
      email: 'ratelimit@example.com',
      password: 'wrong'
    }, null, [401, 429]);
    
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  logTest('/api/auth/login', 'POST', 429, rateLimited, 'Rate limiting active');
}

// Generate summary report
async function generateReport() {
  console.log('\n📊 === TEST SUMMARY ===\n');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%`);
  
  if (failed > 0) {
    console.log('\n❌ === FAILED TESTS ===\n');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`❌ ${r.method} ${r.endpoint} - ${r.message}`);
    });
  }
  
  // Generate detailed report file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      passRate: `${passRate}%`
    },
    results: testResults
  };
  
  await writeFile(
    'auth-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n💾 Detailed report saved to: server/tests/auth-test-report.json');
}

// Main test runner
async function runTests() {
  console.log('\n========================================');
  console.log('  🔐 Authentication Endpoints Test Suite');
  console.log('========================================\n');
  
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log(`Start time: ${new Date().toISOString()}\n`);
  
  try {
    // Check if server is running
    const healthCheck = await request(API_BASE_URL).get('/api/health');
    if (healthCheck.status !== 200) {
      console.log('⚠️  Warning: Server health check failed');
    }
    
    // Run test suites in order
    await testRegistration();
    await testLogin();
    await testAuthentication();
    await testProfile();
    await test2FA();
    await testAdmin();
    await testLogout();
    await testSecurity();
    
    // Generate report
    await generateReport();
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    console.error('\n⚠️  Make sure the server is running on port 5000');
  }
}

// Run the tests
runTests();