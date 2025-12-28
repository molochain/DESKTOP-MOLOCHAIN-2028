import { Router, Request, Response } from 'express';
import { emailMonitoringService } from '../../services/email-monitoring.service';
import { db } from '../../db';
import { emailLogs } from '../../../shared/schema';
import { desc, eq, and, sql, gte } from 'drizzle-orm';

const router = Router();

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;
    const formType = req.query.formType as string | undefined;
    const subdomain = req.query.subdomain as string | undefined;

    const conditions = [];
    
    if (status) {
      conditions.push(eq(emailLogs.status, status));
    }
    if (formType) {
      conditions.push(eq(emailLogs.formType, formType));
    }
    if (subdomain) {
      conditions.push(eq(emailLogs.subdomain, subdomain));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, countResult] = await Promise.all([
      db
        .select()
        .from(emailLogs)
        .where(whereClause)
        .orderBy(desc(emailLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(emailLogs)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + logs.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch email logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email logs',
    });
  }
});

router.get('/logs/summary', async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [statusCounts, recentFailures] = await Promise.all([
      db
        .select({
          status: emailLogs.status,
          count: sql<number>`count(*)`,
        })
        .from(emailLogs)
        .where(gte(emailLogs.createdAt, thirtyDaysAgo))
        .groupBy(emailLogs.status),
      db
        .select()
        .from(emailLogs)
        .where(and(
          eq(emailLogs.status, 'failed'),
          gte(emailLogs.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(emailLogs.createdAt))
        .limit(10),
    ]);

    const summary = {
      sent: 0,
      failed: 0,
      pending: 0,
    };

    statusCounts.forEach((row) => {
      if (row.status === 'sent') summary.sent = Number(row.count);
      else if (row.status === 'failed') summary.failed = Number(row.count);
      else if (row.status === 'pending') summary.pending = Number(row.count);
    });

    res.json({
      success: true,
      data: {
        summary,
        recentFailures,
        note: 'Consider implementing a cleanup job to remove logs older than 30 days',
      },
    });
  } catch (error) {
    console.error('Failed to fetch email logs summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email logs summary',
    });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = emailMonitoringService.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email stats',
    });
  }
});

router.get('/stats/detailed', (req: Request, res: Response) => {
  try {
    const stats = emailMonitoringService.getDetailedStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed email stats',
    });
  }
});

router.post('/stats/reset', (req: Request, res: Response) => {
  try {
    emailMonitoringService.resetStats();
    
    res.json({
      success: true,
      message: 'Email monitoring stats reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset email stats',
    });
  }
});

export default router;
