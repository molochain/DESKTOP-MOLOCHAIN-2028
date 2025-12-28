/**
 * Enhanced Authentication Service
 * Provides comprehensive user authentication with security features
 */

import { Request, Response, NextFunction, type Express } from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import { parse as parseCookie } from 'cookie';
import { db } from '../../db';
import { users, refreshTokens } from '@db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate';
import { registrationSchema } from '../../validation/auth.schemas';
import { emailService } from '../../services/email.service';
// NOTE: auditComplianceManager is imported dynamically below to avoid circular dependency
// auth.service -> audit-compliance-manager -> identity-manager-service -> auth.service

// Helper to log authentication events via centralized audit manager
// Uses dynamic import to break circular dependency
async function logAuthEvent(
  action: string,
  userId: number,
  req: Request,
  details: Record<string, any> = {},
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency at module load time
    const { auditComplianceManager } = await import('../audit/audit-compliance-manager');
    await auditComplianceManager.logAudit({
      userId,
      action,
      resourceType: 'authentication',
      resourceId: userId.toString(),
      details,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      severity,
      tags: ['auth', action]
    });
  } catch (error) {
    logger.error('Failed to log auth audit event:', error);
  }
}

// Session duration constants
const SESSION_DURATION_DEFAULT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_DURATION_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days (matches remember-me session duration)

// Generate secure refresh token
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Hash refresh token for storage
function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Create refresh token in database
async function createRefreshToken(userId: number, req: Request): Promise<string> {
  const token = generateRefreshToken();
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  
  try {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });
    
    logger.debug(`Created refresh token for user ${userId}`);
    return token;
  } catch (error) {
    logger.error('Failed to create refresh token:', error);
    throw error;
  }
}

// Validate and get user from refresh token
async function validateRefreshToken(token: string): Promise<any | null> {
  const tokenHash = hashRefreshToken(token);
  
  try {
    const [tokenRecord] = await db.select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.isRevoked, false)
        )
      )
      .limit(1);
    
    if (!tokenRecord) {
      logger.debug('Refresh token not found or revoked');
      return null;
    }
    
    if (new Date() > tokenRecord.expiresAt) {
      logger.debug('Refresh token expired');
      await revokeRefreshToken(tokenHash);
      return null;
    }
    
    const user = await getUserById(tokenRecord.userId);
    return user;
  } catch (error) {
    logger.error('Failed to validate refresh token:', error);
    return null;
  }
}

// Revoke a refresh token
async function revokeRefreshToken(tokenHash: string): Promise<void> {
  try {
    await db.update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
    logger.debug('Refresh token revoked');
  } catch (error) {
    logger.error('Failed to revoke refresh token:', error);
  }
}

// Revoke all refresh tokens for a user
async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  try {
    await db.update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
    logger.debug(`Revoked all refresh tokens for user ${userId}`);
  } catch (error) {
    logger.error('Failed to revoke user refresh tokens:', error);
  }
}

// Clean up expired refresh tokens (can be called periodically)
async function cleanupExpiredRefreshTokens(): Promise<void> {
  try {
    await db.delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()));
    logger.debug('Cleaned up expired refresh tokens');
  } catch (error) {
    logger.error('Failed to cleanup expired refresh tokens:', error);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    role?: string;
  };
}

// Main AuthService class
export class AuthService {
  constructor() {
    logger.info('AuthService initialized');
  }

  // Session validation method
  async validateSession(req: Request): Promise<any> {
    try {
      // Check if user is authenticated through passport
      if (req.user) {
        return req.user;
      }

      // Check passport session
      const sessionData = req.session as any;
      if (!sessionData || !sessionData.passport?.user) {
        return null;
      }

      const userId = sessionData.passport.user;
      const user = await getUserById(userId);
      return user;
    } catch (error) {
      logger.error('Session validation error:', error);
      return null;
    }
  }
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcryptjs.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// Get user by email
export async function getUserByEmail(email: string): Promise<any | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.isActive) return null;

    return user;
  } catch (error) {
    logger.error('Error fetching user by email:', error);
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<any | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user || !user.isActive) return null;

    return user;
  } catch (error) {
    logger.error('Error fetching user by username:', error);
    return null;
  }
}

