import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { validateRequest } from '../middleware/validate';
import { isAuthenticated } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

// Profile update schema
const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

// Password change schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
});

// Get current user profile
router.get('/profile', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userProfile = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      company: users.company,
      phone: users.phone,
      role: users.role,
      permissions: users.permissions,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    logger.info(`Profile fetched for user ${userId}`);
    res.json(userProfile[0]);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', 
  isAuthenticated,
  validateRequest({ body: updateProfileSchema }),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates = req.body;
      
      // Check if email is being updated and if it's already taken
      if (updates.email) {
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, updates.email))
          .limit(1);
        
        if (existingUser.length && existingUser[0].id !== userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Update the profile
      const updatedProfile = await db.update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          company: users.company,
          phone: users.phone,
          role: users.role,
          permissions: users.permissions,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          twoFactorEnabled: users.twoFactorEnabled,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      if (!updatedProfile.length) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      logger.info(`Profile updated for user ${userId}`);
      res.json({ 
        message: 'Profile updated successfully', 
        profile: updatedProfile[0] 
      });
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Change password
router.post('/profile/change-password',
  isAuthenticated,
  validateRequest({ body: changePasswordSchema }),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const currentUser = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!currentUser.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, currentUser[0].password);
      if (isSamePassword) {
        return res.status(400).json({ error: 'New password must be different from current password' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      logger.info(`Password changed for user ${userId}`);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// Get user activity logs
router.get('/profile/activity', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For now, return mock activity data
    // In a real implementation, this would query from activity logs table
    const activities = [
      { 
        id: 1, 
        action: 'login', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
        ipAddress: '192.168.1.1',
        details: 'Successful login'
      },
      { 
        id: 2, 
        action: 'profile_update', 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), 
        ipAddress: '192.168.1.1',
        details: 'Updated profile information'
      },
      { 
        id: 3, 
        action: 'password_change', 
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        ipAddress: '192.168.1.1',
        details: 'Changed password'
      },
    ];

    res.json(activities);
  } catch (error) {
    logger.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Delete account (soft delete)
router.delete('/profile', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Soft delete by deactivating the account
    await db.update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    logger.info(`Account deactivated for user ${userId}`);
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    logger.error('Error deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

export default router;