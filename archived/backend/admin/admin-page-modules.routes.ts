import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { pageModules, moduleDependencies, moduleSettings } from '@shared/schema';
import { eq, and, sql, asc, desc } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { logAdminActivity } from './admin-activity.routes';

const router = Router();

router.get('/page-modules', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const type = req.query.type as string;
    const activeOnly = req.query.activeOnly === 'true';

    let query = db.select().from(pageModules);
    
    const conditions = [];
    if (category) conditions.push(eq(pageModules.category, category));
    if (type) conditions.push(eq(pageModules.type, type));
    if (activeOnly) conditions.push(eq(pageModules.isActive, true));

    const result = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(asc(pageModules.order))
      : await query.orderBy(asc(pageModules.order));

    res.json({ data: result, count: result.length });
  } catch (error) {
    logger.error('Failed to fetch page modules:', error);
    res.status(500).json({ error: 'Failed to fetch page modules' });
  }
});

router.get('/page-modules/tree', async (req: Request, res: Response) => {
  try {
    const allModules = await db.select().from(pageModules).orderBy(asc(pageModules.order));
    
    const buildTree = (modules: any[], parentId: number | null = null): any[] => {
      return modules
        .filter(m => m.parentId === parentId)
        .map(m => ({
          ...m,
          children: buildTree(modules, m.id)
        }));
    };
    
    const tree = buildTree(allModules);
    res.json(tree);
  } catch (error) {
    logger.error('Failed to fetch page modules tree:', error);
    res.status(500).json({ error: 'Failed to fetch page modules tree' });
  }
});

router.get('/page-modules/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await db.select().from(pageModules).where(eq(pageModules.id, id));
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Page module not found' });
    }

    const dependencies = await db.select().from(moduleDependencies)
      .where(eq(moduleDependencies.moduleId, id));
    
    const settings = await db.select().from(moduleSettings)
      .where(eq(moduleSettings.moduleId, id));

    res.json({ 
      data: result[0],
      dependencies,
      settings
    });
  } catch (error) {
    logger.error('Failed to fetch page module:', error);
    res.status(500).json({ error: 'Failed to fetch page module' });
  }
});

router.post('/page-modules', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const moduleData = req.body;

    const result = await db.insert(pageModules).values({
      name: moduleData.name,
      displayName: moduleData.displayName,
      type: moduleData.type,
      category: moduleData.category,
      path: moduleData.path,
      componentPath: moduleData.componentPath,
      description: moduleData.description,
      icon: moduleData.icon,
      parentId: moduleData.parentId,
      order: moduleData.order || 0,
      isActive: moduleData.isActive ?? true,
      isVisible: moduleData.isVisible ?? true,
      requiresAuth: moduleData.requiresAuth ?? false,
      requiredRole: moduleData.requiredRole,
      metadata: moduleData.metadata,
      config: moduleData.config,
      analytics: moduleData.analytics
    }).returning();

    await logAdminActivity(userId, 'create_module', 'page_module', result[0].id, { name: moduleData.name });

    res.status(201).json({ data: result[0] });
  } catch (error) {
    logger.error('Failed to create page module:', error);
    res.status(500).json({ error: 'Failed to create page module' });
  }
});

router.put('/page-modules/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const moduleData = req.body;

    const result = await db.update(pageModules)
      .set({
        ...moduleData,
        updatedAt: new Date()
      })
      .where(eq(pageModules.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page module not found' });
    }

    await logAdminActivity(userId, 'update_module', 'page_module', id, { changes: moduleData });

    res.json({ data: result[0] });
  } catch (error) {
    logger.error('Failed to update page module:', error);
    res.status(500).json({ error: 'Failed to update page module' });
  }
});

router.patch('/page-modules/:id/toggle', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const { isActive } = req.body;

    const result = await db.update(pageModules)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(pageModules.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page module not found' });
    }

    await logAdminActivity(userId, isActive ? 'enable_module' : 'disable_module', 'page_module', id, {});

    res.json({ data: result[0] });
  } catch (error) {
    logger.error('Failed to toggle page module:', error);
    res.status(500).json({ error: 'Failed to toggle page module' });
  }
});

router.delete('/page-modules/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;

    await db.delete(moduleSettings).where(eq(moduleSettings.moduleId, id));
    await db.delete(moduleDependencies).where(eq(moduleDependencies.moduleId, id));
    
    const result = await db.delete(pageModules).where(eq(pageModules.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page module not found' });
    }

    await logAdminActivity(userId, 'delete_module', 'page_module', id, { name: result[0].name });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete page module:', error);
    res.status(500).json({ error: 'Failed to delete page module' });
  }
});

router.post('/page-modules/:id/settings', async (req: Request, res: Response) => {
  try {
    const moduleId = parseInt(req.params.id);
    const { settingKey, settingValue, settingType, description, isPublic } = req.body;

    const existing = await db.select().from(moduleSettings)
      .where(and(eq(moduleSettings.moduleId, moduleId), eq(moduleSettings.settingKey, settingKey)));

    if (existing.length > 0) {
      const result = await db.update(moduleSettings)
        .set({ settingValue, settingType, description, isPublic, updatedAt: new Date() })
        .where(eq(moduleSettings.id, existing[0].id))
        .returning();
      return res.json({ data: result[0] });
    }

    const result = await db.insert(moduleSettings).values({
      moduleId,
      settingKey,
      settingValue,
      settingType: settingType || 'string',
      description,
      isPublic: isPublic ?? false
    }).returning();

    res.status(201).json({ data: result[0] });
  } catch (error) {
    logger.error('Failed to save module setting:', error);
    res.status(500).json({ error: 'Failed to save module setting' });
  }
});

router.get('/page-modules/stats/summary', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(*) FILTER (WHERE is_active = true) as active_modules,
        COUNT(*) FILTER (WHERE type = 'page') as pages,
        COUNT(*) FILTER (WHERE type = 'module') as modules,
        COUNT(*) FILTER (WHERE requires_auth = true) as protected_routes,
        COUNT(DISTINCT category) as categories
      FROM page_modules
    `);

    res.json({ data: result.rows[0] });
  } catch (error) {
    logger.error('Failed to fetch module stats:', error);
    res.status(500).json({ error: 'Failed to fetch module stats' });
  }
});

export default router;
