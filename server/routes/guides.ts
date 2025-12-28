import { Router } from 'express';
import { db } from '../db';
import { guides, guideCategories, guideDocuments, userGuideProgress, guideSearchIndex } from '@db/schema';
import { eq, like, sql, and, or, ilike, inArray } from 'drizzle-orm';
import { isAuthenticated, User } from '../core/auth/auth.service';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Get all guides (default route)
router.get('/', async (req, res) => {
  try {
    const allGuides = await db
      .select()
      .from(guides)
      .where(eq(guides.isActive, true))
      .orderBy(guides.sortOrder);
    
    res.json(allGuides || []);
  } catch (error) {
    logger.error('Database error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get all guide categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(guideCategories)
      .where(eq(guideCategories.isActive, true))
      .orderBy(guideCategories.sortOrder);
    
    // Log warning if database returns empty (indicates missing seed data)
    if (!categories || categories.length === 0) {
      logger.warn('Guide categories table is empty - database may need seeding');
    }
    
    res.json(categories || []);
  } catch (error) {
    logger.error('Database error fetching guide categories:', error);
    res.status(500).json({ error: 'Failed to fetch guide categories' });
  }
});

// Get guides by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    const categoryGuides = await db
      .select()
      .from(guides)
      .where(
        and(
          eq(guides.categoryId, categoryId),
          eq(guides.isActive, true)
        )
      )
      .orderBy(guides.sortOrder);
    
    res.json(categoryGuides);
  } catch (error) {
    logger.error('Error fetching guides by category:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Search guides
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchQuery = `%${q}%`;
    
    let conditions = [
      eq(guides.isActive, true),
      or(
        ilike(guides.title, searchQuery),
        ilike(guides.description, searchQuery),
        ilike(guides.code, searchQuery)
      )
    ];
    
    if (category) {
      conditions.push(eq(guides.categoryId, parseInt(category as string)));
    }
    
    const searchResults = await db
      .select()
      .from(guides)
      .where(and(...conditions))
      .limit(parseInt(limit as string));
    
    res.json(searchResults);
  } catch (error) {
    logger.error('Error searching guides:', error);
    res.status(500).json({ error: 'Failed to search guides' });
  }
});

