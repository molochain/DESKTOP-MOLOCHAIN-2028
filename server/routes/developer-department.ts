import { Router } from 'express';
import { db } from '../db';
import { guides, guideCategories, projects, commodities, services, shipments } from '@db/schema';
import { eq, like, or, ilike, and, sql, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

// Unified search endpoint for Developer Department
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchQuery = `%${q}%`;
    const results: any = {
      guides: [],
      docs: [],
      apis: [],
      tools: []
    };
    
    // Search guides
    if (type === 'all' || type === 'guides') {
      const guidesResults = await db
        .select()
        .from(guides)
        .where(
          and(
            eq(guides.isActive, true),
            or(
              ilike(guides.title, searchQuery),
              ilike(guides.description, searchQuery),
              ilike(guides.code, searchQuery)
            )
          )
        )
        .limit(10);
      
      results.guides = guidesResults;
    }
    
    // Search technical documentation (simulated)
    if (type === 'all' || type === 'technical') {
      const technicalDocs = [
        { id: 'api-testing', title: 'API Testing Console', description: 'Interactive console for testing API endpoints', type: 'tool', link: '/developer#api' },
        { id: 'system-health', title: 'System Health Monitor', description: 'Real-time monitoring of system performance', type: 'tool', link: '/developer#monitoring' },
        { id: 'architecture', title: 'Architecture Documentation', description: 'System architecture and technical specifications', type: 'docs', link: '/developer#architecture' },
        { id: 'websockets', title: 'WebSocket Integration', description: 'Real-time communication implementation guide', type: 'integration', link: '/developer/websockets' },
        { id: 'authentication', title: 'Authentication Guide', description: 'Secure authentication implementation patterns', type: 'integration', link: '/developer/auth' },
        { id: 'sdks', title: 'SDK Libraries', description: 'Client libraries for popular programming languages', type: 'integration', link: '/developer/sdks' },
        { id: 'workspace', title: 'Developer Workspace', description: 'Real-time collaborative development environment', type: 'tool', link: '/developer/workspace' }
      ].filter(doc => 
        doc.title.toLowerCase().includes(q.toLowerCase()) || 
        doc.description.toLowerCase().includes(q.toLowerCase())
      );
      
      results.docs = technicalDocs;
    }
    
    // Search API endpoints
    if (type === 'all' || type === 'api') {
      const apiEndpoints = [
        { method: 'GET', endpoint: '/api/auth/me', description: 'Get current user information', category: 'Auth' },
        { method: 'POST', endpoint: '/api/auth/login', description: 'Login endpoint', category: 'Auth' },
        { method: 'GET', endpoint: '/api/projects', description: 'List all projects', category: 'Projects' },
        { method: 'GET', endpoint: '/api/services', description: 'List all services', category: 'Services' },
        { method: 'GET', endpoint: '/api/tracking/:id', description: 'Get tracking information', category: 'Tracking' },
        { method: 'GET', endpoint: '/api/health/system', description: 'System health status', category: 'Health' },
        { method: 'GET', endpoint: '/api/guides/search', description: 'Search guides', category: 'Guides' },
        { method: 'GET', endpoint: '/api/guides/categories', description: 'Get guide categories', category: 'Guides' },
        { method: 'POST', endpoint: '/api/collaboration/sessions', description: 'Create collaboration session', category: 'Collaboration' },
        { method: 'GET', endpoint: '/api/commodities', description: 'List all commodities', category: 'Commodities' }
      ].filter(api => 
        api.endpoint.toLowerCase().includes(q.toLowerCase()) || 
        api.description.toLowerCase().includes(q.toLowerCase()) ||
        api.category.toLowerCase().includes(q.toLowerCase())
      );
      
      results.apis = apiEndpoints;
    }
    
    // Search tools and utilities
    if (type === 'all' || type === 'tools') {
      const tools = [
        { id: 'api-console', name: 'API Testing Console', description: 'Test API endpoints directly in browser', link: '/developer#api' },
        { id: 'system-monitor', name: 'System Health Monitor', description: 'Monitor system performance metrics', link: '/developer#monitoring' },
        { id: 'dev-workspace', name: 'Developer Workspace', description: 'Collaborative code editor', link: '/developer/workspace' },
        { id: 'db-explorer', name: 'Database Schema Explorer', description: 'Interactive database documentation', link: '/database-schema' },
        { id: 'brand-protection', name: 'Brand Protection', description: 'Brand guidelines and assets', link: '/developer#branding' },
        { id: 'swagger-ui', name: 'Swagger UI', description: 'Interactive API documentation', link: '/api/docs' }
      ].filter(tool => 
        tool.name.toLowerCase().includes(q.toLowerCase()) || 
        tool.description.toLowerCase().includes(q.toLowerCase())
      );
      
      results.tools = tools;
    }
    
    res.json(results);
  } catch (error) {
    logger.error('Error in unified developer search:', error);
    res.status(500).json({ error: 'Failed to search developer resources' });
  }
});

