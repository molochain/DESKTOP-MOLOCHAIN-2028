/**
 * Notifications API
 * Handles notification management and preferences
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { db } from '../db';
import { broadcastToUsers } from '../core/websocket/handlers/broadcast';

const router = Router();

interface Notification {
  id: string;
  userId: number;
  type: 'security' | 'user' | 'system' | 'compliance' | 'activity';
  category: 'alert' | 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  metadata?: any;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive';
  }>;
}

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: Record<string, boolean>;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    categories: Record<string, boolean>;
  };
  sms: {
    enabled: boolean;
    criticalOnly: boolean;
    phoneNumber?: string;
  };
  priorities: Record<string, string>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

// In-memory storage for demo (should use database in production)
const notifications = new Map<string, Notification>();
const userPreferences = new Map<number, NotificationPreferences>();

// Generate mock notifications
function generateMockNotifications(userId: number): Notification[] {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId,
      type: 'security',
      category: 'alert',
      title: 'Suspicious Login Attempt',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      acknowledged: false,
      priority: 'high',
      source: 'Authentication Service',
      actions: [
        { label: 'Block IP', action: 'block_ip', variant: 'destructive' },
        { label: 'View Details', action: 'view_details' }
      ]
    },
    {
      id: '2',
      userId,
      type: 'compliance',
      category: 'warning',
      title: 'Compliance Report Due',
      message: 'SOC2 compliance report is due in 7 days',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      acknowledged: false,
      priority: 'medium',
      source: 'Compliance Manager'
    },
    {
      id: '3',
      userId,
      type: 'system',
      category: 'info',
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance window: Tonight 2:00 AM - 4:00 AM UTC',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true,
      acknowledged: true,
      priority: 'low',
      source: 'System Administrator'
    },
    {
      id: '4',
      userId,
      type: 'user',
      category: 'success',
      title: 'New Team Member Added',
      message: 'John Doe has been successfully added to the Development team',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
      acknowledged: true,
      priority: 'low',
      source: 'User Management'
    },
    {
      id: '5',
      userId,
      type: 'security',
      category: 'error',
      title: 'Security Policy Violation',
      message: 'User attempted to access restricted resource without proper permissions',
      timestamp: new Date(Date.now() - 10 * 60000),
      read: false,
      acknowledged: false,
      priority: 'critical',
      source: 'Access Control',
      actions: [
        { label: 'Review Logs', action: 'review_logs' },
        { label: 'Revoke Access', action: 'revoke_access', variant: 'destructive' }
      ]
    }
  ];

  return mockNotifications;
}

// Get all notifications for a user
router.get('/notifications', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Generate mock notifications if none exist
    if (notifications.size === 0) {
      const mockNotifs = generateMockNotifications(userId);
      mockNotifs.forEach(n => notifications.set(n.id, n));
    }
    
    // Filter notifications for this user
    const userNotifications = Array.from(notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    res.json(userNotifications);
  } catch (error) {
    logger.error('Failed to get notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const unreadCount = Array.from(notifications.values())
      .filter(n => n.userId === userId && !n.read)
      .length;
    
    res.json(unreadCount);
  } catch (error) {
    logger.error('Failed to get unread count:', error);
    res.status(500).json({ error: 'Failed to retrieve unread count' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    notification.read = true;
    notifications.set(notificationId, notification);
    
    await broadcastToUsers([req.user?.id], 'notification_read', {
      notificationId,
      notification
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to mark as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Acknowledge notification
router.put('/notifications/:notificationId/acknowledge', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    notification.acknowledged = true;
    notification.read = true;
    notifications.set(notificationId, notification);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to acknowledge:', error);
    res.status(500).json({ error: 'Failed to acknowledge notification' });
  }
});

// Delete notification
router.delete('/notifications/:notificationId', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    notifications.delete(notificationId);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Mark all as read
router.put('/notifications/read-all', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    Array.from(notifications.values())
      .filter(n => n.userId === userId)
      .forEach(n => {
        n.read = true;
        notifications.set(n.id, n);
      });
    
    await broadcastToUsers([userId], 'all_notifications_read', {
      userId,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to mark all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Clear all notifications
router.delete('/notifications/clear', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const userNotifs = Array.from(notifications.entries())
      .filter(([_, n]) => n.userId === userId)
      .map(([id]) => id);
    
    userNotifs.forEach(id => notifications.delete(id));
    
    await broadcastToUsers([userId], 'notifications_cleared', {
      userId,
      clearedCount: userNotifs.length,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to clear notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Get notification preferences
router.get('/notifications/preferences', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let preferences = userPreferences.get(userId);
    if (!preferences) {
      // Return default preferences
      preferences = {
        email: {
          enabled: true,
          frequency: 'immediate',
          categories: {
            security: true,
            user: true,
            system: true,
            compliance: true,
            activity: false
          }
        },
        inApp: {
          enabled: true,
          sound: true,
          desktop: false,
          categories: {
            security: true,
            user: true,
            system: true,
            compliance: true,
            activity: true
          }
        },
        sms: {
          enabled: false,
          criticalOnly: true
        },
        priorities: {
          critical: 'all',
          high: 'all',
          medium: 'email',
          low: 'none'
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        }
      };
    }
    
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to get preferences:', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
});

// Update notification preferences
router.put('/notifications/preferences', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const preferences = req.body as NotificationPreferences;
    
    userPreferences.set(userId, preferences);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to update preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Create a new notification (internal use)
export function createNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newNotification: Notification = {
    ...notification,
    id,
    timestamp: new Date()
  };
  
  notifications.set(id, newNotification);
  
  broadcastToUsers([notification.userId], 'new_notification', {
    notification: newNotification
  });
  
  return newNotification;
}

export default router;