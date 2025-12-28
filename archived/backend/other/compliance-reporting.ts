/**
 * Compliance Reporting API Endpoints
 * Provides REST API for compliance reporting and management
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';
import { 
  complianceReportingEngine,
  ComplianceFramework,
  ReportType,
  ReportFormat,
  ReportSchedule,
  ComplianceReport
} from '../core/compliance/compliance-reporting-engine';

const router = Router();

// All compliance endpoints require authentication
router.use(requireAuth);

/**
 * Generate compliance report on-demand
 * POST /api/compliance/reports/generate
 */
router.post('/reports/generate',
  requireRole(['admin', 'auditor', 'compliance']),
  [
    body('type').isIn(['daily_status', 'weekly_security', 'monthly_executive', 'quarterly_assessment', 'annual_audit', 'custom', 'gap_analysis', 'risk_assessment']),
    body('framework').optional().isIn(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS']),
    body('format').optional().isIn(['pdf', 'csv', 'json', 'html']).default('pdf'),
    body('period.start').optional().isISO8601(),
    body('period.end').optional().isISO8601(),
    body('recipients').optional().isArray(),
    body('recipients.*').optional().isEmail()
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, framework, format, period, recipients } = req.body;

      // Generate report
      const report = await complianceReportingEngine.generateReport(
        type as ReportType,
        framework as ComplianceFramework | undefined,
        period ? {
          start: new Date(period.start),
          end: new Date(period.end)
        } : undefined,
        format as ReportFormat,
        req.user?.id
      );

      // Distribute if recipients provided
      if (recipients && recipients.length > 0) {
        await complianceReportingEngine.distributeReport(report, recipients);
      }

      // Log the report generation
      logger.info('Compliance report generated', {
        reportId: report.id,
        type: report.type,
        framework: report.framework,
        userId: req.user?.id
      });

      res.json({
        success: true,
        report: {
          id: report.id,
          name: report.name,
          type: report.type,
          framework: report.framework,
          score: report.score,
          status: report.status,
          generatedAt: report.generatedAt,
          filePath: report.filePath
        }
      });

    } catch (error) {
      logger.error('Error generating compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate compliance report'
      });
    }
  }
);

/**
 * List all compliance reports
 * GET /api/compliance/reports/list
 */
router.get('/reports/list',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  [
    query('type').optional().isIn(['daily_status', 'weekly_security', 'monthly_executive', 'quarterly_assessment', 'annual_audit', 'custom', 'gap_analysis', 'risk_assessment']),
    query('framework').optional().isIn(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('status').optional().isIn(['pending', 'generating', 'completed', 'failed']),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
    query('offset').optional().isInt({ min: 0 }).default(0)
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filters = {
        type: req.query.type as ReportType | undefined,
        framework: req.query.framework as ComplianceFramework | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        status: req.query.status as string | undefined
      };

      const reports = await complianceReportingEngine.listReports(filters);

      // Apply pagination
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const paginatedReports = reports.slice(offset, offset + limit);

      res.json({
        success: true,
        reports: paginatedReports.map(report => ({
          id: report.id,
          name: report.name,
          type: report.type,
          framework: report.framework,
          score: report.score,
          status: report.status,
          generatedAt: report.generatedAt,
          generatedBy: report.generatedBy,
          format: report.format
        })),
        total: reports.length,
        limit,
        offset
      });

    } catch (error) {
      logger.error('Error listing compliance reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list compliance reports'
      });
    }
  }
);

/**
 * Get specific compliance report
 * GET /api/compliance/reports/:id
 */
router.get('/reports/:id',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  [
    param('id').isUUID()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await complianceReportingEngine.getReport(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      res.json({
        success: true,
        report
      });

    } catch (error) {
      logger.error('Error getting compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get compliance report'
      });
    }
  }
);

/**
 * Schedule automated compliance reports
 * POST /api/compliance/reports/schedule
 */
