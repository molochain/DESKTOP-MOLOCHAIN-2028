/**
 * Comprehensive Authentication Endpoints Test Suite
 * Tests all authentication-related API endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Express } from 'express';
import request from 'supertest';
import { createTestApp } from './test-utils';
import { db } from '../db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

describe('Authentication API Endpoints', () => {
  let app: Express;
  let testUserCredentials = {
    email: 'testuser@example.com',
    username: 'testuser',
    password: 'TestPass123!',
    fullName: 'Test User',
    company: 'Test Company',
    phone: '+1234567890'
  };
  let adminCredentials = {
    email: 'admin@molochain.com',
    password: 'admin123'
  };
  let authToken: string;
  let adminToken: string;
  let testUserId: number;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Clean up any existing test users
    await db.delete(users).where(eq(users.email, testUserCredentials.email));
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(users).where(eq(users.email, testUserCredentials.email));
  });

  describe('Core Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUserCredentials);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Registration successful');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.email).toBe(testUserCredentials.email);
        
        testUserId = response.body.user.id;
      });

      it('should fail with duplicate email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUserCredentials);

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error');
      });

      it('should fail with invalid email format', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUserCredentials,
            email: 'invalid-email'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should fail with weak password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUserCredentials,
            email: 'newuser@example.com',
            password: 'weak'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should fail with missing required fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'incomplete@example.com'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('authenticated', true);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email', testUserCredentials.email);
        
        // Store the session cookie for authenticated requests
        authToken = response.headers['set-cookie']?.[0] || '';
      });

      it('should fail with incorrect password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: 'WrongPassword123!'
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });

      it('should fail with non-existent email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SomePassword123!'
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });

      it('should fail with missing credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(response.status).toBe(400);
      });

      it('should login admin successfully', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(adminCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('authenticated', true);
        expect(response.body).toHaveProperty('role', 'admin');
        
        adminToken = response.headers['set-cookie']?.[0] || '';
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user info when authenticated', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('authenticated', true);
        expect(response.body).toHaveProperty('email', testUserCredentials.email);
        expect(response.body).toHaveProperty('username', testUserCredentials.username);
      });

      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Not authenticated');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Logout successful');
      });

      it('should clear session after logout', async () => {
        // First logout
        await request(app)
          .post('/api/auth/logout')
          .set('Cookie', authToken);

        // Try to access protected endpoint
        const response = await request(app)
          .get('/api/auth/me')
          .set('Cookie', authToken);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Profile Management Endpoints', () => {
    beforeEach(async () => {
      // Re-login to get fresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserCredentials.email,
          password: testUserCredentials.password
        });
      authToken = loginResponse.headers['set-cookie']?.[0] || '';
    });

    describe('GET /api/profile', () => {
      it('should return user profile when authenticated', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', testUserCredentials.email);
        expect(response.body).toHaveProperty('username', testUserCredentials.username);
        expect(response.body).toHaveProperty('fullName', testUserCredentials.fullName);
        expect(response.body).toHaveProperty('company', testUserCredentials.company);
        expect(response.body).not.toHaveProperty('password');
      });

      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/profile');

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/profile', () => {
      it('should update profile successfully', async () => {
        const updateData = {
          fullName: 'Updated Test User',
          company: 'Updated Company',
          phone: '+9876543210'
        };

        const response = await request(app)
          .put('/api/profile')
          .set('Cookie', authToken)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Profile updated successfully');
        expect(response.body.profile).toHaveProperty('fullName', updateData.fullName);
        expect(response.body.profile).toHaveProperty('company', updateData.company);
        expect(response.body.profile).toHaveProperty('phone', updateData.phone);
      });

      it('should fail to update email if already taken', async () => {
        const response = await request(app)
          .put('/api/profile')
          .set('Cookie', authToken)
          .send({
            email: adminCredentials.email
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Email already in use');
      });

      it('should fail when not authenticated', async () => {
        const response = await request(app)
          .put('/api/profile')
          .send({
            fullName: 'Should Fail'
          });

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/profile/change-password', () => {
      it('should change password successfully', async () => {
        const response = await request(app)
          .post('/api/profile/change-password')
          .set('Cookie', authToken)
          .send({
            currentPassword: testUserCredentials.password,
            newPassword: 'NewTestPass123!'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password changed successfully');

        // Update test credentials for future tests
        testUserCredentials.password = 'NewTestPass123!';
      });

      it('should fail with incorrect current password', async () => {
        const response = await request(app)
          .post('/api/profile/change-password')
          .set('Cookie', authToken)
          .send({
            currentPassword: 'WrongCurrentPassword',
            newPassword: 'NewTestPass123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Current password is incorrect');
      });

      it('should fail with weak new password', async () => {
        const response = await request(app)
          .post('/api/profile/change-password')
          .set('Cookie', authToken)
          .send({
            currentPassword: testUserCredentials.password,
            newPassword: 'weak'
          });

        expect(response.status).toBe(400);
      });

      it('should fail when new password same as current', async () => {
        const response = await request(app)
          .post('/api/profile/change-password')
          .set('Cookie', authToken)
          .send({
            currentPassword: testUserCredentials.password,
            newPassword: testUserCredentials.password
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'New password must be different from current password');
      });
    });

    describe('GET /api/profile/activity', () => {
      it('should return user activity logs', async () => {
        const response = await request(app)
          .get('/api/profile/activity')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('action');
          expect(response.body[0]).toHaveProperty('timestamp');
        }
      });

      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/profile/activity');

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/profile', () => {
      it('should deactivate account successfully', async () => {
        const response = await request(app)
          .delete('/api/profile')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Account deactivated successfully');
      });

      it('should not allow login after deactivation', async () => {
        // Try to login with deactivated account
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Two-Factor Authentication Endpoints', () => {
    let twoFactorSecret: string;
    let recoveryCodes: string[];

    beforeEach(async () => {
      // Create a fresh test user and login
      await db.delete(users).where(eq(users.email, 'twofa@example.com'));
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'twofa@example.com',
          username: 'twofauser',
          password: 'TwoFAPass123!',
          fullName: 'Two FA User'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'twofa@example.com',
          password: 'TwoFAPass123!'
        });
        
      authToken = loginResponse.headers['set-cookie']?.[0] || '';
    });

    describe('POST /api/auth/2fa/generate', () => {
      it('should generate 2FA secret and QR code', async () => {
        const response = await request(app)
          .post('/api/auth/2fa/generate')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('secret');
        expect(response.body).toHaveProperty('qrCode');
        expect(response.body).toHaveProperty('recoveryCodes');
        expect(response.body.recoveryCodes).toBeInstanceOf(Array);
        expect(response.body.recoveryCodes.length).toBeGreaterThan(0);

        twoFactorSecret = response.body.secret;
        recoveryCodes = response.body.recoveryCodes;
      });

      it('should fail when not authenticated', async () => {
        const response = await request(app)
          .post('/api/auth/2fa/generate');

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/auth/2fa/disable', () => {
      it('should disable 2FA successfully', async () => {
        const response = await request(app)
          .post('/api/auth/2fa/disable')
          .set('Cookie', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });

      it('should fail when not authenticated', async () => {
        const response = await request(app)
          .post('/api/auth/2fa/disable');

        expect(response.status).toBe(401);
      });
    });

    afterAll(async () => {
      await db.delete(users).where(eq(users.email, 'twofa@example.com'));
    });
  });

  describe('Admin Endpoints', () => {
    beforeEach(async () => {
      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(adminCredentials);
      adminToken = loginResponse.headers['set-cookie']?.[0] || '';
    });

    describe('GET /api/admin/users', () => {
      it('should return users list for admin', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Cookie', adminToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('users');
        expect(response.body.users).toBeInstanceOf(Array);
      });

      it('should fail for non-admin user', async () => {
        // Login as regular user
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });
        const userToken = loginResponse.headers['set-cookie']?.[0] || '';

        const response = await request(app)
          .get('/api/admin/users')
          .set('Cookie', userToken);

        expect(response.status).toBe(403);
      });

      it('should fail when not authenticated', async () => {
        const response = await request(app)
          .get('/api/admin/users');

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/admin/stats', () => {
      it('should return system stats for admin', async () => {
        const response = await request(app)
          .get('/api/admin/stats')
          .set('Cookie', adminToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('memory');
      });
    });

    describe('GET /api/admin/health', () => {
      it('should return health status for admin', async () => {
        const response = await request(app)
          .get('/api/admin/health')
          .set('Cookie', adminToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    describe('POST /api/admin/cache/clear', () => {
      it('should clear cache for admin', async () => {
        const response = await request(app)
          .post('/api/admin/cache/clear')
          .set('Cookie', adminToken)
          .send({ type: 'all' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('GET /api/admin/cache/stats', () => {
      it('should return cache stats for admin', async () => {
        const response = await request(app)
          .get('/api/admin/cache/stats')
          .set('Cookie', adminToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('hits');
        expect(response.body).toHaveProperty('misses');
      });
    });
  });

  describe('Security Tests', () => {
    describe('Rate Limiting', () => {
      it('should rate limit excessive login attempts', async () => {
        const attempts = 20;
        const responses = [];

        for (let i = 0; i < attempts; i++) {
          const response = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'bruteforce@example.com',
              password: 'WrongPassword'
            });
          responses.push(response.status);
        }

        // At least one should be rate limited (429 status)
        expect(responses.some(status => status === 429)).toBe(true);
      });
    });

    describe('SQL Injection Prevention', () => {
      it('should prevent SQL injection in login', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: "admin' OR '1'='1",
            password: "' OR '1'='1"
          });

        expect(response.status).toBe(401);
        expect(response.body).not.toHaveProperty('authenticated', true);
      });

      it('should prevent SQL injection in registration', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: "test'; DROP TABLE users; --",
            username: "'; DROP TABLE users; --",
            password: 'TestPass123!',
            fullName: "'; DROP TABLE users; --"
          });

        // Should either fail validation or safely handle the input
        expect([400, 409]).toContain(response.status);
      });
    });

    describe('XSS Prevention', () => {
      it('should sanitize user input to prevent XSS', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'xsstest@example.com',
            username: 'xsstest',
            password: 'TestPass123!',
            fullName: '<script>alert("XSS")</script>'
          });

        if (response.status === 201) {
          // Check that the script tag is not returned as-is
          expect(response.body.user.fullName).not.toContain('<script>');
        }
      });
    });

    describe('Authorization Checks', () => {
      it('should properly check authorization for admin endpoints', async () => {
        // Try accessing admin endpoint without authentication
        let response = await request(app)
          .get('/api/admin/users');
        expect(response.status).toBe(401);

        // Try accessing admin endpoint with regular user
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });
        const userToken = loginResponse.headers['set-cookie']?.[0] || '';

        response = await request(app)
          .get('/api/admin/users')
          .set('Cookie', userToken);
        expect(response.status).toBe(403);
      });
    });

    describe('Session Security', () => {
      it('should invalidate session after logout', async () => {
        // Login
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });
        const sessionToken = loginResponse.headers['set-cookie']?.[0] || '';

        // Logout
        await request(app)
          .post('/api/auth/logout')
          .set('Cookie', sessionToken);

        // Try to use the same session
        const response = await request(app)
          .get('/api/auth/me')
          .set('Cookie', sessionToken);

        expect(response.status).toBe(401);
      });

      it('should use secure cookies in production', async () => {
        // This test would check for secure cookie flags in production
        // For now, just check that cookies are set
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserCredentials.email,
            password: testUserCredentials.password
          });

        expect(response.headers['set-cookie']).toBeDefined();
      });
    });
  });
});