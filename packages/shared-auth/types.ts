/**
 * Shared Auth Types
 * TypeScript interfaces and types for authentication across services
 */

export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
  company?: string | null;
  phone?: string | null;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface AuthenticatedRequest {
  user?: {
    id: number;
    email: string;
    username: string;
    role?: string;
    permissions?: string[];
  };
  session?: {
    passport?: {
      user?: number;
    };
    cookie?: {
      maxAge?: number;
    };
  };
}

export interface SessionConfig {
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  name: string;
  cookie: {
    httpOnly: boolean;
    secure: boolean;
    maxAge: number;
    domain?: string;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenData {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  isRevoked: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  company?: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  username: string;
  role?: string;
  permissions?: string[];
  authenticated: boolean;
  refreshToken?: string;
  message?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: User;
  error?: string;
}
