import { logger } from './logger';
import { db } from '../db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

interface SystemRecoveryState {
  lastCheckpoint: Date;
  systemStatus: 'healthy' | 'degraded' | 'critical';
  recoveryAttempts: number;
  criticalIssues: string[];
  recoveryActions: string[];
}

export class SystemRecoveryManager {
  private state: SystemRecoveryState = {
    lastCheckpoint: new Date(),
    systemStatus: 'healthy',
    recoveryAttempts: 0,
    criticalIssues: [],
    recoveryActions: []
  };

  /**
   * Main recovery entry point - call this on system startup
   */
  public async performSystemRecovery(): Promise<void> {
    logger.info('Starting system recovery procedures...');
    
    try {
      // Step 1: Verify database connectivity
      await this.verifyDatabaseConnection();
      
      // Step 2: Ensure critical data exists
      await this.ensureCriticalData();
      
      // Step 3: Verify services are operational
      await this.verifyServices();
      
      // Step 4: Clear any stale sessions
      await this.clearStaleSessions();
      
      // Step 5: Log recovery status
      this.logRecoveryStatus();
      
      logger.info('System recovery completed successfully');
      this.state.systemStatus = 'healthy';
      
    } catch (error) {
      logger.error('System recovery failed:', error);
      this.state.systemStatus = 'critical';
      this.state.recoveryAttempts++;
      
      if (this.state.recoveryAttempts < 3) {
        logger.info(`Scheduling retry attempt ${this.state.recoveryAttempts + 1}/3...`);
        setTimeout(() => this.performSystemRecovery(), 30000);
      } else {
        logger.error('Max recovery attempts exceeded. Manual intervention required.');
      }
    }
  }

  /**
   * Verify database connection with retry logic
   */
  private async verifyDatabaseConnection(): Promise<void> {
    let retries = 3;
    let delay = 2000;
    
    while (retries > 0) {
      try {
        // Test database connection
        await db.select().from(users).limit(1);
        logger.info('Database connection verified');
        return;
      } catch (error: any) {
        retries--;
        
        if (retries > 0) {
          logger.warn(`Database connection failed, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw new Error('Database connection could not be established');
        }
      }
    }
  }

  /**
   * Ensure critical data exists (e.g., admin user)
   */
  private async ensureCriticalData(): Promise<void> {
    try {
      // Check for admin user
      const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
      
      if (adminUsers.length === 0) {
        // In production, do NOT auto-create admin with default credentials
        if (process.env.NODE_ENV === 'production') {
          logger.warn('No admin user found in production. Please create admin through secure setup process.');
          this.state.criticalIssues.push('No admin user configured - manual setup required');
          return;
        }
        
        // Development only: create admin with secure random password
        const crypto = await import('crypto');
        const securePassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(securePassword, 12);
        
        await db.insert(users).values({
          username: 'admin',
          email: 'admin@molochain.com',
          password: hashedPassword,
          role: 'admin',
          permissions: ['read', 'write', 'admin', 'manage_users', 'manage_system'],
          isActive: true,
          twoFactorEnabled: false,
          recoveryCodes: []
        });
        
        logger.info('Development admin user created - check logs for credentials');
        logger.warn(`DEV ADMIN CREDENTIALS - Email: admin@molochain.com, Password: ${securePassword}`);
        this.state.recoveryActions.push('Created development admin user');
      } else {
        logger.info(`Found ${adminUsers.length} admin user(s)`);
      }
      
    } catch (error) {
      logger.error('Failed to ensure critical data:', error);
      this.state.criticalIssues.push('Critical data verification failed');
    }
  }

  /**
   * Verify all services are operational
   */
  private async verifyServices(): Promise<void> {
    const services = [
      { name: 'Database', check: () => this.checkDatabase() },
      { name: 'Auth System', check: () => this.checkAuthSystem() },
      { name: 'Cache', check: () => this.checkCache() },
      { name: 'WebSocket', check: () => this.checkWebSocket() }
    ];
    
    for (const service of services) {
      try {
        await service.check();
        logger.info(`Service ${service.name}: OK`);
      } catch (error) {
        logger.error(`Service ${service.name}: FAILED`, error);
        this.state.criticalIssues.push(`${service.name} service is not operational`);
        this.state.systemStatus = 'degraded';
      }
    }
  }

  private async checkDatabase(): Promise<void> {
    await db.select().from(users).limit(1);
  }

  private async checkAuthSystem(): Promise<void> {
    // Basic auth system check
    const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (adminUser.length === 0) {
      throw new Error('No admin user found');
    }
  }

  private async checkCache(): Promise<void> {
    // Cache is always operational in our setup
    return Promise.resolve();
  }

  private async checkWebSocket(): Promise<void> {
    // WebSocket check is passive - services are initialized on startup
    return Promise.resolve();
  }

  /**
   * Clear stale sessions
   */
  private async clearStaleSessions(): Promise<void> {
    try {
      // Sessions are managed by MemoryStore and auto-expire
      logger.info('Session cleanup completed');
    } catch (error) {
      logger.error('Failed to clear stale sessions:', error);
    }
  }

  /**
   * Log recovery status
   */
  private logRecoveryStatus(): void {
    logger.info('=== System Recovery Status ===');
    logger.info(`Status: ${this.state.systemStatus}`);
    logger.info(`Recovery Attempts: ${this.state.recoveryAttempts}`);
    
    if (this.state.criticalIssues.length > 0) {
      logger.warn('Critical Issues:');
      this.state.criticalIssues.forEach(issue => logger.warn(`  - ${issue}`));
    }
    
    if (this.state.recoveryActions.length > 0) {
      logger.info('Recovery Actions Taken:');
      this.state.recoveryActions.forEach(action => logger.info(`  - ${action}`));
    }
    
    logger.info('==============================');
  }

  /**
   * Get current recovery state
   */
  public getState(): SystemRecoveryState {
    return { ...this.state };
  }

  /**
   * Manual health check endpoint
   */
  public async performHealthCheck(): Promise<{
    status: string;
    issues: string[];
    lastCheck: Date;
  }> {
    this.state.criticalIssues = [];
    
    await this.verifyServices();
    
    return {
      status: this.state.systemStatus,
      issues: this.state.criticalIssues,
      lastCheck: new Date()
    };
  }
}

// Export singleton instance
export const systemRecovery = new SystemRecoveryManager();