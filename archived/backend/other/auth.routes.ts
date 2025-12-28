import { Express } from 'express';
import { setupAuth } from '../../core/auth/auth.service';
import twoFactorAuthRoutes from './two-factor-auth';
import { logger } from '../../utils/logger';

export function setupAuthRoutes(app: Express) {
  // Initialize auth system
  setupAuth(app);
  
  // Two-factor authentication routes
  app.use('/api/auth', twoFactorAuthRoutes);
  
  logger.info('Auth routes initialized');
}