// Get all guides
router.get('/all', async (req, res) => {
  try {
    const allGuides = await db
      .select()
      .from(guides)
      .where(eq(guides.isActive, true))
      .orderBy(guides.sortOrder);
    
    res.json(allGuides);
  } catch (error) {
    logger.error('Error fetching all guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get guides by context
router.get('/context/:contextName', async (req, res) => {
  try {
    const contextName = req.params.contextName;
    
    // Map context names to guide codes (matching the client-side mapping)
    const contextToGuideCodes: Record<string, string[]> = {
      'main_dashboard': ['OPR-REPORTS', 'OPR-ANALYSES', 'OPR-TRACKING'],
      'projects': ['BUS-PROJECTS', 'OPR-WORKFLOWS', 'OPR-TASKS'],
      'services': ['BUS-SERVICES', 'OPR-LOGISTICS', 'BUS-STRATEGIES'],
      'tracking': ['OPR-TRACKING', 'OPR-LOGISTICS', 'GEO-GLOBAL'],
      'accounting': ['BUS-FINANCE', 'BUS-PAYMENT', 'OPR-REPORTS'],
      'hr': ['ORG-ROLES', 'ORG-ID-PASSPORT', 'ORG-POLICIES'],
      'operations': ['OPR-LOGISTICS', 'OPR-WORKFLOWS', 'OPR-TRACKING'],
      'supply_chain': ['OPR-SUPPLY-CHAIN', 'OPR-TRACKING', 'BUS-TRADE'],
      'technology': ['OPR-BUILDS', 'OPR-INFORMATION', 'OPR-PROTOCOL'],
      'marketing': ['BUS-MARKETING', 'BUS-SALES', 'BUS-PROMOTIONS'],
      'management': ['ORG-GOVERNANCE', 'ORG-MISSIONS', 'ORG-VISIONS'],
      'legal': ['ORG-POLICIES', 'OPR-CERTIFICATES', 'OPR-DOCUMENTS']
    };
    
    const guideCodes = contextToGuideCodes[contextName] || [];
    
    if (guideCodes.length === 0) {
      return res.json({ success: true, guides: [] });
    }
    
    const contextGuides = await db
      .select()
      .from(guides)
      .where(inArray(guides.code, guideCodes));
    
    res.json({ success: true, guides: contextGuides });
  } catch (error) {
    logger.error('Error fetching context guides:', error);
    res.status(500).json({ error: 'Failed to fetch context guides' });
  }
});

// Get guide statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total guides count
    const totalGuidesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(guides)
      .where(eq(guides.isActive, true));

    // Get guides by category
    const categoryStats = await db
      .select({
        categoryId: guides.categoryId,
        count: sql<number>`count(*)`
      })
      .from(guides)
      .where(eq(guides.isActive, true))
      .groupBy(guides.categoryId);

    // Get most viewed guides
    const mostViewed = await db
      .select()
      .from(guides)
      .where(eq(guides.isActive, true))
      .orderBy(sql`${guides.viewCount} DESC`)
      .limit(5);

    res.json({
      totalGuides: totalGuidesResult[0]?.count || 0,
      categoryStats,
      mostViewed
    });
  } catch (error) {
    logger.error('Error fetching guide statistics:', error);
    res.status(500).json({ error: 'Failed to fetch guide statistics' });
  }
});

// Get guide details with documents
router.get('/:guideId', async (req, res) => {
  try {
    const guideId = parseInt(req.params.guideId);
    
    if (isNaN(guideId)) {
      return res.status(400).json({ error: 'Invalid guide ID' });
    }
    
    const guide = await db
      .select()
      .from(guides)
      .where(eq(guides.id, guideId))
      .limit(1);
    
    if (guide.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }
    
    const documents = await db
      .select()
      .from(guideDocuments)
      .where(eq(guideDocuments.guideId, guideId))
      .orderBy(guideDocuments.sortOrder);
    
    // Increment view count
    await db
      .update(guides)
      .set({ viewCount: sql`${guides.viewCount} + 1` })
      .where(eq(guides.id, guideId));
    
    res.json({
      ...guide[0],
      documents
    });
  } catch (error) {
    logger.error('Error fetching guide details:', error);
    res.status(500).json({ error: 'Failed to fetch guide details' });
  }
});

// Get guide content from file system
router.get('/:guideId/content', async (req, res) => {
  try {
    const guideId = parseInt(req.params.guideId);
    
    const guide = await db
      .select()
      .from(guides)
      .where(eq(guides.id, guideId))
      .limit(1);
    
    if (guide.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }
    
    const guidePath = guide[0].path;
    const fullPath = path.join(process.cwd(), 'attached_assets', guidePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({
        content,
        path: guidePath,
        title: guide[0].title
      });
    } catch (fileError) {
      logger.error('Error reading guide file:', fileError);
      res.status(404).json({ error: 'Guide content not found' });
    }
  } catch (error) {
    logger.error('Error fetching guide content:', error);
    res.status(500).json({ error: 'Failed to fetch guide content' });
  }
});

// Track user progress (authenticated)
router.post('/:guideId/progress', isAuthenticated, async (req, res) => {
  try {
    const guideId = parseInt(req.params.guideId);
    const userId = (req.user as User)?.id;
    const { status, progress } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const existingProgress = await db
      .select()
      .from(userGuideProgress)
      .where(
        and(
          eq(userGuideProgress.userId, userId),
          eq(userGuideProgress.guideId, guideId)
        )
      )
      .limit(1);
    
    if (existingProgress.length > 0) {
      await db
        .update(userGuideProgress)
        .set({
          status,
          progress,
          lastViewedAt: new Date(),
          completedAt: status === 'completed' ? new Date() : null,
          updatedAt: new Date()
        })
        .where(eq(userGuideProgress.id, existingProgress[0].id));
    } else {
      await db.insert(userGuideProgress).values({
        userId,
        guideId,
        status,
        progress,
        lastViewedAt: new Date()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error tracking guide progress:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

// Get user's guide progress (authenticated)
router.get('/progress/all', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as User)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const progress = await db
      .select({
        guideId: userGuideProgress.guideId,
        guideTitle: guides.title,
        guideCode: guides.code,
        categoryId: guides.categoryId,
        status: userGuideProgress.status,
        progress: userGuideProgress.progress,
        lastViewedAt: userGuideProgress.lastViewedAt,
        completedAt: userGuideProgress.completedAt
      })
      .from(userGuideProgress)
      .leftJoin(guides, eq(userGuideProgress.guideId, guides.id))
      .where(eq(userGuideProgress.userId, userId))
      .orderBy(userGuideProgress.lastViewedAt);
    
    res.json(progress);
  } catch (error) {
    logger.error('Error fetching user guide progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Import guides from file system (admin only)
router.post('/import', isAuthenticated, async (req, res) => {
  try {
    const { categoryCode, categoryName, guidePath } = req.body;
    
    // Create or get category
    let category = await db
      .select()
      .from(guideCategories)
      .where(eq(guideCategories.code, categoryCode))
      .limit(1);
    
    if (category.length === 0) {
      const newCategory = await db
        .insert(guideCategories)
        .values({
          code: categoryCode,
          name: categoryName,
          description: `${categoryName} guides`
        })
        .returning();
      category = newCategory;
    }
    
    const categoryId = category[0].id;
    
    // Import guides from the specified path
    const basePath = path.join(process.cwd(), 'attached_assets', guidePath);
    
    try {
      const items = await fs.readdir(basePath);
      
      for (const item of items) {
        const itemPath = path.join(basePath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          // Create guide entry for directory
          const guideCode = `${categoryCode}-${item.toLowerCase().replace(/\s+/g, '-')}`;
          
          const existingGuide = await db
            .select()
            .from(guides)
            .where(eq(guides.code, guideCode))
            .limit(1);
          
          if (existingGuide.length === 0) {
            await db.insert(guides).values({
              categoryId,
              code: guideCode,
              title: item.replace(/-/g, ' '),
              description: `Guide for ${item}`,
              path: path.join(guidePath, item),
              isActive: true
            });
          }
        }
      }
      
      res.json({ 
        success: true, 
        message: `Imported guides from ${guidePath}` 
      });
    } catch (error) {
      logger.error('Error reading guide directory:', error);
      res.status(500).json({ error: 'Failed to read guide directory' });
    }
  } catch (error) {
    logger.error('Error importing guides:', error);
    res.status(500).json({ error: 'Failed to import guides' });
  }
});

export default router;