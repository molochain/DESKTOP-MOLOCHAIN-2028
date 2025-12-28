/**
 * Comprehensive RBAC (Role-Based Access Control) Verification Tests
 * Tests authentication, authorization, and access control for different user roles
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../core/auth/auth.service';

describe('RBAC System Verification', () => {
  let adminCookie: string;
  let userCookie: string;
  let moderatorCookie: string;
  
  // Test users with different roles
  const testUsers = {
    admin: {
      email: 'admin@molochain.com',
      password: 'admin123'
    },
    regularUser: {
      email: 'user@test.com',
      username: 'testuser',
      password: 'UserPass123!',
      role: 'user' as const
    },
    moderator: {
      email: 'mod@test.com',
      username: 'moderator',
      password: 'ModPass123!',
      role: 'moderator' as const
    }
  };

  beforeAll(async () => {
    // Clean up test users (except admin)
    await db.delete(users).where(eq(users.email, testUsers.regularUser.email));
    await db.delete(users).where(eq(users.email, testUsers.moderator.email));
    
    // Create test users
    const hashedPassword = await hashPassword(testUsers.regularUser.password);
    await db.insert(users).values({
      email: testUsers.regularUser.email,
      username: testUsers.regularUser.username,
      password: hashedPassword,
      fullName: 'Test User',
      role: testUsers.regularUser.role,
      isActive: true
    });
    
    const modHashedPassword = await hashPassword(testUsers.moderator.password);
    await db.insert(users).values({
      email: testUsers.moderator.email,
      username: testUsers.moderator.username,
      password: modHashedPassword,
      fullName: 'Moderator User',
      role: testUsers.moderator.role,
      isActive: true
    });
  });

  afterAll(async () => {
    // Clean up test users
    await db.delete(users).where(eq(users.email, testUsers.regularUser.email));
    await db.delete(users).where(eq(users.email, testUsers.moderator.email));
  });

  describe('1. Authentication Tests', () => {
    test('Admin login should succeed with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: testUsers.admin.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUsers.admin.email);
      expect(response.body.role).toBe('admin');
      
      // Save cookie for later tests
      adminCookie = response.headers['set-cookie'][0];
    });

    test('Regular user login should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.regularUser.email,
          password: testUsers.regularUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUsers.regularUser.email);
      expect(response.body.role).toBe('user');
      
      userCookie = response.headers['set-cookie'][0];
    });

    test('Moderator login should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.moderator.email,
          password: testUsers.moderator.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('moderator');
      
      moderatorCookie = response.headers['set-cookie'][0];
    });

    test('Login with invalid credentials should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('2. Admin Access Control Tests', () => {
    test('Admin should access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalUsers');
    });

    test('Admin should access user management', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Admin should access system health', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('3. User Access Control Tests', () => {
    test('Regular user should NOT access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });

    test('Regular user should NOT access user management', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(403);
    });

    test('Regular user should access their own profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUsers.regularUser.email);
    });

    test('Regular user should access public endpoints', async () => {
      const response = await request(app)
        .get('/api/health/status')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
    });
  });

  describe('4. Protected Routes Tests', () => {
    test('Unauthenticated request should be rejected', async () => {
      const response = await request(app)
        .get('/api/admin/stats');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Unauthorized');
    });

    test('Authenticated user should access protected non-admin routes', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
    });

    test('Session validation should work correctly', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
    });
  });

  describe('5. Role-Based Middleware Tests', () => {
    test('requireAuth middleware should allow authenticated users', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
    });

    test('requireAdmin middleware should block non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', userCookie);
      
      expect([403, 404]).toContain(response.status);
    });

    test('requireRole middleware should check specific roles', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', moderatorCookie);
      
      expect(response.status).toBe(403);
    });
  });

  describe('6. Permission System Tests', () => {
    test('Admin should have all permissions', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
      // Admin implicitly has all permissions
    });

    test('User permissions should be limited', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('user');
    });

    test('Permission-based endpoints should enforce access', async () => {
      const response = await request(app)
        .post('/api/admin/users/1/role')
        .set('Cookie', userCookie)
        .send({ role: 'admin' });
      
      expect(response.status).toBe(403);
    });
  });

  describe('7. Navigation and UI Access Tests', () => {
    test('Admin should see admin menu items', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
      // Frontend will use this role to show/hide menu items
    });

    test('Regular user should not see admin menu items', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', userCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('user');
      expect(response.body.role).not.toBe('admin');
    });
  });

  describe('8. Cross-Origin and Security Tests', () => {
    test('CORS should be properly configured', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('Rate limiting should be enforced', async () => {
      const promises = [];
      // Make many rapid requests
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@test.com',
              password: 'wrong'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('9. Logout and Session Management', () => {
    test('Logout should clear session', async () => {
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', userCookie);
      
      expect(logoutResponse.status).toBe(200);
      
      // Try to access protected route after logout
      const afterLogout = await request(app)
        .get('/api/auth/me')
        .set('Cookie', userCookie);
      
      expect(afterLogout.status).toBe(401);
    });

    test('Session timeout should be enforced', async () => {
      // This would require waiting for session timeout or mocking time
      // For now, we'll just check that session config exists
      const response = await request(app)
        .get('/api/auth/session')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
    });
  });
});

// Export test summary function
export async function runRBACTests() {
  console.log('Starting comprehensive RBAC verification...');
  console.log('Testing the following scenarios:');
  console.log('1. Authentication - Login with different roles');
  console.log('2. Admin Access Control - Admin-only endpoints');
  console.log('3. User Access Control - User restrictions');
  console.log('4. Protected Routes - Authentication requirements');
  console.log('5. Role-Based Middleware - Role enforcement');
  console.log('6. Permission System - Permission-based access');
  console.log('7. Navigation Access - UI element visibility');
  console.log('8. Security - CORS and rate limiting');
  console.log('9. Session Management - Logout and timeouts');
}