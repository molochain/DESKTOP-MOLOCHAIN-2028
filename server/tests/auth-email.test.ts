/**
 * Integration Tests for Auth Email Triggers
 * Tests that sendAuthEmail is called with correct parameters for:
 * - Login notifications
 * - Registration welcome emails  
 * - Password reset emails
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi, type Mock } from 'vitest';
import type { Express } from 'express';
import request from 'supertest';
import { createTestApp } from './test-utils';
import { db } from '../db';
import { users, passwordResetTokens } from '@db/schema';
import { eq, inArray } from 'drizzle-orm';

vi.mock('../services/email.service', () => ({
  emailService: {
    sendAuthEmail: vi.fn().mockResolvedValue(true),
    sendTemplateEmail: vi.fn().mockResolvedValue(true),
    sendEmail: vi.fn().mockResolvedValue(true),
    getSettings: vi.fn().mockResolvedValue(null),
    initTransporter: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue({ success: true, message: 'OK' }),
    notifyFormSubmission: vi.fn().mockResolvedValue(true),
    clearCache: vi.fn(),
  },
}));

import { emailService } from '../services/email.service';

describe('Auth Email Triggers', () => {
  let app: Express;
  const testUserCredentials = {
    email: 'emailtest@example.com',
    username: 'emailtestuser',
    password: 'TestPass123!',
    fullName: 'Email Test User',
    company: 'Test Company',
    phone: '+1234567890'
  };

  const testEmails = [
    'emailtest@example.com',
    'resettest@example.com',
    'unique_reg_test@example.com',
    'typetest@example.com'
  ];

  async function cleanupTestUsers() {
    const testUsers = await db.select({ id: users.id })
      .from(users)
      .where(inArray(users.email, testEmails));
    
    if (testUsers.length > 0) {
      const userIds = testUsers.map(u => u.id);
      await db.delete(passwordResetTokens).where(inArray(passwordResetTokens.userId, userIds));
      await db.delete(users).where(inArray(users.id, userIds));
    }
  }

  beforeAll(async () => {
    app = await createTestApp();
    await cleanupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration Email Trigger', () => {
    it('should call sendAuthEmail with "register" type after successful registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserCredentials);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailService.sendAuthEmail).toHaveBeenCalled();
      
      const mockFn = emailService.sendAuthEmail as Mock;
      const calls = mockFn.mock.calls;
      
      const registerCall = calls.find((call: any[]) => call[0] === 'register');
      expect(registerCall).toBeDefined();
      
      if (registerCall) {
        expect(registerCall[0]).toBe('register');
        expect(registerCall[1]).toBe(testUserCredentials.email);
        expect(registerCall[2]).toMatchObject({
          username: testUserCredentials.username,
          email: testUserCredentials.email,
        });
        expect(registerCall[2]).toHaveProperty('full_name');
      }
    });

    it('should pass correct username in registration email variables', async () => {
      const uniqueUser = {
        ...testUserCredentials,
        email: 'unique_reg_test@example.com',
        username: 'uniquereguser'
      };

      await db.delete(users).where(eq(users.email, uniqueUser.email));

      const response = await request(app)
        .post('/api/auth/register')
        .send(uniqueUser);

      expect(response.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const registerCall = mockFn.mock.calls.find((call: any[]) => 
        call[0] === 'register' && call[1] === uniqueUser.email
      );

      expect(registerCall).toBeDefined();
      expect(registerCall?.[2]?.username).toBe(uniqueUser.username);

      await db.delete(users).where(eq(users.email, uniqueUser.email));
    });
  });

  describe('Login Email Trigger', () => {
    beforeAll(async () => {
      await db.delete(users).where(eq(users.email, testUserCredentials.email));
      
      await request(app)
        .post('/api/auth/register')
        .send(testUserCredentials);
      
      vi.clearAllMocks();
    });

    it('should call sendAuthEmail with "login" type after successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserCredentials.email,
          password: testUserCredentials.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authenticated', true);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailService.sendAuthEmail).toHaveBeenCalled();
      
      const mockFn = emailService.sendAuthEmail as Mock;
      const loginCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'login');
      
      expect(loginCall).toBeDefined();
      
      if (loginCall) {
        expect(loginCall[0]).toBe('login');
        expect(loginCall[1]).toBe(testUserCredentials.email);
        expect(loginCall[2]).toHaveProperty('username');
        expect(loginCall[2]).toHaveProperty('ip_address');
        expect(loginCall[2]).toHaveProperty('user_agent');
        expect(loginCall[2]).toHaveProperty('login_time');
      }
    });

    it('should include ip_address in login email variables', async () => {
      vi.clearAllMocks();

      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', '192.168.1.100')
        .send({
          email: testUserCredentials.email,
          password: testUserCredentials.password
        });

      expect(response.status).toBe(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const loginCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'login');
      
      expect(loginCall).toBeDefined();
      expect(loginCall?.[2]?.ip_address).toBeDefined();
      expect(typeof loginCall?.[2]?.ip_address).toBe('string');
    });

    it('should include user_agent in login email variables', async () => {
      vi.clearAllMocks();

      const userAgent = 'Mozilla/5.0 (Test Browser) AuthEmailTest/1.0';
      
      const response = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', userAgent)
        .send({
          email: testUserCredentials.email,
          password: testUserCredentials.password
        });

      expect(response.status).toBe(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const loginCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'login');
      
      expect(loginCall).toBeDefined();
      expect(loginCall?.[2]?.user_agent).toBe(userAgent);
    });

    it('should not call sendAuthEmail on failed login', async () => {
      vi.clearAllMocks();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserCredentials.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const loginCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'login');
      
      expect(loginCall).toBeUndefined();
    });
  });

  describe('Password Reset Email Trigger', () => {
    const resetTestUser = {
      email: 'resettest@example.com',
      username: 'resettestuser',
      password: 'TestPass123!',
      fullName: 'Reset Test User'
    };

    beforeAll(async () => {
      await db.delete(users).where(eq(users.email, resetTestUser.email));
      
      await request(app)
        .post('/api/auth/register')
        .send(resetTestUser);
      
      vi.clearAllMocks();
    });

    it('should call sendAuthEmail with "password-reset" type when requesting password reset', async () => {
      const response = await request(app)
        .post('/api/auth/request-reset')
        .send({ email: resetTestUser.email });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailService.sendAuthEmail).toHaveBeenCalled();
      
      const mockFn = emailService.sendAuthEmail as Mock;
      const resetCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'password-reset');
      
      expect(resetCall).toBeDefined();
      
      if (resetCall) {
        expect(resetCall[0]).toBe('password-reset');
        expect(resetCall[1]).toBe(resetTestUser.email);
        expect(resetCall[2]).toHaveProperty('username');
        expect(resetCall[2]).toHaveProperty('reset_link');
        expect(resetCall[2]).toHaveProperty('reset_token');
        expect(resetCall[2]).toHaveProperty('expiry_hours');
      }
    });

    it('should include valid reset_link URL in password reset email', async () => {
      vi.clearAllMocks();

      await request(app)
        .post('/api/auth/request-reset')
        .send({ email: resetTestUser.email });

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const resetCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'password-reset');
      
      expect(resetCall).toBeDefined();
      expect(resetCall?.[2]?.reset_link).toMatch(/^https:\/\/.*\/reset-password\?token=/);
    });

    it('should not call sendAuthEmail for non-existent email (security)', async () => {
      vi.clearAllMocks();

      const response = await request(app)
        .post('/api/auth/request-reset')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const resetCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'password-reset');
      
      expect(resetCall).toBeUndefined();
    });

    it('should include expiry_hours in password reset email variables', async () => {
      vi.clearAllMocks();

      await request(app)
        .post('/api/auth/request-reset')
        .send({ email: resetTestUser.email });

      await new Promise(resolve => setTimeout(resolve, 100));

      const mockFn = emailService.sendAuthEmail as Mock;
      const resetCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'password-reset');
      
      expect(resetCall).toBeDefined();
      expect(resetCall?.[2]?.expiry_hours).toBe('24');
    });
  });

  describe('Email Type Verification', () => {
    it('should use correct email type strings for each auth action', async () => {
      vi.clearAllMocks();

      const uniqueEmail = 'typetest@example.com';
      await db.delete(users).where(eq(users.email, uniqueEmail));

      await request(app)
        .post('/api/auth/register')
        .send({
          ...testUserCredentials,
          email: uniqueEmail,
          username: 'typetestuser'
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      vi.clearAllMocks();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: testUserCredentials.password
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      vi.clearAllMocks();

      await request(app)
        .post('/api/auth/request-reset')
        .send({ email: uniqueEmail });

      await new Promise(resolve => setTimeout(resolve, 50));

      const mockFn = emailService.sendAuthEmail as Mock;
      const resetCall = mockFn.mock.calls.find((call: any[]) => call[0] === 'password-reset');
      expect(resetCall).toBeDefined();
    });
  });
});