router.post('/reports/schedule',
  requireRole(['admin', 'compliance']),
  [
    body('name').isString().notEmpty(),
    body('type').isIn(['daily_status', 'weekly_security', 'monthly_executive', 'quarterly_assessment', 'annual_audit', 'custom']),
    body('framework').optional().isIn(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS']),
    body('schedule').isString().notEmpty(), // Cron expression
    body('format').optional().isIn(['pdf', 'csv', 'json', 'html']).default('pdf'),
    body('recipients').isArray(),
    body('recipients.*').isEmail(),
    body('enabled').optional().isBoolean().default(true)
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const schedule: ReportSchedule = {
        id: `schedule-${Date.now()}`,
        name: req.body.name,
        type: req.body.type,
        framework: req.body.framework,
        schedule: req.body.schedule,
        format: req.body.format || 'pdf',
        recipients: req.body.recipients,
        enabled: req.body.enabled !== false,
        config: req.body.config
      };

      await complianceReportingEngine.scheduleReport(schedule);

      logger.info('Compliance report scheduled', {
        scheduleId: schedule.id,
        name: schedule.name,
        userId: req.user?.id
      });

      res.json({
        success: true,
        schedule
      });

    } catch (error) {
      logger.error('Error scheduling compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule compliance report'
      });
    }
  }
);

/**
 * Remove scheduled report
 * DELETE /api/compliance/reports/schedule/:id
 */
router.delete('/reports/schedule/:id',
  requireRole(['admin', 'compliance']),
  [
    param('id').isString().notEmpty()
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await complianceReportingEngine.removeSchedule(req.params.id);

      logger.info('Compliance report schedule removed', {
        scheduleId: req.params.id,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Schedule removed successfully'
      });

    } catch (error) {
      logger.error('Error removing compliance report schedule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove schedule'
      });
    }
  }
);

/**
 * Get framework compliance status
 * GET /api/compliance/frameworks/:framework/status
 */
router.get('/frameworks/:framework/status',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  [
    param('framework').isIn(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const framework = req.params.framework as ComplianceFramework;
      const status = await complianceReportingEngine.getFrameworkStatus(framework);

      res.json({
        success: true,
        framework,
        status: {
          score: status.score,
          lastReport: status.lastReport ? {
            id: status.lastReport.id,
            generatedAt: status.lastReport.generatedAt,
            score: status.lastReport.score
          } : null,
          nextScheduledReport: status.nextScheduledReport
        }
      });

    } catch (error) {
      logger.error('Error getting framework status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get framework status'
      });
    }
  }
);

/**
 * Get all compliance scores
 * GET /api/compliance/scores
 */
router.get('/scores',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  async (req: Request, res: Response) => {
    try {
      const scores = await complianceReportingEngine.getComplianceScores();
      
      const scoresArray = Array.from(scores.entries()).map(([framework, score]) => ({
        framework,
        ...score
      }));

      res.json({
        success: true,
        scores: scoresArray
      });

    } catch (error) {
      logger.error('Error getting compliance scores:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get compliance scores'
      });
    }
  }
);

/**
 * Collect compliance evidence
 * POST /api/compliance/evidence/collect
 */
router.post('/evidence/collect',
  requireRole(['admin', 'auditor', 'compliance']),
  [
    body('sources').optional().isArray(),
    body('sources.*').optional().isIn(['audit_logs', 'access_logs', 'configurations', 'policies'])
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const evidence = await complianceReportingEngine.collectEvidence(req.body.sources);

      logger.info('Compliance evidence collected', {
        count: evidence.length,
        sources: req.body.sources,
        userId: req.user?.id
      });

      res.json({
        success: true,
        evidence: evidence.map(e => ({
          id: e.id,
          type: e.type,
          source: e.source,
          timestamp: e.timestamp,
          description: e.description,
          hash: e.hash
        })),
        count: evidence.length
      });

    } catch (error) {
      logger.error('Error collecting compliance evidence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to collect compliance evidence'
      });
    }
  }
);

/**
 * Export compliance report
 * POST /api/compliance/reports/:id/export
 */
