import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const router = Router();

interface ActivityLog {
  id: number;
  admin_id: number;
  action_type: string;
  target_type: string;
  target_id: number | null;
  changes: any;
  status: string;
  created_at: Date;
}

export async function logAdminActivity(
  adminId: number,
  actionType: string,
  targetType: string,
  targetId: number | string | null,
  changes: any = null,
  status: string = 'success'
) {
  try {
    await db.execute(sql`
      INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, changes, status, created_at)
      VALUES (${adminId}, ${actionType}, ${targetType}, ${targetId ? parseInt(String(targetId)) : null}, ${JSON.stringify(changes)}::json, ${status}, NOW())
    `);
  } catch (error) {
    logger.error('Failed to log admin activity:', error);
  }
}

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const actionType = req.query.actionType as string;
    const targetType = req.query.targetType as string;

    let query = sql`
      SELECT 
        a.*,
        u.username as admin_username,
        u.email as admin_email
      FROM admin_activity_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      WHERE 1=1
    `;

    if (actionType) {
      query = sql`${query} AND a.action_type = ${actionType}`;
    }
    if (targetType) {
      query = sql`${query} AND a.target_type = ${targetType}`;
    }

    query = sql`${query} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.execute(query);
    
    const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM admin_activity_logs`);
    const total = parseInt((countResult.rows[0] as any)?.total || '0');

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to fetch admin activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

router.get('/activity/stats', async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT admin_id) as active_admins,
        COUNT(*) FILTER (WHERE created_at >= ${todayStart}) as today_actions,
        COUNT(*) FILTER (WHERE status = 'success') as successful_actions,
        COUNT(*) FILTER (WHERE status = 'error') as failed_actions
      FROM admin_activity_logs
    `);

    const recentActions = await db.execute(sql`
      SELECT action_type, COUNT(*) as count
      FROM admin_activity_logs
      WHERE created_at >= ${todayStart}
      GROUP BY action_type
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      stats: stats.rows[0],
      recentActionTypes: recentActions.rows
    });
  } catch (error) {
    logger.error('Failed to fetch activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

router.get('/activity/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await db.execute(sql`
      SELECT 
        a.*,
        u.username as admin_username
      FROM admin_activity_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `);

    res.json({ data: result.rows });
  } catch (error) {
    logger.error('Failed to fetch recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

export default router;
