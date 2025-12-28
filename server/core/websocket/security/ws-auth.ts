import { IncomingMessage } from 'http';
import { parse } from 'url';
import { parse as parseCookie } from 'cookie';
import jwt from 'jsonwebtoken';
import { logger } from '../../../utils/logger';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
}

export interface WSAuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime: Date;
  };
}

// Rate limiting for WebSocket connections - more lenient in development
const connectionAttempts = new Map<string, { count: number; resetTime: Date }>();
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const MAX_CONNECTIONS_PER_IP = IS_DEVELOPMENT ? 100 : 10; // 100 in dev, 10 in prod
const RATE_LIMIT_WINDOW_MS = IS_DEVELOPMENT ? 30000 : 60000; // 30sec in dev, 1min in prod

export class WebSocketAuthenticator {
  private jwtSecret: string;
  
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'molochain-websocket-secret-2025';
  }

  /**
   * Validates WebSocket upgrade request authentication
   */
  async validateUpgradeRequest(request: IncomingMessage): Promise<WSAuthResult> {
    try {
      const clientIP = this.getClientIP(request);
      
      // Check rate limiting first
      const rateLimitResult = this.checkRateLimit(clientIP);
      if (!rateLimitResult.success) {
        logger.warn(`WebSocket rate limit exceeded for IP: ${clientIP}`);
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: rateLimitResult.rateLimit
        };
      }

      // Parse URL and extract token
      const parsedUrl = parse(request.url || '', true);
      const token = this.extractToken(request, parsedUrl);
      
      if (!token) {
        logger.info('🔗 WebSocket connection attempt without token', { 
          ip: clientIP,
          pathname: parsedUrl.pathname,
          url: request.url
        });
        
        // Allow anonymous connections for non-sensitive namespaces
        const isPublic = this.isPublicNamespace(parsedUrl.pathname);
        logger.info('🔒 Public namespace authentication check', {
          pathname: parsedUrl.pathname,
          isPublic: isPublic,
          clientIP: clientIP
        });
        
        if (isPublic) {
          logger.info('✅ Allowing anonymous WebSocket connection to public namespace', {
            pathname: parsedUrl.pathname,
            clientIP: clientIP
          });
          return {
            success: true,
            user: undefined // Anonymous user
          };
        }
        
        logger.warn('❌ Rejecting WebSocket connection: authentication token required', {
          pathname: parsedUrl.pathname,
          clientIP: clientIP
        });
        return {
          success: false,
          error: 'Authentication token required'
        };
      }

      // Validate JWT token
      const user = await this.validateToken(token);
      if (!user) {
        logger.warn('Invalid WebSocket authentication token', { ip: clientIP });
        return {
          success: false,
          error: 'Invalid authentication token'
        };
      }

      // Check namespace permissions
      const hasPermission = this.checkNamespacePermission(user, parsedUrl.pathname);
      if (!hasPermission) {
        logger.warn(`WebSocket access denied for user ${user.id} to ${parsedUrl.pathname}`);
        return {
          success: false,
          error: 'Insufficient permissions for this namespace'
        };
      }

      logger.info(`WebSocket authentication successful for user ${user.id}`, { 
        namespace: parsedUrl.pathname,
        ip: clientIP 
      });

      return {
        success: true,
        user,
        rateLimit: rateLimitResult.rateLimit
      };

    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      return {
        success: false,
        error: 'Authentication system error'
      };
    }
  }

  /**
   * Extracts authentication token from request
   */
  private extractToken(request: IncomingMessage, parsedUrl: any): string | null {
    // Check query parameter first
    if (parsedUrl.query?.token) {
      return parsedUrl.query.token as string;
    }

    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = parseCookie(cookieHeader);
      if (cookies.auth_token) {
        return cookies.auth_token;
      }
    }

    return null;
  }

  /**
   * Validates JWT token and returns user information
   */
  private async validateToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Validate token structure
      if (!decoded.id || !decoded.email) {
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || []
      };
    } catch (error) {
      logger.debug('JWT validation failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Checks if namespace allows public access
   */
  private isPublicNamespace(pathname: string | null): boolean {
    const publicNamespaces = [
      '/ws/main',
      '/ws/tracking', // Public tracking namespace
      '/ws/health', // Health monitoring WebSocket
      '/ws/dedicated-health' // Dedicated health WebSocket
    ];
    
    // Handle query parameters in pathname
    const cleanPathname = pathname?.split('?')[0] || '';
    const isPublic = publicNamespaces.includes(cleanPathname);
    
    logger.info(`🔍 Public namespace check: ${pathname} (clean: ${cleanPathname}) -> ${isPublic}`, {
      pathname,
      cleanPathname,
      publicNamespaces,
      result: isPublic
    });
    
    return isPublic;
  }

  /**
   * Checks if user has permission to access namespace
   */
  private checkNamespacePermission(user: AuthenticatedUser, pathname: string | null): boolean {
    if (!pathname) return false;

    const namespacePermissions: Record<string, string[]> = {
      '/ws/main': ['read'],
      '/ws/collaboration': ['collaborate'],
      '/ws/mololink': ['mololink_access'],
      '/ws/notifications': ['receive_notifications'],
      '/ws/tracking': ['track_shipments'],
      '/ws/project-updates': ['view_projects'],
      '/ws/activity-logs': ['admin', 'view_logs'],
      '/ws/commodity-chat': ['trade', 'communicate']
    };

    const requiredPermissions = namespacePermissions[pathname];
    if (!requiredPermissions) {
      return false; // Namespace not configured
    }

    // Admin role has access to everything
    if (user.role === 'admin') {
      return true;
    }

    // Check specific permissions
    return requiredPermissions.some(permission => 
      user.permissions.includes(permission) || permission === 'read'
    );
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(clientIP: string): { success: boolean; rateLimit: { remaining: number; resetTime: Date } } {
    const now = new Date();
    const key = clientIP;

    let attempts = connectionAttempts.get(key);
    
    // Reset if window has passed
    if (!attempts || now > attempts.resetTime) {
      attempts = {
        count: 0,
        resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
      };
      connectionAttempts.set(key, attempts);
    }

    attempts.count++;

    const remaining = Math.max(0, MAX_CONNECTIONS_PER_IP - attempts.count);
    const success = attempts.count <= MAX_CONNECTIONS_PER_IP;

    return {
      success,
      rateLimit: {
        remaining,
        resetTime: attempts.resetTime
      }
    };
  }

  /**
   * Gets client IP address
   */
  private getClientIP(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    const realIP = request.headers['x-real-ip'];
    
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    if (typeof realIP === 'string') {
      return realIP;
    }
    
    return request.socket.remoteAddress || 'unknown';
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimitEntries(): void {
    const now = new Date();
    for (const [key, attempts] of connectionAttempts.entries()) {
      if (now > attempts.resetTime) {
        connectionAttempts.delete(key);
      }
    }
  }
}

// Export singleton instance
export const wsAuthenticator = new WebSocketAuthenticator();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  wsAuthenticator.cleanupRateLimitEntries();
}, 5 * 60 * 1000);