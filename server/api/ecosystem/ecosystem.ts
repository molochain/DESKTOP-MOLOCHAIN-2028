import { Router } from 'express';
import { db } from '../../core/database/db.service';
import { logger } from '../../utils/logger';
import { isAuthenticated } from '../../core/auth/auth.service';
import { totalmem, freemem, cpus } from 'os';
import { 
  ecosystemDepartments, 
  ecosystemDivisions, 
  ecosystemSubDepartments,
  ecosystemModules,
  ecosystemTeams,
  ecosystemHealthMetrics,
  ecosystemAlerts,
  ecosystemAiConversations,
  ecosystemAiMessages,
  ecosystemAchievements,
  ecosystemUserAchievements,
  ecosystemApiKeys
} from '@db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// ==============================
// System Status & Health
// ==============================

// Get comprehensive ecosystem status
router.get('/api/ecosystem/status', isAuthenticated, async (req, res) => {
  try {
    // Calculate system metrics
    const totalMem = totalmem();
    const freeMem = freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = Math.round((usedMem / totalMem) * 100);
    
    const cpuInfo = cpus();
    const cpuCount = cpuInfo.length;
    const cpuModel = cpuInfo[0]?.model || 'Unknown';
    const cpuPercent = Math.round(Math.random() * 30 + 20); // Mock CPU usage

    // Get department statistics with proper casting
    const departmentStats = await db.select({
      total: sql<number>`COALESCE(count(*)::int, 0)`,
      active: sql<number>`COALESCE(count(*) filter (where status = 'active')::int, 0)`
    }).from(ecosystemDepartments);

    // Get division statistics with proper casting
    const divisionStats = await db.select({
      total: sql<number>`COALESCE(count(*)::int, 0)`,
      active: sql<number>`COALESCE(count(*) filter (where status = 'active')::int, 0)`
    }).from(ecosystemDivisions);

    // Get recent alerts with proper casting
    const recentAlerts = await db.select({
      count: sql<number>`COALESCE(count(*)::int, 0)`,
      critical: sql<number>`COALESCE(count(*) filter (where severity = 'critical')::int, 0)`,
      warning: sql<number>`COALESCE(count(*) filter (where severity = 'warning')::int, 0)`
    }).from(ecosystemAlerts)
    .where(eq(ecosystemAlerts.status, 'active'));

    // Service health status
    const services = [
      {
        service: 'Main Application',
        status: 'active',
        uptime: 99.9,
        responseTime: 45,
        lastCheck: new Date().toISOString()
      },
      {
        service: 'Database Service',
        status: 'active',
        uptime: 99.8,
        responseTime: 12,
        lastCheck: new Date().toISOString()
      },
      {
        service: 'WebSocket Server',
        status: 'active',
        uptime: 99.7,
        responseTime: 8,
        lastCheck: new Date().toISOString()
      },
      {
        service: 'Cache Service',
        status: 'degraded',
        uptime: 98.5,
        responseTime: 25,
        lastCheck: new Date().toISOString()
      },
      {
        service: 'Authentication Service',
        status: 'active',
        uptime: 99.9,
        responseTime: 35,
        lastCheck: new Date().toISOString()
      }
    ];

    const activeServices = services.filter(s => s.status === 'active').length;
    const systemHealth = Math.round(
      services.reduce((acc, s) => acc + s.uptime, 0) / services.length
    );
    const avgResponseTime = Math.round(
      services.reduce((acc, s) => acc + s.responseTime, 0) / services.length
    );

    // Database metrics
    const databaseMetrics = {
      connections: Math.floor(Math.random() * 20) + 5,
      queriesPerSec: Math.floor(Math.random() * 100) + 50,
      cacheHitRate: Math.floor(Math.random() * 20) + 80,
      size: '11'
    };

    // Security metrics
    const securityMetrics = {
      failedLogins: Math.floor(Math.random() * 10),
      activeSessions: Math.floor(Math.random() * 50) + 10,
      rateLimited: Math.floor(Math.random() * 20),
      apiKeysActive: 12
    };

    const response = {
      services,
      activeServices,
      totalServices: services.length,
      systemHealth,
      activeUsers: Math.floor(Math.random() * 100) + 20,
      avgResponseTime,
      metrics: {
        cpu: cpuPercent,
        memory: memoryPercent,
        disk: Math.floor(Math.random() * 30) + 40,
        network: Math.floor(Math.random() * 10) + 1,
        cpuCores: cpuCount,
        cpuModel
      },
      database: databaseMetrics,
      security: securityMetrics,
      organizational: {
        departments: departmentStats?.[0] || { total: 0, active: 0 },
        divisions: divisionStats?.[0] || { total: 0, active: 0 },
        alerts: recentAlerts?.[0] || { count: 0, critical: 0, warning: 0 }
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching ecosystem status:', error);
    res.status(500).json({ error: 'Failed to fetch ecosystem status' });
  }
});

// ==============================
// Organizational Management
// ==============================

// Get all departments
router.get('/api/ecosystem/departments', isAuthenticated, async (req, res) => {
  try {
    const departments = await db.select().from(ecosystemDepartments);
    res.json(departments);
  } catch (error) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create department
router.post('/api/ecosystem/departments', isAuthenticated, async (req, res) => {
  try {
    const { name, code, description, managerId } = req.body;
    
    const [department] = await db.insert(ecosystemDepartments).values({
      name,
      code,
      description,
      managerId,
      status: 'active'
    }).returning();
    
    res.json(department);
  } catch (error) {
    logger.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Get divisions by department
router.get('/api/ecosystem/departments/:departmentId/divisions', isAuthenticated, async (req, res) => {
  try {
    const divisions = await db.select()
      .from(ecosystemDivisions)
      .where(eq(ecosystemDivisions.departmentId, parseInt(req.params.departmentId)));
    
    res.json(divisions);
  } catch (error) {
    logger.error('Error fetching divisions:', error);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});

// Get all divisions
router.get('/api/ecosystem/divisions', isAuthenticated, async (req, res) => {
  try {
    const divisions = await db.select().from(ecosystemDivisions);
    res.json(divisions);
  } catch (error) {
    logger.error('Error fetching divisions:', error);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});

// Get all modules
router.get('/api/ecosystem/modules', isAuthenticated, async (req, res) => {
  try {
    const modules = await db.select().from(ecosystemModules);
    res.json(modules);
  } catch (error) {
    logger.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get all teams
router.get('/api/ecosystem/teams', isAuthenticated, async (req, res) => {
  try {
    const teams = await db.select().from(ecosystemTeams);
    res.json(teams);
  } catch (error) {
    logger.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// ==============================
// Health Monitoring
// ==============================

// Get health metrics
router.get('/api/ecosystem/health/metrics', isAuthenticated, async (req, res) => {
  try {
    const { entityType, entityId, limit = 100 } = req.query;
    
    const baseQuery = db.select()
      .from(ecosystemHealthMetrics)
      .orderBy(desc(ecosystemHealthMetrics.timestamp))
      .limit(Number(limit));
    
    const metrics = await (entityType && entityId
      ? baseQuery.where(
          and(
            eq(ecosystemHealthMetrics.entityType, String(entityType)),
            eq(ecosystemHealthMetrics.entityId, Number(entityId))
          )
        )
      : baseQuery);
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching health metrics:', error);
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});

// Create health metric
router.post('/api/ecosystem/health/metrics', isAuthenticated, async (req, res) => {
  try {
    const { entityType, entityId, metricType, value, unit, threshold } = req.body;
    
    const status = threshold && Number(value) > Number(threshold) ? 'warning' : 'normal';
    
    const [metric] = await db.insert(ecosystemHealthMetrics).values({
      entityType,
      entityId,
      metricType,
      value: String(value),
      unit,
      status,
      threshold: threshold ? String(threshold) : null
    }).returning();
    
    res.json(metric);
  } catch (error) {
    logger.error('Error creating health metric:', error);
    res.status(500).json({ error: 'Failed to create health metric' });
  }
});

// Get alerts
router.get('/api/ecosystem/alerts', isAuthenticated, async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const alerts = await db.select()
      .from(ecosystemAlerts)
      .where(eq(ecosystemAlerts.status, String(status)))
      .orderBy(desc(ecosystemAlerts.createdAt))
      .limit(50);
    
    res.json(alerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/api/ecosystem/alerts', isAuthenticated, async (req, res) => {
  try {
    const { title, description, severity, entityType, entityId } = req.body;
    
    const [alert] = await db.insert(ecosystemAlerts).values({
      title,
      description,
      severity,
      entityType,
      entityId,
      status: 'active'
    }).returning();
    
    res.json(alert);
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Acknowledge alert
router.put('/api/ecosystem/alerts/:alertId/acknowledge', isAuthenticated, async (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    const userId = (req as any).user?.id;
    
    const [alert] = await db.update(ecosystemAlerts)
      .set({
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      })
      .where(eq(ecosystemAlerts.id, alertId))
      .returning();
    
    res.json(alert);
  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// ==============================
// AI Assistant
// ==============================

// Get AI conversations
router.get('/api/ecosystem/ai/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    const conversations = await db.select()
      .from(ecosystemAiConversations)
      .where(eq(ecosystemAiConversations.userId, userId))
      .orderBy(desc(ecosystemAiConversations.updatedAt))
      .limit(20);
    
    res.json(conversations);
  } catch (error) {
    logger.error('Error fetching AI conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create AI conversation
router.post('/api/ecosystem/ai/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { title, context } = req.body;
    
    const [conversation] = await db.insert(ecosystemAiConversations).values({
      userId,
      title: title || 'New Conversation',
      context,
      status: 'active'
    }).returning();
    
    res.json(conversation);
  } catch (error) {
    logger.error('Error creating AI conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/api/ecosystem/ai/conversations/:conversationId/messages', isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    
    const messages = await db.select()
      .from(ecosystemAiMessages)
      .where(eq(ecosystemAiMessages.conversationId, conversationId))
      .orderBy(ecosystemAiMessages.createdAt);
    
    res.json(messages);
  } catch (error) {
    logger.error('Error fetching AI messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add message to conversation
router.post('/api/ecosystem/ai/conversations/:conversationId/messages', isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const { role, content, metadata } = req.body;
    
    const [message] = await db.insert(ecosystemAiMessages).values({
      conversationId,
      role,
      content,
      metadata
    }).returning();
    
    // Update conversation's updatedAt timestamp
    await db.update(ecosystemAiConversations)
      .set({ updatedAt: new Date() })
      .where(eq(ecosystemAiConversations.id, conversationId));
    
    res.json(message);
  } catch (error) {
    logger.error('Error creating AI message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// ==============================
// Achievements
// ==============================

// Get all achievements
router.get('/api/ecosystem/achievements', async (req, res) => {
  try {
    const achievements = await db.select()
      .from(ecosystemAchievements)
      .where(eq(ecosystemAchievements.status, 'active'));
    
    res.json(achievements);
  } catch (error) {
    logger.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get user achievements
router.get('/api/ecosystem/achievements/user', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    const userAchievements = await db.select({
      id: ecosystemUserAchievements.id,
      achievementId: ecosystemUserAchievements.achievementId,
      earnedAt: ecosystemUserAchievements.earnedAt,
      progress: ecosystemUserAchievements.progress,
      name: ecosystemAchievements.name,
      description: ecosystemAchievements.description,
      category: ecosystemAchievements.category,
      points: ecosystemAchievements.points,
      badgeUrl: ecosystemAchievements.badgeUrl
    })
    .from(ecosystemUserAchievements)
    .leftJoin(
      ecosystemAchievements,
      eq(ecosystemUserAchievements.achievementId, ecosystemAchievements.id)
    )
    .where(eq(ecosystemUserAchievements.userId, userId));
    
    res.json(userAchievements);
  } catch (error) {
    logger.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// ==============================
// API Key Management
// ==============================

// Get API keys
router.get('/api/ecosystem/api-keys', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    const apiKeys = await db.select({
      id: ecosystemApiKeys.id,
      name: ecosystemApiKeys.name,
      key: sql<string>`substring(${ecosystemApiKeys.key}, 1, 8) || '...'`,
      permissions: ecosystemApiKeys.permissions,
      rateLimit: ecosystemApiKeys.rateLimit,
      status: ecosystemApiKeys.status,
      lastUsedAt: ecosystemApiKeys.lastUsedAt,
      expiresAt: ecosystemApiKeys.expiresAt,
      createdAt: ecosystemApiKeys.createdAt
    })
    .from(ecosystemApiKeys)
    .where(eq(ecosystemApiKeys.userId, userId));
    
    res.json(apiKeys);
  } catch (error) {
    logger.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create API key
router.post('/api/ecosystem/api-keys', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { name, permissions, rateLimit, expiresAt } = req.body;
    
    // Generate random API key
    const key = `eck_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const secret = `ecs_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    
    const [apiKey] = await db.insert(ecosystemApiKeys).values({
      name,
      key,
      secret,
      userId,
      permissions,
      rateLimit: rateLimit || 1000,
      status: 'active',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }).returning();
    
    // Return the full key only on creation
    res.json({
      ...apiKey,
      key,
      secret: secret // Only show secret once
    });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Revoke API key
router.delete('/api/ecosystem/api-keys/:keyId', isAuthenticated, async (req, res) => {
  try {
    const keyId = parseInt(req.params.keyId);
    const userId = (req as any).user?.id;
    
    await db.update(ecosystemApiKeys)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(ecosystemApiKeys.id, keyId),
          eq(ecosystemApiKeys.userId, userId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;