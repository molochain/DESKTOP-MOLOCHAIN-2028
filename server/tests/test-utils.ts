/**
 * Test utilities for authentication endpoint testing
 */

import express, { type Express } from 'express';
import { registerRoutes } from '../routes';
import { setupPasswordReset } from '../core/auth/password-reset.service';

export async function createTestApp(): Promise<Express> {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Setup systems
  registerRoutes(app);
  
  // Setup password reset routes (not included in registerRoutes)
  setupPasswordReset(app);
  
  // Add a small delay to ensure database is initialized
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return app;
}