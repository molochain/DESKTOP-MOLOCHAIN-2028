import { Router } from 'express';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../../core/database/db.service';
import { users, auditLogs } from '@db/schema';
import { hashPassword, verifyPassword } from '../../core/auth/auth.service';
import { logger } from '../../utils/logger';
import { isAuthenticated, isAdmin } from '../../core/auth/auth.service';
import { requirePermission, PERMISSIONS } from '../../middleware/requirePermission';

const router = Router();

router.get('/', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_VIEW), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      twoFactorEnabled: users.twoFactorEnabled
    }).from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(users);

    res.json(allUsers);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/stats', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_VIEW), async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [adminUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'admin'));
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentLogins] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.isActive, true),
      ));

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      adminUsers: adminUsers.count,
      recentLogins: recentLogins.count
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

router.post('/', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res) => {
  try {
    const { username, email, password, role, permissions } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      permissions: permissions || ['read'],
      isActive: true
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      isActive: users.isActive,
      createdAt: users.createdAt
    });

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'create',
      resourceType: 'user',
      resourceId: newUser.id.toString(),
      details: { 
        message: `Created user ${username} with role ${role}`,
        targetUser: username,
        targetRole: role
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} created user ${username}`);

    res.status(201).json({
      user: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, role, permissions, isActive } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existingUser.role === 'admin' && (role !== 'admin' || !isActive)) {
      const [adminCount] = await db.select({ count: count() }).from(users).where(
        and(eq(users.role, 'admin'), eq(users.isActive, true))
      );
      
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot disable or demote the last admin user' });
      }
    }

    if (username && username !== existingUser.username) {
      const [usernameConflict] = await db.select().from(users)
        .where(and(eq(users.username, username), eq(users.id, userId)))
        .limit(1);
      if (usernameConflict) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    if (email && email !== existingUser.email) {
      const [emailConflict] = await db.select().from(users)
        .where(and(eq(users.email, email), eq(users.id, userId)))
        .limit(1);
      if (emailConflict) {
        return res.status(409).json({ error: 'Email already taken' });
      }
    }

    const [updatedUser] = await db.update(users)
      .set({
        username: username || existingUser.username,
        email: email || existingUser.email,
        role: role || existingUser.role,
        permissions: permissions || existingUser.permissions,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
        updatedAt: users.updatedAt
      });

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'update',
      resourceType: 'user',
      resourceId: userId.toString(),
      details: { 
        message: `Updated user ${existingUser.username}`,
        changes: {
          username: username !== existingUser.username ? { from: existingUser.username, to: username } : undefined,
          email: email !== existingUser.email ? { from: existingUser.email, to: email } : undefined,
          role: role !== existingUser.role ? { from: existingUser.role, to: role } : undefined,
          isActive: isActive !== existingUser.isActive ? { from: existingUser.isActive, to: isActive } : undefined
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} updated user ${existingUser.username}`);

    res.json({
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_DELETE), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existingUser.role === 'admin') {
      const [adminCount] = await db.select({ count: count() }).from(users).where(
        and(eq(users.role, 'admin'), eq(users.isActive, true))
      );
      
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await db.update(users)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'delete',
      resourceType: 'user',
      resourceId: userId.toString(),
      details: { 
        message: `Deactivated user ${existingUser.username}`,
        targetUser: existingUser.username
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} deactivated user ${existingUser.username}`);

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/:id', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_VIEW), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      twoFactorEnabled: users.twoFactorEnabled
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/:id/reset-password', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'update',
      resourceType: 'user_password',
      resourceId: userId.toString(),
      details: { 
        message: `Reset password for user ${existingUser.username}`,
        targetUser: existingUser.username
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} reset password for user ${existingUser.username}`);

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
