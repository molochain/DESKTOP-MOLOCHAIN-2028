/**
 * Security Incident Response Manager
 * Comprehensive incident management, response coordination, and recovery system
 */

import EventEmitter from 'events';
import { db } from '../database/db.service';
import { auditLogs, users } from '@db/schema';
import { eq, and, or, gte, lte, desc, asc, count, sql, inArray } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { identityManager } from '../identity/identity-manager.service';
import { auditComplianceManager } from '../audit/audit-compliance-manager';
import { threatDetectionEngine } from './threat-detection-engine';
import { securityPolicyEngine } from './security-policy-engine';
import { accessControlManager } from '../access/access-control-manager';
import crypto from 'crypto';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: IncidentSource;
  affectedUsers: number[];
  affectedResources: string[];
  containmentActions: ContainmentAction[];
  timeline: IncidentEvent[];
  evidence: Evidence[];
  assignedTo?: number;
  teamMembers: TeamMember[];
  relatedIncidents: string[];
  threatIndicators: string[];
  riskScore: number;
  estimatedImpact: ImpactAssessment;
  createdAt: Date;
  updatedAt: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  reportedBy: number;
  metadata: Record<string, any>;
}

export enum IncidentType {
  DATA_BREACH = 'data_breach',
  ACCOUNT_COMPROMISE = 'account_compromise',
  MALWARE_INFECTION = 'malware_infection',
  DENIAL_OF_SERVICE = 'denial_of_service',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  POLICY_VIOLATION = 'policy_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_LOSS = 'data_loss',
  INSIDER_THREAT = 'insider_threat',
  SOCIAL_ENGINEERING = 'social_engineering',
  SUPPLY_CHAIN = 'supply_chain',
  ZERO_DAY = 'zero_day'
}

export enum IncidentSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum IncidentStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  CONTAINING = 'containing',
  CONTAINED = 'contained',
  ERADICATING = 'eradicating',
  RECOVERING = 'recovering',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  FALSE_POSITIVE = 'false_positive'
}

export enum IncidentSource {
  THREAT_DETECTION = 'threat_detection',
  USER_REPORT = 'user_report',
  AUDIT_ALERT = 'audit_alert',
  MONITORING = 'monitoring',
  EXTERNAL_REPORT = 'external_report',
  VULNERABILITY_SCAN = 'vulnerability_scan',
  COMPLIANCE_CHECK = 'compliance_check'
}

export interface IncidentEvent {
  timestamp: Date;
  type: 'status_change' | 'action_taken' | 'evidence_added' | 'user_assigned' | 'note_added' | 'escalation';
  description: string;
  performedBy?: number;
  details?: any;
}

export interface ContainmentAction {
  id: string;
  type: 'automatic' | 'manual';
  action: string;
  target: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executedAt?: Date;
  executedBy?: number;
  result?: any;
  error?: string;
}

export interface Evidence {
  id: string;
  type: 'log' | 'screenshot' | 'file' | 'network_capture' | 'memory_dump' | 'configuration';
  description: string;
  source: string;
  collectedAt: Date;
  collectedBy: number;
  hash?: string;
  data?: any;
  location?: string;
}

export interface TeamMember {
  userId: number;
  role: 'lead' | 'investigator' | 'analyst' | 'manager' | 'legal' | 'communications';
  assignedAt: Date;
  responsibilities: string[];
  status: 'active' | 'standby' | 'unavailable';
}

export interface ImpactAssessment {
  affectedUserCount: number;
  dataExposureRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  financialImpact?: number;
  reputationalImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  operationalImpact: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  regulatoryImpact: boolean;
  estimatedRecoveryTime: number; // hours
}

// ============================================================================
// Response Playbook Definitions
// ============================================================================

export interface ResponsePlaybook {
  id: string;
  name: string;
  description: string;
  incidentTypes: IncidentType[];
  severities: IncidentSeverity[];
  steps: PlaybookStep[];
  automatedActions: AutomatedAction[];
  escalationCriteria: EscalationCriteria[];
  communicationTemplates: CommunicationTemplate[];
  requiredRoles: string[];
  estimatedDuration: number; // minutes
  lastUpdated: Date;
  version: string;
}

export interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  required: boolean;
  type: 'manual' | 'automated' | 'hybrid';
  assignedRole?: string;
  actions: string[];
  verificationCriteria: string[];
  estimatedDuration: number; // minutes
  dependencies?: number[]; // Step orders this depends on
}

export interface AutomatedAction {
  id: string;
  trigger: 'immediate' | 'conditional' | 'scheduled';
  condition?: string;
  action: string;
  parameters: any;
  rollbackProcedure?: string;
}

export interface EscalationCriteria {
  condition: string;
  escalateTo: string[];
  notificationTemplate: string;
  timeLimit?: number; // minutes
}

export interface CommunicationTemplate {
  id: string;
  type: 'internal' | 'customer' | 'regulatory' | 'media';
  audience: string;
  subject: string;
  template: string;
  requiredApproval?: string[];
  timing: 'immediate' | 'containment' | 'resolution' | 'closure';
}

// ============================================================================
// Investigation and Forensics
// ============================================================================

export interface InvestigationContext {
  incidentId: string;
  investigatorId: number;
  startTime: Date;
  findings: InvestigationFinding[];
  hypotheses: Hypothesis[];
  artifacts: ForensicArtifact[];
  timeline: ForensicTimeline;
  recommendations: string[];
  status: 'ongoing' | 'completed' | 'suspended';
}

export interface InvestigationFinding {
  id: string;
  timestamp: Date;
  type: 'root_cause' | 'attack_vector' | 'vulnerability' | 'compromise_indicator' | 'data_exposure';
  description: string;
  confidence: 'low' | 'medium' | 'high';
  evidence: string[];
  impact: string;
}

export interface Hypothesis {
  id: string;
  description: string;
  evidence_for: string[];
  evidence_against: string[];
  probability: number; // 0-100
  status: 'investigating' | 'confirmed' | 'rejected';
}

export interface ForensicArtifact {
  id: string;
  type: string;
  source: string;
  hash: string;
  timestamp: Date;
  preserved: boolean;
  chainOfCustody: CustodyEntry[];
}

