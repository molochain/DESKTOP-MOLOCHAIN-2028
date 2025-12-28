/**
 * Test setup file for Vitest
 * Initializes test environment and mocks
 */

import { vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.SESSION_SECRET = 'test_session_secret';
process.env.TOTP_SECRET = 'test_totp_secret';

// Mock external services
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  },
  createLoggerWithContext: vi.fn((context: string) => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    }))
  }))
}));

// Global test utilities
global.testUtils = {
  generateTestUser: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'user',
    permissions: ['read'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  generateTestSession: (userId, overrides = {}) => ({
    sessionId: `session_${Date.now()}_${Math.random()}`,
    userId,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Test Agent',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ...overrides
  }),
  
  generateTestToken: () => {
    return `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Cleanup after all tests
process.on('exit', () => {
  // Clean up any test resources
});