/**
 * @package @molochain/shared-auth
 * Shared Authentication Utilities
 * Auth types, interfaces, and constants for cross-service use
 */

export {
  type User,
  type AuthenticatedRequest,
  type SessionConfig,
  type TokenPayload,
  type RefreshTokenData,
  type LoginCredentials,
  type RegistrationData,
  type AuthResponse,
  type TokenValidationResult,
} from './types';

export const SESSION_DURATION_DEFAULT = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_DURATION_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000; // 30 days
export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const AUTH_COOKIE_NAME = 'molochain.sid';  // Cross-subdomain SSO cookie

export const AUTH_ERRORS = {
  NOT_AUTHENTICATED: 'Not authenticated',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  SESSION_EXPIRED: 'Session expired',
  TOKEN_INVALID: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Token is required',
  PERMISSION_DENIED: 'Permission denied',
} as const;

export type AuthError = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];

export interface TokenValidator {
  validateToken(token: string): Promise<{ valid: boolean; userId?: number; error?: string }>;
  validateRefreshToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface SessionManager {
  createSession(userId: number, rememberMe?: boolean): Promise<string>;
  validateSession(sessionId: string): Promise<{ valid: boolean; userId?: number }>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: number): Promise<void>;
}

export function createDefaultSessionConfig(
  secret: string,
  isProduction: boolean = false,
  domain?: string
): SessionConfig {
  return {
    secret,
    resave: false,
    saveUninitialized: false,
    name: AUTH_COOKIE_NAME,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: SESSION_DURATION_DEFAULT,
      domain: isProduction ? domain : undefined,
      sameSite: isProduction ? 'none' : 'lax',  // 'none' for cross-subdomain SSO
      path: '/',
    },
  };
}

export function isSessionExpired(expiresAt: Date | number): boolean {
  const expiry = typeof expiresAt === 'number' ? expiresAt : expiresAt.getTime();
  return Date.now() > expiry;
}

export function getSessionExpiry(rememberMe: boolean = false): Date {
  const duration = rememberMe ? SESSION_DURATION_REMEMBER_ME : SESSION_DURATION_DEFAULT;
  return new Date(Date.now() + duration);
}