export interface CustodyEntry {
  timestamp: Date;
  custodian: number;
  action: string;
  location: string;
}

export interface ForensicTimeline {
  events: TimelineEvent[];
  correlations: EventCorrelation[];
  attackChain?: AttackChainStep[];
}

export interface TimelineEvent {
  timestamp: Date;
  source: string;
  type: string;
  description: string;
  userId?: number;
  ipAddress?: string;
  evidence?: string[];
}

export interface EventCorrelation {
  event1: string;
  event2: string;
  relationship: string;
  confidence: number;
}

export interface AttackChainStep {
  order: number;
  phase: 'reconnaissance' | 'initial_access' | 'execution' | 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'lateral_movement' | 'collection' | 'exfiltration' | 'impact';
  description: string;
  evidence: string[];
  timestamp?: Date;
}

// ============================================================================
// Reporting and Compliance
// ============================================================================

export interface IncidentReport {
  id: string;
  incidentId: string;
  type: 'executive' | 'technical' | 'regulatory' | 'customer' | 'postmortem';
  generatedAt: Date;
  generatedBy: number;
  content: ReportContent;
  distribution: string[];
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  approvedBy?: number[];
  version: number;
}

export interface ReportContent {
  executiveSummary: string;
  incidentDetails: any;
  timeline: any[];
  impact: ImpactAssessment;
  rootCause?: string;
  containmentActions: any[];
  remediationSteps: any[];
  lessonsLearned: string[];
  recommendations: string[];
  appendices?: any[];
}

export interface ComplianceNotification {
  framework: 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2' | 'ISO27001' | 'CCPA';
  required: boolean;
  deadline?: Date;
  template: string;
  authorities: string[];
  submitted?: boolean;
  submittedAt?: Date;
  reference?: string;
}

// ============================================================================
// Incident Response Manager Implementation
// ============================================================================

class IncidentResponseManager extends EventEmitter {
  private static instance: IncidentResponseManager;
  private incidents: Map<string, SecurityIncident> = new Map();
  private playbooks: Map<string, ResponsePlaybook> = new Map();
  private investigations: Map<string, InvestigationContext> = new Map();
  private activeResponses: Map<string, ContainmentAction[]> = new Map();
  private incidentReports: Map<string, IncidentReport[]> = new Map();
  
  // Configuration
  private readonly config = {
    autoContainment: {
      enabled: true,
      severityThreshold: IncidentSeverity.HIGH,
      maxAutoActions: 5
    },
    escalation: {
      criticalEscalationTime: 15, // minutes
      highEscalationTime: 60, // minutes
      mediumEscalationTime: 240 // minutes
    },
    notification: {
      channels: ['email', 'slack', 'pagerduty'],
      criticalAlertAll: true,
      updateInterval: 30 // minutes
    },
    retention: {
      incidentDataDays: 365,
      evidenceDays: 730,
      reportsDays: 2555 // 7 years
    }
  };

  // Predefined playbooks
  private readonly defaultPlaybooks: ResponsePlaybook[] = [
    {
      id: 'pb-001',
      name: 'Data Breach Response',
      description: 'Standard response procedure for data breach incidents',
      incidentTypes: [IncidentType.DATA_BREACH],
      severities: [IncidentSeverity.CRITICAL, IncidentSeverity.HIGH],
      steps: [
        {
          order: 1,
          title: 'Initial Assessment',
          description: 'Assess the scope and severity of the breach',
          required: true,
          type: 'manual',
          assignedRole: 'lead',
          actions: [
            'Identify affected systems',
            'Determine data types exposed',
            'Estimate number of affected records'
          ],
          verificationCriteria: ['Scope documented', 'Data classification completed'],
          estimatedDuration: 30
        },
        {
          order: 2,
          title: 'Containment',
          description: 'Contain the breach to prevent further data loss',
          required: true,
          type: 'hybrid',
          assignedRole: 'investigator',
          actions: [
            'Isolate affected systems',
            'Reset compromised credentials',
            'Block malicious IPs'
          ],
          verificationCriteria: ['Systems isolated', 'No ongoing data exfiltration'],
          estimatedDuration: 60,
          dependencies: [1]
        },
        {
          order: 3,
          title: 'Evidence Collection',
          description: 'Collect and preserve forensic evidence',
          required: true,
          type: 'manual',
          assignedRole: 'analyst',
          actions: [
            'Capture system logs',
            'Create forensic images',
            'Document chain of custody'
          ],
          verificationCriteria: ['Evidence secured', 'Chain of custody maintained'],
          estimatedDuration: 120,
          dependencies: [2]
        },
        {
          order: 4,
          title: 'Notification',
          description: 'Notify affected parties and regulators',
          required: true,
          type: 'manual',
          assignedRole: 'manager',
          actions: [
            'Prepare notification content',
            'Identify notification requirements',
            'Send notifications'
          ],
          verificationCriteria: ['Notifications sent', 'Acknowledgments received'],
          estimatedDuration: 240,
          dependencies: [1]
        }
      ],
      automatedActions: [
        {
          id: 'auto-001',
          trigger: 'immediate',
          action: 'lockdown_affected_accounts',
          parameters: { scope: 'affected_users' },
          rollbackProcedure: 'Unlock accounts after password reset'
        },
        {
          id: 'auto-002',
          trigger: 'conditional',
          condition: 'data_exfiltration_detected',
          action: 'block_outbound_traffic',
          parameters: { duration: 3600 },
          rollbackProcedure: 'Restore network access after containment'
        }
      ],
      escalationCriteria: [
        {
          condition: 'affected_users > 1000',
          escalateTo: ['ciso', 'legal_team', 'executive_team'],
          notificationTemplate: 'critical_breach_escalation'
        },
        {
          condition: 'sensitive_data_exposed',
          escalateTo: ['privacy_officer', 'compliance_team'],
          notificationTemplate: 'privacy_breach_escalation'
        }
      ],
      communicationTemplates: [
        {
          id: 'comm-001',
          type: 'regulatory',
          audience: 'Data Protection Authority',
          subject: 'Data Breach Notification - [INCIDENT_ID]',
          template: 'As required under GDPR Article 33, we are notifying you of a data breach...',
          requiredApproval: ['legal_team', 'privacy_officer'],
          timing: 'immediate'
        }
      ],
      requiredRoles: ['lead', 'investigator', 'analyst', 'manager'],
      estimatedDuration: 480,
      lastUpdated: new Date(),
      version: '1.0'
    },
    {
      id: 'pb-002',
      name: 'Account Compromise Response',
      description: 'Response procedure for compromised user accounts',
      incidentTypes: [IncidentType.ACCOUNT_COMPROMISE],
      severities: [IncidentSeverity.HIGH, IncidentSeverity.MEDIUM],
      steps: [
        {
          order: 1,
          title: 'Account Lockdown',
          description: 'Immediately lock the compromised account',
          required: true,
          type: 'automated',
          actions: ['Lock account', 'Terminate active sessions', 'Revoke tokens'],
          verificationCriteria: ['Account locked', 'Sessions terminated'],
          estimatedDuration: 5
        },
        {
          order: 2,
          title: 'Impact Assessment',
          description: 'Assess what the compromised account had access to',
          required: true,
          type: 'manual',
          assignedRole: 'analyst',
          actions: [
            'Review account permissions',
            'Check recent activity',
            'Identify accessed resources'
          ],
          verificationCriteria: ['Access audit complete', 'Resource list compiled'],
          estimatedDuration: 30,
          dependencies: [1]
        }
      ],
      automatedActions: [
        {
          id: 'auto-003',
          trigger: 'immediate',
          action: 'force_password_reset',
          parameters: { scope: 'compromised_account' },
          rollbackProcedure: 'N/A - User must reset password'
        }
      ],
      escalationCriteria: [
        {
          condition: 'admin_account_compromised',
          escalateTo: ['security_team', 'ciso'],
          notificationTemplate: 'admin_compromise_escalation',
          timeLimit: 15
        }
      ],
      communicationTemplates: [
        {
          id: 'comm-002',
          type: 'customer',
          audience: 'Affected User',
          subject: 'Security Alert: Your Account May Have Been Compromised',
          template: 'We detected suspicious activity on your account and have taken protective measures...',
          timing: 'immediate'
        }
      ],
      requiredRoles: ['analyst', 'investigator'],
      estimatedDuration: 120,
      lastUpdated: new Date(),
      version: '1.0'
    }
  ];

