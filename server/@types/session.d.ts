import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userEmail?: string;
    userRole?: 'user' | 'admin';
    userPermissions?: string[];
    createdAt?: number;
    lastActivity?: number;
    twoFactorSecret?: string;
    twoFactorRecoveryCodes?: string[];
    twoFactorUserId?: number;
    twoFactorAuthenticated?: boolean;
  }
}