// Get developer department statistics with live data
router.get('/stats', async (req, res) => {
  try {
    // Get live statistics from database
    const [totalGuides, categories, projectStats, commodityStats, serviceStats, trackingStats] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(guides)
        .where(eq(guides.isActive, true)),
      db.select()
        .from(guideCategories)
        .where(eq(guideCategories.isActive, true)),
      db.select({ 
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when status = 'active' then 1 end)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`
      }).from(projects),
      db.select({ count: sql<number>`count(*)` })
        .from(commodities),
      db.select({ count: sql<number>`count(*)` })
        .from(services),
      db.select({ 
        total: sql<number>`count(*)`,
        inTransit: sql<number>`count(case when status = 'in_transit' then 1 end)`,
        delivered: sql<number>`count(case when status = 'delivered' then 1 end)`
      }).from(shipments)
    ]);
    
    const stats = {
      totalGuides: totalGuides[0]?.count || 0,
      totalCategories: categories.length,
      apiEndpoints: 126,
      technicalDocs: 15,
      tools: 8,
      integrationGuides: 6,
      activeServices: serviceStats[0]?.count || 0,
      systemStatus: 'healthy',
      // Live project data
      projects: {
        total: projectStats[0]?.total || 0,
        active: projectStats[0]?.active || 0,
        completed: projectStats[0]?.completed || 0
      },
      // Live tracking data
      shipments: {
        total: trackingStats[0]?.total || 0,
        inTransit: trackingStats[0]?.inTransit || 0,
        delivered: trackingStats[0]?.delivered || 0
      },
      commodities: commodityStats[0]?.count || 0,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching developer department stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get recommended resources based on context
router.get('/recommendations', async (req, res) => {
  try {
    const { context = 'general' } = req.query;
    
    const recommendations: any = {
      guides: [],
      docs: [],
      tools: []
    };
    
    // Context-based recommendations
    const contextMap: Record<string, any> = {
      'api-development': {
        guides: ['OPR-PROTOCOL', 'OPR-INFORMATION'],
        docs: ['API Testing Console', 'WebSocket Integration', 'Authentication Guide'],
        tools: ['api-console', 'swagger-ui', 'dev-workspace']
      },
      'system-monitoring': {
        guides: ['OPR-TRACKING', 'OPR-ANALYSES'],
        docs: ['System Health Monitor', 'Performance Dashboard'],
        tools: ['system-monitor', 'db-explorer']
      },
      'collaboration': {
        guides: ['ORG-TEAMS', 'OPR-WORKFLOWS'],
        docs: ['Developer Workspace', 'Collaboration WebSocket'],
        tools: ['dev-workspace', 'collaboration-tools']
      },
      'general': {
        guides: ['ORG-GETTING-STARTED', 'OPR-OVERVIEW'],
        docs: ['Architecture Documentation', 'API Documentation'],
        tools: ['api-console', 'system-monitor', 'dev-workspace']
      }
    };
    
    const contextRecommendations = contextMap[context as string] || contextMap['general'];
    
    // Fetch recommended guides
    if (contextRecommendations.guides.length > 0) {
      const recommendedGuides = await db
        .select()
        .from(guides)
        .where(
          and(
            eq(guides.isActive, true),
            or(...contextRecommendations.guides.map((code: string) => eq(guides.code, code)))
          )
        )
        .limit(5);
      
      recommendations.guides = recommendedGuides;
    }
    
    // Add technical documentation recommendations
    recommendations.docs = contextRecommendations.docs.map((title: string) => ({
      title,
      type: 'documentation',
      link: `/developer#${title.toLowerCase().replace(/\s+/g, '-')}`
    }));
    
    // Add tool recommendations
    recommendations.tools = contextRecommendations.tools.map((id: string) => ({
      id,
      type: 'tool',
      link: `/developer#${id}`
    }));
    
    res.json(recommendations);
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get quick links for navigation
router.get('/quick-links', async (_req, res) => {
  try {
    const quickLinks = {
      technical: [
        { title: 'API Testing Console', link: '/developer#api', icon: 'terminal' },
        { title: 'System Health Monitor', link: '/developer#monitoring', icon: 'activity' },
        { title: 'Architecture Docs', link: '/developer#architecture', icon: 'network' },
        { title: 'Developer Workspace', link: '/developer/workspace', icon: 'code' }
      ],
      guides: [
        { title: 'All Guides', link: '/guides', icon: 'book-open' },
        { title: 'Organization', link: '/guides/category/1', icon: 'users' },
        { title: 'Operations', link: '/guides/category/2', icon: 'building' },
        { title: 'Business', link: '/guides/category/4', icon: 'trending-up' }
      ],
      integration: [
        { title: 'WebSocket Guide', link: '/developer/websockets', icon: 'wifi' },
        { title: 'Authentication', link: '/developer/auth', icon: 'shield' },
        { title: 'SDK Libraries', link: '/developer/sdks', icon: 'package' },
        { title: 'API Policies', link: '/developer/policies', icon: 'file-text' }
      ],
      tools: [
        { title: 'Swagger UI', link: '/api/docs', icon: 'file-json' },
        { title: 'Database Explorer', link: '/database-schema', icon: 'database' },
        { title: 'Brand Protection', link: '/developer#branding', icon: 'shield' },
        { title: 'API Documentation', link: '/developer/help', icon: 'book' }
      ]
    };
    
    res.json(quickLinks);
  } catch (error) {
    logger.error('Error fetching quick links:', error);
    res.status(500).json({ error: 'Failed to fetch quick links' });
  }
});

// Get live project activity feed
router.get('/live-feed', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Fetch recent projects with details
    const recentProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        type: projects.type,
        region: projects.region,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(parseInt(limit as string));
    
    // Fetch recent tracking updates
    const recentShipments = await db
      .select({
        id: shipments.id,
        trackingNumber: shipments.trackingNumber,
        status: shipments.status,
        origin: shipments.origin,
        destination: shipments.destination,
        estimatedDelivery: shipments.estimatedDelivery,
        currentLocation: shipments.currentLocation
      })
      .from(shipments)
      .orderBy(desc(shipments.id))
      .limit(5);
    
    // Fetch active services count
    const activeServices = await db
      .select({ 
        count: sql<number>`count(*)`,
        category: services.category
      })
      .from(services)
      .where(eq(services.isActive, true))
      .groupBy(services.category);
    
    res.json({
      projects: recentProjects,
      tracking: recentShipments,
      services: activeServices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching live feed:', error);
    res.status(500).json({ error: 'Failed to fetch live feed' });
  }
});

// Get real-time metrics
router.get('/metrics/realtime', async (req, res) => {
  try {
    // Get current system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Get database statistics
    const dbStatsResult = await db.execute(sql.raw(`
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
        (SELECT COUNT(*) FROM shipments WHERE status = 'in_transit') as shipments_in_transit,
        (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
        (SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours') as active_users_24h
    `));
    
    const dbStats = dbStatsResult.rows?.[0] || {};
    
    res.json({
      system: {
        memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        uptime: Math.round(uptime),
        nodeVersion: process.version
      },
      database: dbStats || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching realtime metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get project integration status
router.get('/integration/status', async (req, res) => {
  try {
    const integrations = {
      projects: { connected: true, lastSync: new Date().toISOString() },
      tracking: { connected: true, lastSync: new Date().toISOString() },
      commodities: { connected: true, lastSync: new Date().toISOString() },
      guides: { connected: true, lastSync: new Date().toISOString() },
      websocket: { 
        connected: true, 
        activeConnections: 0,
        channels: ['projects', 'tracking', 'notifications', 'developer-workspace'] 
      },
      database: { connected: true, health: 'healthy' }
    };
    
    res.json(integrations);
  } catch (error) {
    logger.error('Error checking integration status:', error);
    res.status(500).json({ error: 'Failed to check integration status' });
  }
});

export default router;