  private constructor() {
    super();
    this.initializeManager();
  }

  public static getInstance(): IncidentResponseManager {
    if (!IncidentResponseManager.instance) {
      IncidentResponseManager.instance = new IncidentResponseManager();
    }
    return IncidentResponseManager.instance;
  }

  private initializeManager(): void {
    // Load default playbooks
    this.loadDefaultPlaybooks();
    
    // Start periodic tasks
    this.startPeriodicTasks();
    
    // Set up integrations
    this.setupIntegrations();
    
    logger.info('Incident Response Manager initialized');
  }

  private loadDefaultPlaybooks(): void {
    for (const playbook of this.defaultPlaybooks) {
      this.playbooks.set(playbook.id, playbook);
    }
  }

  private startPeriodicTasks(): void {
    // Check for escalations every minute
    setInterval(() => {
      this.checkEscalations();
    }, 60 * 1000);

    // Update incident metrics every 5 minutes
    setInterval(() => {
      this.updateIncidentMetrics();
    }, 5 * 60 * 1000);

    // Clean up old data daily
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);

    // Generate compliance reports weekly
    setInterval(() => {
      this.generateComplianceReports();
    }, 7 * 24 * 60 * 60 * 1000);
  }

  private setupIntegrations(): void {
    // Integration with Threat Detection Engine
    threatDetectionEngine.on('threat_detected', async (threat) => {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        await this.createIncidentFromThreat(threat);
      }
    });

    // Integration with Audit Manager
    auditComplianceManager.on('compliance_violation', async (violation) => {
      if (violation.severity === 'critical') {
        await this.createIncidentFromCompliance(violation);
      }
    });

    // Integration with Identity Manager
    identityManager.on('security_breach', async (breach) => {
      await this.createIncidentFromBreach(breach);
    });
  }

  // ============================================================================
  // Incident Management
  // ============================================================================

  public async createIncident(data: {
    title: string;
    description: string;
    type: IncidentType;
    severity: IncidentSeverity;
    source: IncidentSource;
    reportedBy: number;
    affectedUsers?: number[];
    affectedResources?: string[];
    evidence?: any[];
    metadata?: Record<string, any>;
  }): Promise<SecurityIncident> {
    try {
      const incidentId = this.generateIncidentId();
      
      const incident: SecurityIncident = {
        id: incidentId,
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        status: IncidentStatus.OPEN,
        source: data.source,
        affectedUsers: data.affectedUsers || [],
        affectedResources: data.affectedResources || [],
        containmentActions: [],
        timeline: [
          {
            timestamp: new Date(),
            type: 'status_change',
            description: 'Incident created',
            performedBy: data.reportedBy,
            details: { status: IncidentStatus.OPEN }
          }
        ],
        evidence: data.evidence || [],
        teamMembers: [],
        relatedIncidents: [],
        threatIndicators: [],
        riskScore: this.calculateRiskScore(data.type, data.severity),
        estimatedImpact: await this.assessImpact(data),
        createdAt: new Date(),
        updatedAt: new Date(),
        reportedBy: data.reportedBy,
        metadata: data.metadata || {}
      };

      this.incidents.set(incidentId, incident);

      // Auto-assign based on severity
      if (data.severity === IncidentSeverity.CRITICAL) {
        await this.autoAssignTeam(incident);
      }

      // Execute immediate containment if configured
      if (this.config.autoContainment.enabled && 
          this.getSeverityLevel(data.severity) >= this.getSeverityLevel(this.config.autoContainment.severityThreshold)) {
        await this.executeAutoContainment(incident);
      }

      // Find and attach relevant playbook
      const playbook = this.findRelevantPlaybook(incident);
      if (playbook) {
        incident.metadata.playbookId = playbook.id;
      }

      // Audit log
      await auditComplianceManager.logAudit({
        userId: data.reportedBy,
        action: 'incident_created',
        resourceType: 'incident',
        resourceId: incidentId,
        details: {
          type: data.type,
          severity: data.severity,
          title: data.title
        },
        ipAddress: 'system',
        userAgent: 'incident-response-manager',
        severity: this.mapSeverityToAudit(data.severity),
        tags: ['incident', data.type, data.severity]
      });

      this.emit('incident_created', incident);

      // Send notifications
      await this.sendIncidentNotifications(incident, 'created');

      return incident;
    } catch (error) {
      logger.error('Failed to create incident:', error);
      throw error;
    }
  }

  public async updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    userId: number,
    notes?: string
  ): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date();

    // Add timeline event
    incident.timeline.push({
      timestamp: new Date(),
      type: 'status_change',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      performedBy: userId,
      details: { oldStatus, newStatus, notes }
    });

    // Update status timestamps
    switch (newStatus) {
      case IncidentStatus.CONTAINED:
        incident.containedAt = new Date();
        break;
      case IncidentStatus.RESOLVED:
        incident.resolvedAt = new Date();
        break;
      case IncidentStatus.CLOSED:
        incident.closedAt = new Date();
        break;
    }

    // Audit log
    await auditComplianceManager.logAudit({
      userId,
      action: 'incident_status_updated',
      resourceType: 'incident',
      resourceId: incidentId,
      details: {
        oldStatus,
        newStatus,
        notes
      },
      ipAddress: 'system',
      userAgent: 'incident-response-manager',
      severity: 'info'
    });

    this.emit('incident_status_changed', {
      incident,
      oldStatus,
      newStatus,
      userId
    });

    // Send notifications
    await this.sendIncidentNotifications(incident, 'status_changed');

    return incident;
  }

  public async executeResponseAction(
    incidentId: string,
    action: {
      type: 'automatic' | 'manual';
      action: string;
      target: string;
      parameters?: any;
    },
    userId: number
  ): Promise<ContainmentAction> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const actionId = crypto.randomUUID();
    const containmentAction: ContainmentAction = {
      id: actionId,
      type: action.type,
      action: action.action,
      target: action.target,
      status: 'pending',
      executedBy: userId
    };

    incident.containmentActions.push(containmentAction);

    try {
      containmentAction.status = 'executing';
      containmentAction.executedAt = new Date();

      // Execute the action based on type
      const result = await this.executeAction(action);
      
      containmentAction.status = 'completed';
      containmentAction.result = result;

      // Add to timeline
      incident.timeline.push({
        timestamp: new Date(),
        type: 'action_taken',
        description: `Executed ${action.action} on ${action.target}`,
        performedBy: userId,
        details: { action, result }
      });

      // Audit log
      await auditComplianceManager.logAudit({
        userId,
        action: 'response_action_executed',
        resourceType: 'incident',
        resourceId: incidentId,
        details: {
          action: action.action,
          target: action.target,
          result
        },
        ipAddress: 'system',
        userAgent: 'incident-response-manager',
        severity: 'warning'
      });

      this.emit('response_action_executed', {
        incident,
        action: containmentAction,
        userId
      });

      return containmentAction;
    } catch (error) {
      containmentAction.status = 'failed';
      containmentAction.error = error instanceof Error ? error.message : 'Unknown error occurred';
      
      logger.error(`Failed to execute response action: ${error}`);
      throw error;
    }
  }

  // ============================================================================
  // Investigation Tools
  // ============================================================================

  public async startInvestigation(
    incidentId: string,
    investigatorId: number
  ): Promise<InvestigationContext> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const investigation: InvestigationContext = {
      incidentId,
      investigatorId,
      startTime: new Date(),
      findings: [],
      hypotheses: [],
      artifacts: [],
      timeline: {
        events: [],
        correlations: []
      },
      recommendations: [],
      status: 'ongoing'
    };

    this.investigations.set(incidentId, investigation);

    // Add team member
    incident.teamMembers.push({
      userId: investigatorId,
      role: 'investigator',
      assignedAt: new Date(),
      responsibilities: ['Conduct investigation', 'Collect evidence', 'Document findings'],
      status: 'active'
    });

    // Update incident status
    if (incident.status === IncidentStatus.OPEN) {
      await this.updateIncidentStatus(incidentId, IncidentStatus.INVESTIGATING, investigatorId);
    }

    this.emit('investigation_started', {
      incident,
      investigation,
      investigatorId
    });

    return investigation;
  }

  public async addInvestigationFinding(
    incidentId: string,
    finding: {
      type: 'root_cause' | 'attack_vector' | 'vulnerability' | 'compromise_indicator' | 'data_exposure';
      description: string;
      confidence: 'low' | 'medium' | 'high';
      evidence: string[];
      impact: string;
    },
    investigatorId: number
  ): Promise<InvestigationFinding> {
    const investigation = this.investigations.get(incidentId);
    if (!investigation) {
      throw new Error('Investigation not found');
    }

    const findingId = crypto.randomUUID();
    const investigationFinding: InvestigationFinding = {
      id: findingId,
      timestamp: new Date(),
      ...finding
    };

    investigation.findings.push(investigationFinding);

    // Update incident timeline
    const incident = this.incidents.get(incidentId);
    if (incident) {
      incident.timeline.push({
        timestamp: new Date(),
        type: 'note_added',
        description: `Investigation finding: ${finding.type}`,
        performedBy: investigatorId,
        details: investigationFinding
      });
    }

    // If root cause found, update incident
    if (finding.type === 'root_cause' && finding.confidence === 'high') {
      incident!.metadata.rootCause = finding.description;
    }

    this.emit('investigation_finding_added', {
      incident,
      investigation,
      finding: investigationFinding
    });

    return investigationFinding;
  }

  public async collectEvidence(
    incidentId: string,
    evidence: {
      type: 'log' | 'screenshot' | 'file' | 'network_capture' | 'memory_dump' | 'configuration';
      description: string;
      source: string;
      data?: any;
      location?: string;
    },
    collectorId: number
  ): Promise<Evidence> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const evidenceId = crypto.randomUUID();
    const collectedEvidence: Evidence = {
      id: evidenceId,
      ...evidence,
      collectedAt: new Date(),
      collectedBy: collectorId,
      hash: evidence.data ? this.hashEvidence(evidence.data) : undefined
    };

    incident.evidence.push(collectedEvidence);

    // Add to timeline
    incident.timeline.push({
      timestamp: new Date(),
      type: 'evidence_added',
      description: `Evidence collected: ${evidence.type}`,
      performedBy: collectorId,
      details: { evidenceId, type: evidence.type, source: evidence.source }
    });

    // Store in investigation if exists
    const investigation = this.investigations.get(incidentId);
    if (investigation) {
      investigation.artifacts.push({
        id: evidenceId,
        type: evidence.type,
        source: evidence.source,
        hash: collectedEvidence.hash!,
        timestamp: new Date(),
        preserved: true,
        chainOfCustody: [
          {
            timestamp: new Date(),
            custodian: collectorId,
            action: 'collected',
            location: evidence.location || 'system'
          }
        ]
      });
    }

    this.emit('evidence_collected', {
      incident,
      evidence: collectedEvidence,
      collectorId
    });

    return collectedEvidence;
  }

  // ============================================================================
  // Team Coordination
  // ============================================================================

  public async assignIncident(
    incidentId: string,
    userId: number,
    role: 'lead' | 'investigator' | 'analyst' | 'manager' | 'legal' | 'communications',
    assignedBy: number
  ): Promise<TeamMember> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const teamMember: TeamMember = {
      userId,
      role,
      assignedAt: new Date(),
      responsibilities: this.getRoleResponsibilities(role),
      status: 'active'
    };

    // Remove if already assigned
    incident.teamMembers = incident.teamMembers.filter(tm => tm.userId !== userId);
    incident.teamMembers.push(teamMember);

    if (role === 'lead') {
      incident.assignedTo = userId;
    }

    // Add to timeline
    incident.timeline.push({
      timestamp: new Date(),
      type: 'user_assigned',
      description: `User assigned as ${role}`,
      performedBy: assignedBy,
      details: { userId, role }
    });

    // Send notification to assigned user
    await this.notifyTeamMember(userId, incident, role);

    this.emit('incident_assigned', {
      incident,
      userId,
      role,
      assignedBy
    });

    return teamMember;
  }

  private getRoleResponsibilities(role: string): string[] {
    const responsibilities: Record<string, string[]> = {
      lead: [
        'Coordinate response efforts',
        'Make critical decisions',
        'Report to management',
        'Ensure playbook compliance'
      ],
      investigator: [
        'Conduct forensic analysis',
        'Collect and preserve evidence',
        'Identify root cause',
        'Document findings'
      ],
      analyst: [
        'Analyze logs and data',
        'Identify patterns',
        'Support investigation',
        'Monitor systems'
      ],
      manager: [
        'Oversee response',
        'Approve actions',
        'Coordinate resources',
        'External communication'
      ],
      legal: [
        'Assess legal implications',
        'Manage compliance requirements',
        'Review notifications',
        'Coordinate with authorities'
      ],
      communications: [
        'Prepare statements',
        'Manage stakeholder communication',
        'Monitor public response',
        'Coordinate messaging'
      ]
    };

    return responsibilities[role] || [];
  }

  // ============================================================================
  // Recovery and Remediation
  // ============================================================================

  public async createRecoveryPlan(
    incidentId: string,
    plan: {
      steps: Array<{
        action: string;
        priority: 'critical' | 'high' | 'medium' | 'low';
        assignedTo?: number;
        estimatedDuration: number;
        dependencies?: string[];
      }>;
      rollbackProcedures: string[];
      validationCriteria: string[];
      estimatedRecoveryTime: number;
    },
    createdBy: number
  ): Promise<any> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.metadata.recoveryPlan = {
      ...plan,
      createdAt: new Date(),
      createdBy,
      status: 'pending'
    };

    // Update incident status
    if (incident.status === IncidentStatus.CONTAINED) {
      await this.updateIncidentStatus(incidentId, IncidentStatus.RECOVERING, createdBy);
    }

    this.emit('recovery_plan_created', {
      incident,
      plan,
      createdBy
    });

    return incident.metadata.recoveryPlan;
  }

  public async executeRemediation(
    incidentId: string,
    remediation: {
      type: 'patch' | 'configuration' | 'policy' | 'training' | 'process';
      description: string;
      target: string;
      verificationSteps: string[];
    },
    executedBy: number
  ): Promise<any> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const remediationId = crypto.randomUUID();
    const remediationRecord = {
      id: remediationId,
      ...remediation,
      executedAt: new Date(),
      executedBy,
      status: 'completed'
    };

    if (!incident.metadata.remediations) {
      incident.metadata.remediations = [];
    }
    incident.metadata.remediations.push(remediationRecord);

    // Add to timeline
    incident.timeline.push({
      timestamp: new Date(),
      type: 'action_taken',
      description: `Remediation executed: ${remediation.type}`,
      performedBy: executedBy,
      details: remediationRecord
    });

    this.emit('remediation_executed', {
      incident,
      remediation: remediationRecord,
      executedBy
    });

    return remediationRecord;
  }

  // ============================================================================
  // Reporting and Compliance
  // ============================================================================

  public async generateIncidentReport(
    incidentId: string,
    type: 'executive' | 'technical' | 'regulatory' | 'customer' | 'postmortem',
    generatedBy: number
  ): Promise<IncidentReport> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const reportId = crypto.randomUUID();
    const report: IncidentReport = {
      id: reportId,
      incidentId,
      type,
      generatedAt: new Date(),
      generatedBy,
      content: await this.compileReportContent(incident, type),
      distribution: this.getReportDistribution(type),
      classification: this.getReportClassification(type),
      version: 1
    };

    if (!this.incidentReports.has(incidentId)) {
      this.incidentReports.set(incidentId, []);
    }
    this.incidentReports.get(incidentId)!.push(report);

    // Audit log
    await auditComplianceManager.logAudit({
      userId: generatedBy,
      action: 'incident_report_generated',
      resourceType: 'incident',
      resourceId: incidentId,
      details: {
        reportId,
        type,
        classification: report.classification
      },
      ipAddress: 'system',
      userAgent: 'incident-response-manager',
      severity: 'info'
    });

    this.emit('report_generated', {
      incident,
      report,
      generatedBy
    });

    return report;
  }

  private async compileReportContent(
    incident: SecurityIncident,
    type: string
  ): Promise<ReportContent> {
    const investigation = this.investigations.get(incident.id);
    
    return {
      executiveSummary: this.generateExecutiveSummary(incident),
      incidentDetails: {
        id: incident.id,
        title: incident.title,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        duration: this.calculateIncidentDuration(incident),
        affectedUsers: incident.affectedUsers.length,
        affectedResources: incident.affectedResources
      },
      timeline: incident.timeline,
      impact: incident.estimatedImpact,
      rootCause: investigation?.findings.find(f => f.type === 'root_cause')?.description,
      containmentActions: incident.containmentActions,
      remediationSteps: incident.metadata.remediations || [],
      lessonsLearned: investigation?.recommendations || [],
      recommendations: this.generateRecommendations(incident, investigation)
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private generateIncidentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `INC-${timestamp}-${random}`.toUpperCase();
  }

  private calculateRiskScore(type: IncidentType, severity: IncidentSeverity): number {
    const typeScores: Record<IncidentType, number> = {
      [IncidentType.DATA_BREACH]: 90,
      [IncidentType.ACCOUNT_COMPROMISE]: 70,
      [IncidentType.MALWARE_INFECTION]: 80,
      [IncidentType.DENIAL_OF_SERVICE]: 60,
      [IncidentType.PRIVILEGE_ESCALATION]: 85,
      [IncidentType.POLICY_VIOLATION]: 40,
      [IncidentType.UNAUTHORIZED_ACCESS]: 75,
      [IncidentType.DATA_LOSS]: 85,
      [IncidentType.INSIDER_THREAT]: 80,
      [IncidentType.SOCIAL_ENGINEERING]: 65,
      [IncidentType.SUPPLY_CHAIN]: 75,
      [IncidentType.ZERO_DAY]: 95
    };

    const severityMultipliers: Record<IncidentSeverity, number> = {
      [IncidentSeverity.CRITICAL]: 1.2,
      [IncidentSeverity.HIGH]: 1.0,
      [IncidentSeverity.MEDIUM]: 0.7,
      [IncidentSeverity.LOW]: 0.4
    };

    return Math.min(100, typeScores[type] * severityMultipliers[severity]);
  }

  private async assessImpact(data: any): Promise<ImpactAssessment> {
    return {
      affectedUserCount: data.affectedUsers?.length || 0,
      dataExposureRisk: this.assessDataExposureRisk(data),
      financialImpact: this.estimateFinancialImpact(data),
      reputationalImpact: this.assessReputationalImpact(data),
      operationalImpact: this.assessOperationalImpact(data),
      regulatoryImpact: this.assessRegulatoryImpact(data),
      estimatedRecoveryTime: this.estimateRecoveryTime(data)
    };
  }

  private assessDataExposureRisk(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    // Simplified assessment logic
    if (data.type === IncidentType.DATA_BREACH) {
      return data.severity === IncidentSeverity.CRITICAL ? 'critical' : 'high';
    }
    return 'low';
  }

  private estimateFinancialImpact(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): number {
    // Simplified financial impact estimation
    const baseCosts: Record<IncidentType, number> = {
      [IncidentType.DATA_BREACH]: 100000,
      [IncidentType.ACCOUNT_COMPROMISE]: 10000,
      [IncidentType.MALWARE_INFECTION]: 50000,
      [IncidentType.DENIAL_OF_SERVICE]: 30000,
      [IncidentType.PRIVILEGE_ESCALATION]: 40000,
      [IncidentType.POLICY_VIOLATION]: 5000,
      [IncidentType.UNAUTHORIZED_ACCESS]: 20000,
      [IncidentType.DATA_LOSS]: 80000,
      [IncidentType.INSIDER_THREAT]: 60000,
      [IncidentType.SOCIAL_ENGINEERING]: 25000,
      [IncidentType.SUPPLY_CHAIN]: 70000,
      [IncidentType.ZERO_DAY]: 150000
    };

    return baseCosts[data.type] || 10000;
  }

  private assessReputationalImpact(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): 'minimal' | 'moderate' | 'significant' | 'severe' {
    if (data.severity === IncidentSeverity.CRITICAL) return 'severe';
    if (data.severity === IncidentSeverity.HIGH) return 'significant';
    if (data.severity === IncidentSeverity.MEDIUM) return 'moderate';
    return 'minimal';
  }

  private assessOperationalImpact(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): 'none' | 'minor' | 'moderate' | 'major' | 'critical' {
    if (data.type === IncidentType.DENIAL_OF_SERVICE) return 'major';
    if (data.type === IncidentType.MALWARE_INFECTION) return 'moderate';
    return 'minor';
  }

  private assessRegulatoryImpact(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): boolean {
    return data.type === IncidentType.DATA_BREACH || 
           data.type === IncidentType.DATA_LOSS;
  }

  private estimateRecoveryTime(data: { type: IncidentType; severity: IncidentSeverity; [key: string]: any }): number {
    const baseHours: Record<IncidentSeverity, number> = {
      [IncidentSeverity.CRITICAL]: 72,
      [IncidentSeverity.HIGH]: 48,
      [IncidentSeverity.MEDIUM]: 24,
      [IncidentSeverity.LOW]: 8
    };

    return baseHours[data.severity] || 24;
  }

  private getSeverityLevel(severity: IncidentSeverity): number {
    const levels = {
      [IncidentSeverity.LOW]: 1,
      [IncidentSeverity.MEDIUM]: 2,
      [IncidentSeverity.HIGH]: 3,
      [IncidentSeverity.CRITICAL]: 4
    };
    return levels[severity];
  }

  private mapSeverityToAudit(severity: IncidentSeverity): 'info' | 'warning' | 'error' | 'critical' {
    const mapping = {
      [IncidentSeverity.LOW]: 'info' as const,
      [IncidentSeverity.MEDIUM]: 'warning' as const,
      [IncidentSeverity.HIGH]: 'error' as const,
      [IncidentSeverity.CRITICAL]: 'critical' as const
    };
    return mapping[severity];
  }

  private findRelevantPlaybook(incident: SecurityIncident): ResponsePlaybook | undefined {
    for (const playbook of this.playbooks.values()) {
      if (playbook.incidentTypes.includes(incident.type) && 
          playbook.severities.includes(incident.severity)) {
        return playbook;
      }
    }
    return undefined;
  }

  private async autoAssignTeam(incident: SecurityIncident): Promise<void> {
    // Auto-assign logic based on incident type and severity
    // This is simplified - in production, would query user database
    logger.info(`Auto-assigning team for incident ${incident.id}`);
  }

  private async executeAutoContainment(incident: SecurityIncident): Promise<void> {
    const playbook = this.findRelevantPlaybook(incident);
    if (!playbook) return;

    for (const action of playbook.automatedActions) {
      if (action.trigger === 'immediate') {
        try {
          await this.executeResponseAction(
            incident.id,
            {
              type: 'automatic',
              action: action.action,
              target: 'affected_systems',
              parameters: action.parameters
            },
            0 // System user
          );
        } catch (error) {
          logger.error(`Failed to execute auto-containment action: ${error}`);
        }
      }
    }
  }

  private async executeAction(action: any): Promise<any> {
    // Implementation would depend on the specific action
    // This is a placeholder that simulates action execution
    logger.info(`Executing action: ${action.action} on ${action.target}`);
    
    // Simulate different actions
    switch (action.action) {
      case 'lockdown_affected_accounts':
        return { lockedAccounts: action.parameters?.scope || [] };
      case 'block_outbound_traffic':
        return { blockedFor: action.parameters?.duration || 3600 };
      case 'force_password_reset':
        return { resetInitiated: true };
      default:
        return { executed: true };
    }
  }

  private async sendIncidentNotifications(incident: SecurityIncident, event: string): Promise<void> {
    // Implementation would integrate with notification services
    logger.info(`Sending notifications for incident ${incident.id} - Event: ${event}`);
  }

  private async notifyTeamMember(userId: number, incident: SecurityIncident, role: string): Promise<void> {
    // Implementation would send notification to the assigned team member
    logger.info(`Notifying user ${userId} of assignment to incident ${incident.id} as ${role}`);
  }

  private generateExecutiveSummary(incident: SecurityIncident): string {
    return `Security incident ${incident.id} (${incident.type}) was detected on ${incident.createdAt}. ` +
           `The incident has been classified as ${incident.severity} severity with a risk score of ${incident.riskScore}. ` +
           `Current status: ${incident.status}. ` +
           `Impact: ${incident.affectedUsers.length} users and ${incident.affectedResources.length} resources affected.`;
  }

  private calculateIncidentDuration(incident: SecurityIncident): number {
    const end = incident.closedAt || incident.resolvedAt || new Date();
    return Math.floor((end.getTime() - incident.createdAt.getTime()) / (1000 * 60)); // minutes
  }

  private generateRecommendations(incident: SecurityIncident, investigation?: InvestigationContext): string[] {
    const recommendations: string[] = [];
    
    // Generate recommendations based on incident type
    switch (incident.type) {
      case IncidentType.DATA_BREACH:
        recommendations.push('Review and enhance data access controls');
        recommendations.push('Implement data loss prevention (DLP) solutions');
        recommendations.push('Conduct security awareness training');
        break;
      case IncidentType.ACCOUNT_COMPROMISE:
        recommendations.push('Enforce multi-factor authentication');
        recommendations.push('Implement stronger password policies');
        recommendations.push('Deploy user behavior analytics');
        break;
      // Add more cases as needed
    }

    // Add investigation-specific recommendations
    if (investigation) {
      recommendations.push(...investigation.recommendations);
    }

    return recommendations;
  }

  private getReportDistribution(type: string): string[] {
    const distributions: Record<string, string[]> = {
      executive: ['ciso', 'executive_team'],
      technical: ['security_team', 'it_team'],
      regulatory: ['compliance_team', 'legal_team'],
      customer: ['customer_success', 'public_relations'],
      postmortem: ['all_stakeholders']
    };
    return distributions[type] || [];
  }

  private getReportClassification(type: string): 'public' | 'internal' | 'confidential' | 'restricted' {
    const classifications: Record<string, 'public' | 'internal' | 'confidential' | 'restricted'> = {
      executive: 'confidential',
      technical: 'internal',
      regulatory: 'restricted',
      customer: 'public',
      postmortem: 'internal'
    };
    return classifications[type] || 'internal';
  }

  private async checkEscalations(): Promise<void> {
    const now = new Date();
    
    for (const incident of this.incidents.values()) {
      if (incident.status === IncidentStatus.CLOSED || incident.status === IncidentStatus.FALSE_POSITIVE) {
        continue;
      }

      const incidentAge = (now.getTime() - incident.createdAt.getTime()) / (1000 * 60); // minutes
      
      // Check escalation criteria
      if (incident.severity === IncidentSeverity.CRITICAL && incidentAge > this.config.escalation.criticalEscalationTime) {
        // Escalate critical incidents
        this.emit('incident_escalation_needed', {
          incident,
          reason: 'Critical incident unresolved',
          escalationLevel: 'executive'
        });
      } else if (incident.severity === IncidentSeverity.HIGH && incidentAge > this.config.escalation.highEscalationTime) {
        // Escalate high severity incidents
        this.emit('incident_escalation_needed', {
          incident,
          reason: 'High severity incident unresolved',
          escalationLevel: 'management'
        });
      }
    }
  }

  private async updateIncidentMetrics(): Promise<void> {
    // Update metrics for active incidents
    for (const incident of this.incidents.values()) {
      if (incident.status !== IncidentStatus.CLOSED) {
        // Recalculate risk score based on new information
        incident.riskScore = this.calculateRiskScore(incident.type, incident.severity);
        
        // Update impact assessment
        incident.estimatedImpact = await this.assessImpact(incident);
      }
    }
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.incidentDataDays);
    
    // Clean up old closed incidents
    for (const [id, incident] of this.incidents.entries()) {
      if (incident.status === IncidentStatus.CLOSED && incident.closedAt && incident.closedAt < cutoffDate) {
        this.incidents.delete(id);
        this.investigations.delete(id);
        logger.info(`Cleaned up old incident: ${id}`);
      }
    }
  }

  private async generateComplianceReports(): Promise<void> {
    // Generate weekly compliance reports for active incidents
    const activeIncidents = Array.from(this.incidents.values()).filter(
      i => i.status !== IncidentStatus.CLOSED && i.status !== IncidentStatus.FALSE_POSITIVE
    );
    
    if (activeIncidents.length > 0) {
      logger.info(`Generating compliance reports for ${activeIncidents.length} active incidents`);
      
      for (const incident of activeIncidents) {
        if (incident.estimatedImpact.regulatoryImpact) {
          await this.generateIncidentReport(incident.id, 'regulatory', 0); // System user
        }
      }
    }
  }

  private async createIncidentFromThreat(threat: any): Promise<void> {
    await this.createIncident({
      title: `Threat Detected: ${threat.type}`,
      description: threat.description,
      type: this.mapThreatTypeToIncidentType(threat.type),
      severity: this.mapThreatSeverityToIncidentSeverity(threat.severity),
      source: IncidentSource.THREAT_DETECTION,
      reportedBy: 0, // System
      affectedUsers: threat.userId ? [threat.userId] : [],
      evidence: threat.evidence,
      metadata: { threatId: threat.id, threatIndicators: threat.indicators }
    });
  }

  private async createIncidentFromCompliance(violation: any): Promise<void> {
    await this.createIncident({
      title: `Compliance Violation: ${violation.rule}`,
      description: violation.description,
      type: IncidentType.POLICY_VIOLATION,
      severity: this.mapComplianceSeverityToIncidentSeverity(violation.severity),
      source: IncidentSource.COMPLIANCE_CHECK,
      reportedBy: 0, // System
      metadata: { violationId: violation.id, complianceRule: violation.rule }
    });
  }

  private async createIncidentFromBreach(breach: any): Promise<void> {
    await this.createIncident({
      title: `Security Breach Detected`,
      description: breach.description || 'A security breach has been detected',
      type: IncidentType.DATA_BREACH,
      severity: IncidentSeverity.CRITICAL,
      source: IncidentSource.MONITORING,
      reportedBy: 0, // System
      affectedUsers: breach.affectedUsers || [],
      affectedResources: breach.affectedResources || [],
      metadata: breach
    });
  }

  private mapThreatTypeToIncidentType(threatType: string): IncidentType {
    const mapping: Record<string, IncidentType> = {
      'brute_force': IncidentType.ACCOUNT_COMPROMISE,
      'privilege_escalation': IncidentType.PRIVILEGE_ESCALATION,
      'data_exfiltration': IncidentType.DATA_BREACH,
      'malware': IncidentType.MALWARE_INFECTION,
      'dos': IncidentType.DENIAL_OF_SERVICE
    };
    return mapping[threatType] || IncidentType.UNAUTHORIZED_ACCESS;
  }

  private mapThreatSeverityToIncidentSeverity(severity: string): IncidentSeverity {
    const mapping: Record<string, IncidentSeverity> = {
      'critical': IncidentSeverity.CRITICAL,
      'high': IncidentSeverity.HIGH,
      'medium': IncidentSeverity.MEDIUM,
      'low': IncidentSeverity.LOW
    };
    return mapping[severity] || IncidentSeverity.MEDIUM;
  }

  private mapComplianceSeverityToIncidentSeverity(severity: string): IncidentSeverity {
    const mapping: Record<string, IncidentSeverity> = {
      'critical': IncidentSeverity.HIGH,
      'high': IncidentSeverity.MEDIUM,
      'medium': IncidentSeverity.LOW,
      'low': IncidentSeverity.LOW
    };
    return mapping[severity] || IncidentSeverity.LOW;
  }

  private hashEvidence(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  public async getActiveIncidents(): Promise<SecurityIncident[]> {
    return Array.from(this.incidents.values()).filter(
      i => i.status !== IncidentStatus.CLOSED && i.status !== IncidentStatus.FALSE_POSITIVE
    );
  }

  public async getIncidentById(incidentId: string): Promise<SecurityIncident | undefined> {
    return this.incidents.get(incidentId);
  }

  public async getIncidentTimeline(incidentId: string): Promise<IncidentEvent[]> {
    const incident = this.incidents.get(incidentId);
    return incident ? incident.timeline : [];
  }

  public async getResponsePlaybooks(): Promise<ResponsePlaybook[]> {
    return Array.from(this.playbooks.values());
  }

  public async getIncidentStatistics(timeRange?: { start: Date; end: Date }): Promise<any> {
    const incidents = Array.from(this.incidents.values());
    const filteredIncidents = timeRange 
      ? incidents.filter(i => i.createdAt >= timeRange.start && i.createdAt <= timeRange.end)
      : incidents;

    return {
      total: filteredIncidents.length,
      byStatus: this.groupByProperty(filteredIncidents, 'status'),
      byType: this.groupByProperty(filteredIncidents, 'type'),
      bySeverity: this.groupByProperty(filteredIncidents, 'severity'),
      averageResolutionTime: this.calculateAverageResolutionTime(filteredIncidents),
      activeIncidents: filteredIncidents.filter(i => i.status !== IncidentStatus.CLOSED).length,
      criticalIncidents: filteredIncidents.filter(i => i.severity === IncidentSeverity.CRITICAL).length
    };
  }

  private groupByProperty(items: any[], property: string): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item[property]] = (acc[item[property]] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResolutionTime(incidents: SecurityIncident[]): number {
    const resolved = incidents.filter(i => i.resolvedAt);
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, i) => {
      return sum + (i.resolvedAt!.getTime() - i.createdAt.getTime());
    }, 0);
    
    return Math.floor(totalTime / resolved.length / (1000 * 60 * 60)); // hours
  }
}

// Export singleton instance
export const incidentResponseManager = IncidentResponseManager.getInstance();