// Simple in-memory cache for user sessions to reduce DB queries
const userCache = new Map<number, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get user by ID with caching
export async function getUserById(id: number): Promise<any | null> {
  try {
    // Check cache first
    const cached = userCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.user;
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user || !user.isActive) {
      userCache.delete(id); // Remove from cache if user not found or inactive
      return null;
    }

    // Cache the result
    userCache.set(id, { user: user, timestamp: Date.now() });
    return user;
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    return null;
  }
}

// Create default admin user if none exists
async function createDefaultAdminUser(): Promise<void> {
  // SECURITY: Never auto-create admin in production
  if (process.env.NODE_ENV === 'production') {
    logger.info('Skipping default admin creation in production - use secure setup process');
    return;
  }

  // Add a delay to ensure database is fully initialized
  await new Promise(resolve => setTimeout(resolve, 5000));

  let retries = 3;
  let delay = 2000;

  while (retries > 0) {
    try {
      const adminCount = await db.select().from(users).where(eq(users.role, 'admin'));

      if (adminCount.length === 0) {
        // Generate secure random password for development
        const securePassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await hashPassword(securePassword);

        await db.insert(users).values({
          username: 'admin',
          email: 'admin@molochain.com',
          password: hashedPassword,
          fullName: 'System Administrator',
          company: 'MoloChain',
          phone: null,
          role: 'admin',
          permissions: ['read', 'write', 'admin', 'manage_users', 'manage_system'],
          isActive: true,
          twoFactorEnabled: false,
          recoveryCodes: []
        });

        logger.info('Development admin user created - check logs for credentials');
        logger.warn(`DEV ADMIN CREDENTIALS - Email: admin@molochain.com, Password: ${securePassword}`);
      } else {
        logger.info(`Admin user already exists (${adminCount.length} admin(s) found)`);
      }
      return; // Success, exit the function
    } catch (error: any) {
      retries--;

      // Check if it's a duplicate key error
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        logger.info('Admin user already exists in database');
        return;
      }

      // Check if it's a connection error
      if (error.message?.includes('Connection') || error.message?.includes('socket') || 
          error.message?.includes('ECONNRESET') || error.code === 'ECONNRESET') {
        if (retries > 0) {
          logger.warn(`Database connection error, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }

      // Only log error if we've exhausted retries
      if (retries === 0) {
        logger.error('Failed to create default admin user after all retries:', error);
      }
    }
  }
}

// Setup authentication system
export function setupAuth(app: Express) {
  logger.info('Authentication system ENABLED with database integration.');

  // Production session secret validation
  const isProd = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET;

  if (isProd) {
    if (!sessionSecret) {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    if (sessionSecret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters long in production');
    }
    logger.info('Production session secret validated');
  } else {
    // Generate a random session secret for development only
    if (!sessionSecret) {
      logger.warn('No SESSION_SECRET set, generating random secret for development');
    }
  }

  const finalSessionSecret = sessionSecret || crypto.randomBytes(32).toString('hex');

  // Session store setup - Use Redis for cross-subdomain SSO in production
  let sessionStore: session.Store;
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      const redisClient = createClient({ url: redisUrl });
      redisClient.connect().catch((err) => {
        logger.error('Redis connection failed, falling back to MemoryStore:', err);
      });
      
      redisClient.on('error', (err) => {
        logger.error('Redis session store error:', err);
      });
      
      redisClient.on('connect', () => {
        logger.info('Redis session store connected successfully');
      });
      
      sessionStore = new RedisStore({ 
        client: redisClient,
        prefix: 'molochain:sess:'
      });
      logger.info('Using Redis session store for cross-subdomain SSO');
    } catch (error) {
      logger.error('Failed to initialize Redis session store:', error);
      const MemoryStore = createMemoryStore(session);
      sessionStore = new MemoryStore({ checkPeriod: 86400000 });
      logger.warn('Falling back to MemoryStore due to Redis initialization failure');
    }
  } else {
    const MemoryStore = createMemoryStore(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    logger.info('Using MemoryStore for sessions (Redis not configured)');
  }

  // Session configuration - Cross-subdomain SSO enabled
  // Cookie settings:
  // - domain: .molochain.com allows sharing across all subdomains (production only)
  // - sameSite: 'none' required for cross-origin API calls from subdomains (production only)
  // - secure: true required when sameSite is 'none' (production only)
  app.use(session({
    secret: finalSessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'molochain.sid',  // Consistent across all subdomains
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProd,  // Only secure in production (required for sameSite: 'none')
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
      domain: isProd ? '.molochain.com' : undefined,  // Share across subdomains in production
      sameSite: isProd ? 'none' : 'lax',  // 'none' for cross-subdomain SSO in production
      path: '/'
    }
  }));

  // Configure passport local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        logger.debug('Login attempt for email:', email);

        // Only make one database call
        const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!dbUser) {
          logger.debug('User not found for email:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }

        logger.debug('User found, verifying password');
        const isValidPassword = await verifyPassword(password, dbUser.password);
        if (!isValidPassword) {
          logger.debug('Invalid password for email:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }

        logger.debug('Password valid, updating last login');
        // Update last login
        await db.update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, dbUser.id));

        logger.debug('Login successful for user:', dbUser.email);
        return done(null, dbUser);
      } catch (error) {
        logger.error('Authentication error:', error);
        return done(error);
      }
    }
  ));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Use a simple cache to avoid repeated database calls
      const user = await getUserById(id);
      done(null, user);
    } catch (error) {
      logger.error('User deserialization error:', error);
      done(null, null); // Return null instead of error to prevent auth failures
    }
  });

  // Create default admin user on startup
  createDefaultAdminUser().catch(error => {
    logger.error('Failed to create default admin user:', error);
  });

  // Setup auth routes
  setupAuthRoutes(app);
}

function setupAuthRoutes(app: Express) {
  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // Debug logging
      logger.debug('Auth check - req.user:', req.user ? 'exists' : 'null');
      logger.debug('Auth check - session:', (req.session as any)?.passport?.user);

      if (!req.user) {
        // Try to get user from session if passport didn't deserialize
        const sessionData = req.session as any;
        if (sessionData?.passport?.user) {
          const userId = sessionData.passport.user;
          const user = await getUserById(userId);
          if (user) {
            logger.debug('User retrieved from session cache:', user.email);
            return res.status(200).json({
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              permissions: user.permissions,
              isActive: user.isActive,
              authenticated: true
            });
          }
        }
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = req.user as any; // Cast to any to access properties directly
      logger.debug('Returning user data for:', user.email);
      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        authenticated: true
      });
    } catch (error) {
      logger.error('Auth query error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    const { rememberMe } = req.body;
    
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        logger.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        // Log failed login attempt
        logAuthEvent('login_failed', 0, req, { 
          email: req.body.email,
          reason: info?.message || 'Authentication failed'
        }, 'warning').catch(() => {});
        return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }

      req.logIn(user, async (err) => {
        if (err) {
          logger.error('Session error:', err);
          return res.status(500).json({ error: 'Session creation failed' });
        }

        try {
          let refreshToken: string | undefined;
          
          // Handle remember me functionality
          if (rememberMe === true) {
            // Extend session to 30 days
            if (req.session && req.session.cookie) {
              req.session.cookie.maxAge = SESSION_DURATION_REMEMBER_ME;
            }
            
            // Generate refresh token
            refreshToken = await createRefreshToken(user.id, req);
            logger.debug(`Created refresh token for user ${user.id} with rememberMe=true`);
          }

          const response: any = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            authenticated: true,
            message: "Login successful"
          };

          // Include refresh token in response if generated
          if (refreshToken) {
            response.refreshToken = refreshToken;
          }

          res.status(200).json(response);

          // Log successful login
          logAuthEvent('login_success', user.id, req, {
            email: user.email,
            role: user.role,
            rememberMe: rememberMe === true
          }).catch(() => {});

          // Send login notification email (non-blocking)
          emailService.sendAuthEmail('login', user.email, {
            username: user.username || user.email,
            ip_address: req.ip || req.socket.remoteAddress || 'Unknown',
            user_agent: req.headers['user-agent'] || 'Unknown Browser',
            login_time: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
          }).catch(err => logger.debug('Login email notification failed (non-critical):', err));
        } catch (error) {
          logger.error('Login post-processing error:', error);
          // Still return success but without refresh token
          res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            authenticated: true,
            message: "Login successful"
          });
        }
      });
    })(req, res, next);
  });

  // Refresh token endpoint - get new session using refresh token
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const user = await validateRefreshToken(refreshToken);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      // Log the user in with a new session
      req.logIn(user, async (err) => {
        if (err) {
          logger.error('Session refresh error:', err);
          return res.status(500).json({ error: 'Session creation failed' });
        }

        // Extend session since this is a refresh
        if (req.session && req.session.cookie) {
          req.session.cookie.maxAge = SESSION_DURATION_REMEMBER_ME;
        }

        // Rotate refresh token for security
        const tokenHash = hashRefreshToken(refreshToken);
        await revokeRefreshToken(tokenHash);
        
        const newRefreshToken = await createRefreshToken(user.id, req);

        logger.info(`Session refreshed for user ${user.id}`);

        res.status(200).json({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          permissions: user.permissions,
          authenticated: true,
          refreshToken: newRefreshToken,
          message: "Session refreshed successfully"
        });
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({ error: 'Failed to refresh session' });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validationResult = registrationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        });
      }

      const { email, username, password, fullName, company, phone, role } = validationResult.data;

      // Check if user exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }

      const existingUsername = await getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);

      const [newUser] = await db.insert(users).values({
        email,
        username,
        password: hashedPassword,
        fullName,
        company: company || null,
        phone: phone || null,
        role: role || 'user',
        permissions: ['read'],
        isActive: true
      }).returning();

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        company: newUser.company,
        phone: newUser.phone,
        role: newUser.role,
        message: "Registration successful"
      });

      // Log registration event
      logAuthEvent('registration', newUser.id, req, {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }).catch(() => {});

      // Send registration welcome email (non-blocking)
      emailService.sendAuthEmail('register', newUser.email, {
        username: newUser.username,
        full_name: newUser.fullName || newUser.username,
        email: newUser.email,
      }).catch(err => logger.debug('Registration email notification failed (non-critical):', err));
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    // Clear user cache if exists
    const userId = (req.session as any)?.passport?.user || (req.user as any)?.id;
    if (userId) {
      userCache.delete(userId);
      logger.debug(`Cleared cache for user ID: ${userId}`);
      
      // Revoke all refresh tokens for this user
      try {
        await revokeAllUserRefreshTokens(userId);
        logger.debug(`Revoked all refresh tokens for user ${userId}`);
      } catch (error) {
        logger.error('Failed to revoke refresh tokens during logout:', error);
      }
    }

    // Also revoke specific refresh token if provided in request body
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const tokenHash = hashRefreshToken(refreshToken);
        await revokeRefreshToken(tokenHash);
        logger.debug('Revoked specific refresh token during logout');
      } catch (error) {
        logger.error('Failed to revoke specific refresh token:', error);
      }
    }

    // Store session ID before destruction
    const sessionId = req.sessionID;

    req.logout((err) => {
      if (err) {
        logger.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      // Destroy the session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          logger.error('Session destruction error:', destroyErr);
        }

        // Clear all session-related data from request
        (req as any).user = undefined;
        (req as any).session = undefined;

        // Clear the session cookie with proper settings including Max-Age=0
        // Must match session cookie settings for cross-subdomain SSO
        const isProdEnv = req.app.get("env") === "production";
        const cookieOptions: any = {
          path: '/',
          httpOnly: true,
          secure: isProdEnv,
          sameSite: isProdEnv ? 'none' : 'lax',  // Match session cookie settings
          maxAge: 0,
          expires: new Date(0),
          domain: isProdEnv ? '.molochain.com' : undefined
        };

        res.clearCookie('molochain.sid', cookieOptions);
        
        // Also set an expired cookie header explicitly with domain and SameSite for production
        const domainPart = isProdEnv ? '; Domain=.molochain.com' : '';
        const sameSitePart = isProdEnv ? '; SameSite=None' : '; SameSite=Lax';
        res.setHeader('Set-Cookie', `molochain.sid=; Path=/${domainPart}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Max-Age=0${isProdEnv ? '; Secure' : ''}${sameSitePart}`);
        
        // Also clear legacy cookie name if present
        res.clearCookie('logistics.sid', cookieOptions);

        logger.info(`User ${userId} logged out, session ${sessionId} destroyed`);

        // Log logout event
        if (userId) {
          logAuthEvent('logout', userId, req, {
            sessionId
          }).catch(() => {});
        }

        res.status(200).json({ 
          success: true, 
          message: "Logged out successfully" 
        });
      });
    });
  });
  
  // Periodically cleanup expired refresh tokens (every hour)
  setInterval(() => {
    cleanupExpiredRefreshTokens().catch(error => {
      logger.error('Scheduled refresh token cleanup failed:', error);
    });
  }, 60 * 60 * 1000);
}

// Authentication middleware
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for API key in headers first
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
      return next();
    }

    // Check if user is already attached by passport
    if (req.user) {
      return next();
    }

    // Check for legacy session userId
    if ((req.session as any)?.userId) {
      const user = await getUserById((req.session as any).userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check for Passport.js session (passport stores user ID in req.session.passport.user)
    const sessionData = req.session as any;
    if (sessionData?.passport?.user) {
      const user = await getUserById(sessionData.passport.user);
      if (user) {
        req.user = user;
        return next();
      }
    }

    logger.debug('Auth check failed', {
      hasSession: !!req.session,
      hasUserId: !!(req.session as any)?.userId,
      hasPassportUser: !!(req.session as any)?.passport?.user,
      hasApiKey: !!apiKey,
      path: req.path
    });

    return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Admin authorization middleware
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    let user = req.user as any;

    // If user not already attached, try to get from passport session
    if (!user) {
      const sessionData = req.session as any;
      if (sessionData?.passport?.user) {
        user = await getUserById(sessionData.passport.user);
        if (user) {
          req.user = user;
        }
      }
    }

    // Also check legacy session userId
    if (!user && (req.session as any)?.userId) {
      user = await getUserById((req.session as any).userId);
      if (user) {
        req.user = user;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
}

// SSO JWT Secret - must match mololink's JWT_SECRET for cross-subdomain SSO
const SSO_JWT_SECRET = process.env.JWT_SECRET || 'molochain-production-jwt-secret-2024';

/**
 * Verifies SSO cookie (sso.sid) JWT token and returns user data
 * Used for cross-subdomain authentication between mololink, admin, opt, etc.
 */
async function verifySsoCookie(req: any): Promise<any | null> {
  try {
    // Extract sso.sid cookie from request
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) {
      return null;
    }

    const cookies = parseCookie(cookieHeader);
    const ssoToken = cookies['sso.sid'];
    
    if (!ssoToken) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(ssoToken, SSO_JWT_SECRET) as any;
    
    if (!decoded || !decoded.id || !decoded.email) {
      logger.debug('SSO cookie JWT missing required fields');
      return null;
    }

    logger.info(`SSO cookie verified for user ${decoded.email}`, { 
      userId: decoded.id, 
      role: decoded.role 
    });

    // Return user data from JWT payload (hydrated from mololink)
    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username || decoded.email.split('@')[0],
      role: decoded.role || 'user',
      firstName: decoded.firstName || null,
      lastName: decoded.lastName || null,
      // Mark as SSO-authenticated for downstream processing
      ssoAuthenticated: true
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('SSO cookie JWT verification failed:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.debug('SSO cookie JWT expired');
    } else {
      logger.error('SSO cookie verification error:', error);
    }
    return null;
  }
}

// Session validation for WebSocket and other services
export async function validateSession(req: any): Promise<any | null> {
  try {
    // Check if user is authenticated through passport
    if (req.user) {
      return req.user;
    }

    // Check passport session (admin's own session)
    const sessionData = req.session as any;
    if (sessionData?.passport?.user) {
      const userId = sessionData.passport.user;
      const user = await getUserById(userId);
      if (user) {
        return user;
      }
    }

    // Check SSO cookie (cross-subdomain authentication from mololink)
    const ssoUser = await verifySsoCookie(req);
    if (ssoUser) {
      return ssoUser;
    }

    return null;
  } catch (error) {
    logger.error('Session validation error:', error);
    return null;
  }
}