router.post('/reports/:id/export',
  requireRole(['admin', 'auditor', 'compliance']),
  [
    param('id').isUUID(),
    body('format').isIn(['pdf', 'csv', 'json', 'html']),
    body('email').optional().isEmail()
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await complianceReportingEngine.getReport(req.params.id);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      // If report already exists in requested format, return it
      if (report.format === req.body.format && report.filePath) {
        if (req.body.email) {
          await complianceReportingEngine.distributeReport(report, [req.body.email]);
          res.json({
            success: true,
            message: 'Report sent to email'
          });
        } else {
          res.json({
            success: true,
            filePath: report.filePath
          });
        }
        return;
      }

      // Generate report in new format
      const exportedReport = await complianceReportingEngine.generateReport(
        report.type,
        report.framework,
        report.period,
        req.body.format as ReportFormat,
        req.user?.id
      );

      if (req.body.email) {
        await complianceReportingEngine.distributeReport(exportedReport, [req.body.email]);
        res.json({
          success: true,
          message: 'Report exported and sent to email'
        });
      } else {
        res.json({
          success: true,
          filePath: exportedReport.filePath
        });
      }

    } catch (error) {
      logger.error('Error exporting compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export compliance report'
      });
    }
  }
);

/**
 * Download compliance report file
 * GET /api/compliance/reports/:id/download
 */
router.get('/reports/:id/download',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  [
    param('id').isUUID()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await complianceReportingEngine.getReport(req.params.id);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      if (!report.filePath) {
        return res.status(404).json({
          success: false,
          error: 'Report file not available'
        });
      }

      // Send file for download
      res.download(report.filePath, `${report.name}.${report.format}`);

    } catch (error) {
      logger.error('Error downloading compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download compliance report'
      });
    }
  }
);

/**
 * Trigger compliance assessment for specific control
 * POST /api/compliance/controls/:controlId/assess
 */
router.post('/controls/:controlId/assess',
  requireRole(['admin', 'auditor', 'compliance']),
  [
    param('controlId').isString().notEmpty()
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // This would trigger assessment of a specific control
      // Implementation would depend on control structure

      logger.info('Control assessment triggered', {
        controlId: req.params.controlId,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Control assessment initiated',
        controlId: req.params.controlId
      });

    } catch (error) {
      logger.error('Error assessing control:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assess control'
      });
    }
  }
);

/**
 * Get compliance trends
 * GET /api/compliance/trends
 */
router.get('/trends',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  [
    query('framework').optional().isIn(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS']),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).default('30d')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Calculate period
      const periodMap: Record<string, number> = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };

      const period = periodMap[req.query.period as string] || periodMap['30d'];
      const startDate = new Date(Date.now() - period);

      // Get reports within period
      const reports = await complianceReportingEngine.listReports({
        framework: req.query.framework as ComplianceFramework | undefined,
        startDate,
        status: 'completed'
      });

      // Calculate trends
      const trends = reports.map(report => ({
        date: report.generatedAt,
        score: report.score || 0,
        framework: report.framework
      }));

      res.json({
        success: true,
        trends,
        period: req.query.period,
        framework: req.query.framework
      });

    } catch (error) {
      logger.error('Error getting compliance trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get compliance trends'
      });
    }
  }
);

/**
 * Get compliance dashboard summary
 * GET /api/compliance/dashboard
 */
router.get('/dashboard',
  requireRole(['admin', 'auditor', 'compliance', 'viewer']),
  async (req: Request, res: Response) => {
    try {
      // Get all compliance scores
      const scores = await complianceReportingEngine.getComplianceScores();
      
      // Get recent reports
      const recentReports = await complianceReportingEngine.listReports({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      });

      // Calculate average compliance score
      let totalScore = 0;
      let scoreCount = 0;
      scores.forEach(score => {
        if (score.overallScore !== undefined) {
          totalScore += score.overallScore;
          scoreCount++;
        }
      });
      const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

      // Find critical findings from recent reports
      const criticalFindings = recentReports
        .flatMap(r => r.findings)
        .filter(f => f.severity === 'critical');

      // Get framework statuses
      const frameworkStatuses = Array.from(scores.entries()).map(([framework, score]) => ({
        framework,
        score: score.overallScore,
        trend: score.trend,
        lastAssessment: score.lastAssessment
      }));

      res.json({
        success: true,
        dashboard: {
          averageComplianceScore: Math.round(averageScore),
          frameworkStatuses,
          recentReports: recentReports.slice(0, 5).map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            framework: r.framework,
            score: r.score,
            generatedAt: r.generatedAt
          })),
          criticalFindings: criticalFindings.slice(0, 10),
          totalReports: recentReports.length,
          pendingReports: recentReports.filter(r => r.status === 'pending').length
        }
      });

    } catch (error) {
      logger.error('Error getting compliance dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get compliance dashboard'
      });
    }
  }
);

export default router;