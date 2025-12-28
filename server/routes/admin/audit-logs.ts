import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../../core/auth/auth.service';
import { requirePermission, PERMISSIONS } from '../../middleware/requirePermission';
import {
  getAuditLogs,
  getAuditLogById,
  getRecentActions,
  getActionSummary,
} from '../../services/auditService';
import { logger } from '../../utils/logger';

const router = Router();

router.use(isAuthenticated, isAdmin);

const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.coerce.number().int().positive().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  status: z.enum(['success', 'error']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const summaryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

router.get('/summary', requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const parsed = summaryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.errors });
    }

    const { startDate, endDate } = parsed.data;
    const summary = await getActionSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json(summary);
  } catch (error) {
    logger.error('Error fetching audit summary:', error);
    res.status(500).json({ error: 'Failed to fetch audit summary' });
  }
});

router.get('/user/:userId', requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const logs = await getRecentActions(userId, Math.min(limit, 100));

    res.json({ logs });
  } catch (error) {
    logger.error('Error fetching user audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch user audit logs' });
  }
});

router.get('/:id', requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }

    const log = await getAuditLogById(id);
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    logger.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

router.get('/', requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const parsed = auditLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.errors });
    }

    const { page, limit, userId, action, entityType, status, startDate, endDate } = parsed.data;

    const { logs, total } = await getAuditLogs({
      page,
      limit,
      userId,
      action,
      entityType,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
