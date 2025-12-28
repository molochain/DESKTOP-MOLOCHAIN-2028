import { User } from '../core/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        role: 'admin' | 'user' | 'moderator' | 'manager' | 'analyst';
        permissions: string[];
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        twoFactorEnabled?: boolean;
        twoFactorSecret?: string | null;
      };
      apiKeyStatus?: {
        configured: number;
        total: number;
        services: Record<string, boolean>;
      };
    }
  }
}

export {};