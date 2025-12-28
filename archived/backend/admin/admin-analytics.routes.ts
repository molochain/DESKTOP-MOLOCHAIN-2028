import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const router = Router();

router.get('/analytics/dashboard', async (req: Request, res: Response) => {
  try {
    const usersStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
        COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '24 hours') as active_today
      FROM users
    `);

    const servicesStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_services,
        COUNT(*) FILTER (WHERE is_active = true) as active_services
      FROM services
    `);

    const projectsStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'active') as active_projects,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_projects_30d
      FROM projects
    `);

    const inquiriesStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_inquiries,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_inquiries,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_inquiries_7d
      FROM service_inquiries
    `);

    const activityStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as actions_today,
        COUNT(DISTINCT admin_id) as active_admins
      FROM admin_activity_logs
    `);

    res.json({
      users: usersStats.rows[0],
      services: servicesStats.rows[0],
      projects: projectsStats.rows[0],
      inquiries: inquiriesStats.rows[0],
      activity: activityStats.rows[0],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/analytics/users/growth', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const result = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({ data: result.rows, days });
  } catch (error) {
    logger.error('Failed to fetch user growth:', error);
    res.status(500).json({ error: 'Failed to fetch user growth' });
  }
});

router.get('/analytics/activity/timeline', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;

    const result = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        action_type,
        COUNT(*) as count
      FROM admin_activity_logs
      WHERE created_at >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at), action_type
      ORDER BY date, count DESC
    `);

    res.json({ data: result.rows, days });
  } catch (error) {
    logger.error('Failed to fetch activity timeline:', error);
    res.status(500).json({ error: 'Failed to fetch activity timeline' });
  }
});

router.get('/analytics/services/popular', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.popularity,
        COUNT(si.id) as inquiry_count
      FROM services s
      LEFT JOIN service_inquiries si ON s.id = si.service_id
      WHERE s.is_active = true
      GROUP BY s.id, s.title, s.category, s.popularity
      ORDER BY inquiry_count DESC, s.popularity DESC
      LIMIT 10
    `);

    res.json({ data: result.rows });
  } catch (error) {
    logger.error('Failed to fetch popular services:', error);
    res.status(500).json({ error: 'Failed to fetch popular services' });
  }
});

router.get('/analytics/users/roles', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        role,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    res.json({ data: result.rows });
  } catch (error) {
    logger.error('Failed to fetch user roles:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

router.post('/analytics/record', async (req: Request, res: Response) => {
  try {
    const { metricType, metricName, value, metadata } = req.body;

    await db.execute(sql`
      INSERT INTO analytics_summary (date, metric_type, metric_name, value, metadata, created_at)
      VALUES (NOW(), ${metricType}, ${metricName}, ${value}, ${JSON.stringify(metadata || {})}::jsonb, NOW())
    `);

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to record analytics:', error);
    res.status(500).json({ error: 'Failed to record analytics' });
  }
});

export default router;
