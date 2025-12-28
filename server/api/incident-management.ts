/**
 * Incident Management API Routes
 * Provides comprehensive endpoints for security incident response management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { incidentResponseManager } from '../core/security/incident-response-manager';
import { threatDetectionEngine } from '../core/security/threat-detection-engine';
import { auditComplianceManager } from '../core/audit/audit-compliance-manager';
import { requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';
import { broadcastToAdmins } from '../core/websocket/handlers/broadcast';
import { z } from 'zod';
import { 
  IncidentType, 
  IncidentSeverity, 
  IncidentStatus,
  IncidentSource
} from '../core/security/incident-response-manager';

const router = Router();

// Middleware for incident management access
const requireIncidentAccess = [requireAuth, requireRole(['admin', 'security', 'superadmin'])];
const requireIncidentManager = [requireAuth, requireRole(['admin', 'superadmin'])];

// ============================================================================
// Incident Management Routes
// ============================================================================

// Get all incidents with filtering and pagination
router.get('/incidents', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const { 
      status,
      severity,
      type,
      assignedTo,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filters: any = {};
    
    if (status) filters.status = status;
    if (severity) filters.severity = severity;
    if (type) filters.type = type;
    if (assignedTo) filters.assignedTo = parseInt(assignedTo as string);
    if (startDate || endDate) {
      filters.dateRange = {
        start: startDate ? new Date(startDate as string) : undefined,
        end: endDate ? new Date(endDate as string) : undefined
      };
    }

    const incidents = await incidentResponseManager.getIncidents(filters);
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedIncidents = incidents.slice(startIndex, endIndex);
    
    res.json({
      incidents: paginatedIncidents,
      total: incidents.length,
      page: pageNum,
      totalPages: Math.ceil(incidents.length / limitNum)
    });
  } catch (error) {
    logger.error('Failed to fetch incidents:', error);
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
});

// Get incident by ID
router.get('/incidents/:incidentId', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const incident = await incidentResponseManager.getIncident(req.params.incidentId);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    logger.error('Failed to fetch incident:', error);
    res.status(500).json({ error: 'Failed to retrieve incident' });
  }
});

// Create new incident
router.post('/incidents', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const createIncidentSchema = z.object({
      title: z.string().min(5),
      description: z.string().min(10),
      type: z.nativeEnum(IncidentType),
      severity: z.nativeEnum(IncidentSeverity),
      source: z.nativeEnum(IncidentSource).optional(),
      affectedUsers: z.array(z.number()).optional(),
      affectedResources: z.array(z.string()).optional(),
      threatIndicators: z.array(z.string()).optional()
    });

    const incidentData = createIncidentSchema.parse(req.body);
    
    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const incident = await incidentResponseManager.createIncident({
      ...incidentData,
      source: incidentData.source || IncidentSource.USER_REPORT,
      affectedUsers: incidentData.affectedUsers || [],
      affectedResources: incidentData.affectedResources || [],
      reportedBy: req.user?.id
    }, context);

    // Broadcast to admins via WebSocket
    await broadcastToAdmins('incident.created', {
      incident: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        type: incident.type
      }
    });

    res.status(201).json({ success: true, incident });
  } catch (error: any) {
    logger.error('Failed to create incident:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update incident status
router.patch('/incidents/:incidentId/status', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { status, reason } = req.body;
    
    if (!Object.values(IncidentStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const incident = await incidentResponseManager.updateIncidentStatus(
      req.params.incidentId,
      status,
      req.user?.id,
      reason
    );

    // Broadcast status update
    await broadcastToAdmins('incident.status_changed', {
      incidentId: incident.id,
      newStatus: status,
      changedBy: req.user?.username
    });

    res.json({ success: true, incident });
  } catch (error: any) {
    logger.error('Failed to update incident status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute response action
router.post('/incidents/:incidentId/actions', requireIncidentManager, async (req: Request & { user?: any }, res: Response) => {
  try {
    const executeActionSchema = z.object({
      action: z.string(),
      target: z.string(),
      parameters: z.any().optional()
    });

    const actionData = executeActionSchema.parse(req.body);

    const containmentAction = await incidentResponseManager.executeResponseAction(
      req.params.incidentId,
      {
        type: 'manual',
        action: actionData.action,
        target: actionData.target,
        parameters: actionData.parameters
      },
      req.user?.id
    );

    // Broadcast action execution
    await broadcastToAdmins('incident.action_executed', {
      incidentId: req.params.incidentId,
      action: actionData.action,
      executedBy: req.user?.username
    });

    res.json({ success: true, action: containmentAction });
  } catch (error: any) {
    logger.error('Failed to execute response action:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start investigation
router.post('/incidents/:incidentId/investigation', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const investigation = await incidentResponseManager.startInvestigation(
      req.params.incidentId,
      req.user?.id
    );

    res.json({ success: true, investigation });
  } catch (error: any) {
    logger.error('Failed to start investigation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add investigation finding
router.post('/incidents/:incidentId/investigation/findings', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const findingSchema = z.object({
      type: z.enum(['root_cause', 'attack_vector', 'vulnerability', 'compromise_indicator', 'data_exposure']),
      description: z.string(),
      confidence: z.enum(['low', 'medium', 'high']),
      evidence: z.array(z.string()).optional(),
      impact: z.string()
    });

    const findingData = findingSchema.parse(req.body);

    const finding = await incidentResponseManager.addInvestigationFinding(
      req.params.incidentId,
      findingData
    );

    res.json({ success: true, finding });
  } catch (error: any) {
    logger.error('Failed to add investigation finding:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate incident report
router.post('/incidents/:incidentId/report', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { type = 'technical', format = 'json' } = req.body;

    const report = await incidentResponseManager.generateIncidentReport(
      req.params.incidentId,
      type as any,
      req.user?.id
    );

    if (format === 'pdf') {
      // TODO: Implement PDF generation
      return res.status(501).json({ error: 'PDF generation not yet implemented' });
    }

    res.json({ success: true, report });
  } catch (error: any) {
    logger.error('Failed to generate incident report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get incident timeline
router.get('/incidents/:incidentId/timeline', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const incident = await incidentResponseManager.getIncident(req.params.incidentId);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ timeline: incident.timeline });
  } catch (error) {
    logger.error('Failed to fetch incident timeline:', error);
    res.status(500).json({ error: 'Failed to retrieve timeline' });
  }
});

// Escalate incident
router.post('/incidents/:incidentId/escalate', requireIncidentAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { reason, escalateTo } = req.body;

    const incident = await incidentResponseManager.escalateIncident(
      req.params.incidentId,
      escalateTo,
      reason,
      req.user?.id
    );

    // Broadcast escalation
    await broadcastToAdmins('incident.escalated', {
      incidentId: incident.id,
      escalatedTo: escalateTo,
      escalatedBy: req.user?.username,
      reason
    });

    res.json({ success: true, incident });
  } catch (error: any) {
    logger.error('Failed to escalate incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get response playbooks
router.get('/playbooks', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const { incidentType, severity } = req.query;
    
    const filters: any = {};
    if (incidentType) filters.type = incidentType;
    if (severity) filters.severity = severity;

    const playbooks = await incidentResponseManager.getPlaybooks(filters);
    
    res.json({ playbooks });
  } catch (error) {
    logger.error('Failed to fetch playbooks:', error);
    res.status(500).json({ error: 'Failed to retrieve playbooks' });
  }
});

// Apply playbook to incident
router.post('/incidents/:incidentId/apply-playbook', requireIncidentManager, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { playbookId } = req.body;

    await incidentResponseManager.applyPlaybook(
      req.params.incidentId,
      playbookId,
      req.user?.id
    );

    res.json({ success: true, message: 'Playbook applied successfully' });
  } catch (error: any) {
    logger.error('Failed to apply playbook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get incident statistics
router.get('/statistics', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await incidentResponseManager.getIncidentStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch incident statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Get active threats
router.get('/threats/active', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const threats = await threatDetectionEngine.getActiveThreats();
    res.json({ threats });
  } catch (error) {
    logger.error('Failed to fetch active threats:', error);
    res.status(500).json({ error: 'Failed to retrieve active threats' });
  }
});

// Get threat analytics
router.get('/threats/analytics', requireIncidentAccess, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await threatDetectionEngine.getSecurityAnalytics(
      startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate as string) : new Date()
    );

    res.json(analytics);
  } catch (error) {
    logger.error('Failed to fetch threat analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

export default router;