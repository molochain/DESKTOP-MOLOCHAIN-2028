import 'express-session';

declare module 'express-session' {
  interface SessionData {
    twoFactorSecret?: string;
    twoFactorRecoveryCodes?: string[];
    twoFactorUserId?: number;
    twoFactorAuthenticated?: boolean;
    userRole?: string;
    userPermissions?: string[];
  }
}