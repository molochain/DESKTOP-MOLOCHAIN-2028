import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { logAdminActivity } from './admin-activity.routes';

const router = Router();

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;

    let query = sql`SELECT * FROM admin_settings`;
    if (category) {
      query = sql`SELECT * FROM admin_settings WHERE category = ${category}`;
    }
    query = sql`${query} ORDER BY category, key`;

    const result = await db.execute(query);

    const grouped = (result.rows as any[]).reduce((acc, row) => {
      if (!acc[row.category]) {
        acc[row.category] = {};
      }
      acc[row.category][row.key] = {
        value: row.value,
        type: row.type,
        description: row.description,
        isPublic: row.is_public,
        updatedAt: row.updated_at
      };
      return acc;
    }, {} as Record<string, Record<string, any>>);

    res.json({ data: grouped, raw: result.rows });
  } catch (error) {
    logger.error('Failed to fetch admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/settings/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const result = await db.execute(sql`
      SELECT * FROM admin_settings 
      WHERE category = ${category}
      ORDER BY key
    `);

    const settings = (result.rows as any[]).reduce((acc, row) => {
      acc[row.key] = {
        value: row.value,
        type: row.type,
        description: row.description
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({ data: settings, raw: result.rows });
  } catch (error) {
    logger.error('Failed to fetch category settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings/:category/:key', async (req: Request, res: Response) => {
  try {
    const { category, key } = req.params;
    const { value, type, description, isPublic } = req.body;
    const userId = (req as any).user?.id || 1;

    const existing = await db.execute(sql`
      SELECT id FROM admin_settings WHERE category = ${category} AND key = ${key}
    `);

    if (existing.rows.length > 0) {
      await db.execute(sql`
        UPDATE admin_settings 
        SET value = ${JSON.stringify(value)}::jsonb,
            type = COALESCE(${type}, type),
            description = COALESCE(${description}, description),
            is_public = COALESCE(${isPublic}, is_public),
            updated_by = ${userId},
            updated_at = NOW()
        WHERE category = ${category} AND key = ${key}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO admin_settings (category, key, value, type, description, is_public, updated_by, created_at, updated_at)
        VALUES (${category}, ${key}, ${JSON.stringify(value)}::jsonb, ${type || 'string'}, ${description}, ${isPublic || false}, ${userId}, NOW(), NOW())
      `);
    }

    await logAdminActivity(userId, 'update_setting', 'setting', null, { category, key, value });

    res.json({ success: true, category, key, value });
  } catch (error) {
    logger.error('Failed to update setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

router.post('/settings/bulk', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    const userId = (req as any).user?.id || 1;

    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings as Record<string, any>)) {
        const existing = await db.execute(sql`
          SELECT id FROM admin_settings WHERE category = ${category} AND key = ${key}
        `);

        if (existing.rows.length > 0) {
          await db.execute(sql`
            UPDATE admin_settings 
            SET value = ${JSON.stringify(value)}::jsonb,
                updated_by = ${userId},
                updated_at = NOW()
            WHERE category = ${category} AND key = ${key}
          `);
        } else {
          await db.execute(sql`
            INSERT INTO admin_settings (category, key, value, updated_by, created_at, updated_at)
            VALUES (${category}, ${key}, ${JSON.stringify(value)}::jsonb, ${userId}, NOW(), NOW())
          `);
        }
      }
    }

    await logAdminActivity(userId, 'bulk_update_settings', 'settings', null, { count: Object.keys(settings).length });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to bulk update settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.delete('/settings/:category/:key', async (req: Request, res: Response) => {
  try {
    const { category, key } = req.params;
    const userId = (req as any).user?.id || 1;

    await db.execute(sql`
      DELETE FROM admin_settings WHERE category = ${category} AND key = ${key}
    `);

    await logAdminActivity(userId, 'delete_setting', 'setting', null, { category, key });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;
