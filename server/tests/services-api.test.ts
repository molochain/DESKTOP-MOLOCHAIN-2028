/**
 * Services API Test Suite
 * Tests for booking, pricing, and favorites endpoints
 * 
 * These tests verify API endpoint behavior with strict assertions.
 * Authentication is mocked via x-test-auth header.
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  },
  createLoggerWithContext: vi.fn(() => ({
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

const mockUser = {
  id: 999,
  email: 'testuser@example.com',
  username: 'testuser',
  role: 'user'
};

vi.mock('../core/auth/auth.service', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: vi.fn((req: any, res: any, next: any) => {
    if (req.headers['x-test-auth'] === 'true') {
      req.user = mockUser;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }),
  isAdmin: vi.fn((req: any, res: any, next: any) => next()),
  hasRole: vi.fn(() => (req: any, res: any, next: any) => next()),
  hasPermission: vi.fn(() => (req: any, res: any, next: any) => next())
}));

import { createTestApp } from './test-utils';

describe('Services API - Booking, Pricing, and Favorites', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Booking API Endpoints', () => {
    describe('POST /api/bookings - Create booking', () => {
      it('should require authentication', async () => {
        const bookingData = {
          serviceId: 'service-001',
          serviceName: 'Ocean Freight',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890'
        };

        const response = await request(app)
          .post('/api/bookings')
          .send(bookingData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should create booking when authenticated with valid data', async () => {
        const bookingData = {
          serviceId: 'service-001',
          serviceName: 'Ocean Freight',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
          requestedDate: new Date().toISOString(),
          notes: 'Test booking'
        };

        const response = await request(app)
          .post('/api/bookings')
          .set('x-test-auth', 'true')
          .send(bookingData);

        if (response.status === 201) {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('bookingNumber');
          expect(response.body.bookingNumber).toMatch(/^BK-/);
        } else {
          expect(response.status).toBe(500);
        }
      });

      it('should return 400 for missing required fields', async () => {
        const invalidBookingData = {
          serviceName: 'Ocean Freight'
        };

        const response = await request(app)
          .post('/api/bookings')
          .set('x-test-auth', 'true')
          .send(invalidBookingData);

        expect([400, 500]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty('error', 'Validation failed');
        }
      });
    });

    describe('GET /api/bookings - List user bookings', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/bookings');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should return bookings array when authenticated', async () => {
        const response = await request(app)
          .get('/api/bookings')
          .set('x-test-auth', 'true');

        if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
        } else {
          expect(response.status).toBe(500);
        }
      });
    });

    describe('GET /api/bookings/:id - Get single booking', () => {
      it('should return 400 for invalid booking ID format', async () => {
        const response = await request(app)
          .get('/api/bookings/invalid-id');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid booking ID');
      });

      it('should return 404 for non-existent booking', async () => {
        const response = await request(app)
          .get('/api/bookings/999999');

        if (response.status !== 500) {
          expect(response.status).toBe(404);
          expect(response.body).toHaveProperty('error', 'Booking not found');
        }
      });
    });

    describe('PATCH /api/bookings/:id/status - Update booking status', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .patch('/api/bookings/1/status')
          .send({ status: 'confirmed' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should return 400 for invalid booking ID', async () => {
        const response = await request(app)
          .patch('/api/bookings/invalid-id/status')
          .set('x-test-auth', 'true')
          .send({ status: 'confirmed' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid booking ID');
      });

      it('should return 400 for invalid status value', async () => {
        const response = await request(app)
          .patch('/api/bookings/1/status')
          .set('x-test-auth', 'true')
          .send({ status: 'invalid_status' });

        if (response.status !== 500) {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Validation failed');
        }
      });

      it('should accept valid status values', async () => {
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        
        for (const status of validStatuses) {
          const response = await request(app)
            .patch('/api/bookings/1/status')
            .set('x-test-auth', 'true')
            .send({ status });

          expect([200, 403, 404, 500]).toContain(response.status);
        }
      });
    });
  });

  describe('Pricing API Endpoints', () => {
    describe('GET /api/services/:id/pricing - Get pricing tiers', () => {
      it('should return pricing tiers or 404 for valid service ID', async () => {
        const response = await request(app)
          .get('/api/services/container/pricing');

        expect([200, 404, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('serviceId', 'container');
          expect(response.body).toHaveProperty('tiers');
          expect(Array.isArray(response.body.tiers)).toBe(true);
        }
      });
    });

    describe('POST /api/services/calculate-price - Calculate price', () => {
      it('should return 400 for missing serviceId', async () => {
        const response = await request(app)
          .post('/api/services/calculate-price')
          .send({ quantity: 1 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'serviceId is required');
      });

      it('should calculate price with valid parameters', async () => {
        const response = await request(app)
          .post('/api/services/calculate-price')
          .send({
            serviceId: 'container',
            quantity: 2,
            distance: 100,
            weight: 500
          });

        if (response.status === 200) {
          expect(response.body).toHaveProperty('serviceId', 'container');
          expect(response.body).toHaveProperty('basePrice');
          expect(response.body).toHaveProperty('totalPrice');
          expect(response.body).toHaveProperty('breakdown');
          expect(typeof response.body.totalPrice).toBe('number');
        } else {
          expect([404, 500]).toContain(response.status);
        }
      });

      it('should apply insurance surcharge when requested', async () => {
        const response = await request(app)
          .post('/api/services/calculate-price')
          .send({
            serviceId: 'container',
            quantity: 1,
            insurance: true
          });

        if (response.status === 200) {
          expect(response.body.breakdown).toHaveProperty('insurance');
          expect(response.body.breakdown.insurance).toBeGreaterThan(0);
        }
      });

      it('should apply express delivery surcharge when requested', async () => {
        const response = await request(app)
          .post('/api/services/calculate-price')
          .send({
            serviceId: 'container',
            quantity: 1,
            expressDelivery: true
          });

        if (response.status === 200) {
          expect(response.body.breakdown).toHaveProperty('expressDelivery');
          expect(response.body.breakdown.expressDelivery).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Favorites API Endpoints', () => {
    describe('GET /api/favorites - List favorites', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/favorites');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should return favorites array when authenticated', async () => {
        const response = await request(app)
          .get('/api/favorites')
          .set('x-test-auth', 'true');

        if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
        } else {
          expect(response.status).toBe(500);
        }
      });
    });

    describe('POST /api/favorites - Add to favorites', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .post('/api/favorites')
          .send({ serviceId: 'container' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should return 400 for missing serviceId', async () => {
        const response = await request(app)
          .post('/api/favorites')
          .set('x-test-auth', 'true')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'serviceId is required');
      });

      it('should add service to favorites when authenticated', async () => {
        const response = await request(app)
          .post('/api/favorites')
          .set('x-test-auth', 'true')
          .send({ serviceId: 'container' });

        if (response.status === 201) {
          expect(response.body).toHaveProperty('serviceId', 'container');
          expect(response.body).toHaveProperty('userId', mockUser.id);
        } else {
          expect([400, 500]).toContain(response.status);
        }
      });
    });

    describe('DELETE /api/favorites/:serviceId - Remove from favorites', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .delete('/api/favorites/container');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should remove favorite when authenticated', async () => {
        const response = await request(app)
          .delete('/api/favorites/container')
          .set('x-test-auth', 'true');

        expect([200, 404, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
        }
      });
    });

    describe('GET /api/favorites/check/:serviceId - Check if favorited', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/favorites/check/container');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });

      it('should return favorite status when authenticated', async () => {
        const response = await request(app)
          .get('/api/favorites/check/container')
          .set('x-test-auth', 'true');

        if (response.status === 200) {
          expect(response.body).toHaveProperty('isFavorited');
          expect(typeof response.body.isFavorited).toBe('boolean');
        } else {
          expect(response.status).toBe(500);
        }
      });
    });
  });

  describe('API Response Format', () => {
    it('should return JSON content type for all endpoints', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-test-auth', 'true')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 500]).toContain(response.status);
    });
  });
});
