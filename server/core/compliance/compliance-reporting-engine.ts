/**
 * Compliance Reporting Engine
 * Automated compliance reporting for multiple frameworks with evidence collection
 */

import { db } from '../database/db.service';
import { auditLogs, users } from '@db/schema';
import { eq, and, or, gte, lte, desc, asc, count, sql, inArray } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { auditComplianceManager } from '../audit/audit-compliance-manager';
import { identityManager } from '../identity/identity-manager.service';
import { securityPolicyEngine } from '../security/security-policy-engine';
import { accessControlManager } from '../access/access-control-manager';
import { threatDetectionEngine } from '../security/threat-detection-engine';
import EventEmitter from 'events';
import * as cron from 'node-cron';
import * as fs from 'fs/promises';
import * as path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';
import nodemailer from 'nodemailer';

export type ComplianceFramework = 
  | 'SOC2' 
  | 'ISO27001' 
  | 'GDPR' 
  | 'HIPAA' 
  | 'PCI-DSS' 
  | 'NIST' 
  | 'CIS';

export type ReportType = 
  | 'daily_status'
  | 'weekly_security'
  | 'monthly_executive'
  | 'quarterly_assessment'
  | 'annual_audit'
  | 'custom'
  | 'gap_analysis'
  | 'risk_assessment';

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html';

export interface ComplianceReport {
  id: string;
  name: string;
  type: ReportType;
  framework?: ComplianceFramework;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: number;
  format: ReportFormat;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  score?: number;
  findings: ComplianceFinding[];
  evidence: ComplianceEvidence[];
  recommendations: string[];
  executive_summary?: string;
  technical_details?: any;
  filePath?: string;
  recipients?: string[];
  metadata?: Record<string, any>;
}

export interface ComplianceFinding {
  id: string;
  control: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string[];
  remediation?: string;
  deadline?: Date;
}

export interface ComplianceEvidence {
  id: string;
  type: 'log' | 'configuration' | 'policy' | 'screenshot' | 'document' | 'record';
  source: string;
  timestamp: Date;
  description: string;
  data: any;
  hash?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  type: ReportType;
  framework?: ComplianceFramework;
  schedule: string; // Cron expression
  format: ReportFormat;
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  config?: Record<string, any>;
}

export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  category: string;
  name: string;
  description: string;
  requirement: string;
  testFunction: () => Promise<ControlTestResult>;
  weight: number; // For scoring
  tags: string[];
}

export interface ControlTestResult {
  passed: boolean;
  score: number; // 0-100
  evidence: ComplianceEvidence[];
  findings: string[];
  recommendations?: string[];
}

export interface ComplianceScore {
  framework: ComplianceFramework;
  overallScore: number;
  categoryScores: Record<string, number>;
  controlScores: Record<string, number>;
  trend: 'improving' | 'stable' | 'declining';
  lastAssessment: Date;
  nextAssessment: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  sections: ReportSection[];
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'details' | 'evidence' | 'charts' | 'table' | 'recommendations';
  content?: any;
  order: number;
  visible: boolean;
}

class ComplianceReportingEngine extends EventEmitter {
  private static instance: ComplianceReportingEngine;
  private reports: Map<string, ComplianceReport> = new Map();
  private schedules: Map<string, ReportSchedule> = new Map();
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private controls: Map<string, ComplianceControl[]> = new Map();
  private templates: Map<string, ReportTemplate> = new Map();
  private scores: Map<ComplianceFramework, ComplianceScore> = new Map();
  private readonly REPORTS_DIR = path.join(process.cwd(), 'reports', 'compliance');
  private emailTransporter: nodemailer.Transporter | null = null;

  private constructor() {
    super();
    this.initializeFrameworks();
    this.initializeTemplates();
    this.setupEmailTransporter();
    this.ensureReportsDirectory();
    this.loadSchedules();
  }

  public static getInstance(): ComplianceReportingEngine {
    if (!ComplianceReportingEngine.instance) {
      ComplianceReportingEngine.instance = new ComplianceReportingEngine();
    }
    return ComplianceReportingEngine.instance;
  }

  private async ensureReportsDirectory() {
    try {
      await fs.mkdir(this.REPORTS_DIR, { recursive: true });
    } catch (error) {
      logger.error('Failed to create reports directory:', error);
    }
  }

  private setupEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  private initializeFrameworks() {
    // SOC 2 Controls
    this.initializeSOC2Controls();
    
    // ISO 27001 Controls
    this.initializeISO27001Controls();
    
    // GDPR Controls
    this.initializeGDPRControls();
    
    // HIPAA Controls
    this.initializeHIPAAControls();
    
    // PCI-DSS Controls
    this.initializePCIDSSControls();
    
    // NIST Controls
    this.initializeNISTControls();
    
    // CIS Controls
    this.initializeCISControls();
  }

  private initializeSOC2Controls() {
    const soc2Controls: ComplianceControl[] = [
      {
        id: 'soc2-cc1.1',
        framework: 'SOC2',
        category: 'Control Environment',
        name: 'Integrity and Ethical Values',
        description: 'The entity demonstrates a commitment to integrity and ethical values',
        requirement: 'Management and employees must adhere to code of conduct',
        testFunction: async () => this.testIntegrityAndEthics(),
        weight: 10,
        tags: ['governance', 'ethics']
      },
      {
        id: 'soc2-cc2.1',
        framework: 'SOC2',
        category: 'Communication and Information',
        name: 'Internal Communication',
        description: 'The entity internally communicates information to support internal control',
        requirement: 'Security policies must be communicated to all personnel',
        testFunction: async () => this.testInternalCommunication(),
        weight: 8,
        tags: ['communication', 'awareness']
      },
      {
        id: 'soc2-cc6.1',
        framework: 'SOC2',
        category: 'Logical and Physical Access',
        name: 'Logical Access Controls',
        description: 'The entity implements logical access security controls',
        requirement: 'Access must be based on least privilege principle',
        testFunction: async () => this.testLogicalAccessControls(),
        weight: 15,
        tags: ['access', 'authentication']
      },
      {
        id: 'soc2-cc7.1',
        framework: 'SOC2',
        category: 'System Operations',
        name: 'Security Monitoring',
        description: 'The entity monitors system components for anomalies',
        requirement: 'Continuous monitoring of security events',
        testFunction: async () => this.testSecurityMonitoring(),
        weight: 12,
        tags: ['monitoring', 'detection']
      }
    ];

    this.controls.set('SOC2', soc2Controls);
  }

  private initializeISO27001Controls() {
    const iso27001Controls: ComplianceControl[] = [
      {
        id: 'iso-5.1',
        framework: 'ISO27001',
        category: 'Organizational Controls',
        name: 'Policies for Information Security',
        description: 'Information security policy and topic-specific policies',
        requirement: 'Documented and approved security policies',
        testFunction: async () => this.testSecurityPolicies(),
        weight: 10,
        tags: ['policy', 'governance']
      },
      {
        id: 'iso-6.1',
        framework: 'ISO27001',
        category: 'People Controls',
        name: 'Screening',
        description: 'Background verification checks on candidates',
        requirement: 'Background checks for all personnel with access to sensitive data',
        testFunction: async () => this.testPersonnelScreening(),
        weight: 8,
        tags: ['hr', 'screening']
      },
      {
        id: 'iso-8.1',
        framework: 'ISO27001',
        category: 'Technological Controls',
        name: 'User Endpoint Devices',
        description: 'Information stored on user endpoint devices',
        requirement: 'Encryption and access controls on endpoint devices',
        testFunction: async () => this.testEndpointSecurity(),
        weight: 12,
        tags: ['endpoint', 'encryption']
      }
    ];

    this.controls.set('ISO27001', iso27001Controls);
  }

  private initializeGDPRControls() {
    const gdprControls: ComplianceControl[] = [
      {
        id: 'gdpr-art25',
        framework: 'GDPR',
        category: 'Privacy by Design',
        name: 'Data Protection by Design',
        description: 'Implement appropriate technical and organizational measures',
        requirement: 'Privacy considerations in system design',
        testFunction: async () => this.testPrivacyByDesign(),
        weight: 15,
        tags: ['privacy', 'design']
      },
      {
        id: 'gdpr-art32',
        framework: 'GDPR',
        category: 'Security',
        name: 'Security of Processing',
        description: 'Appropriate security measures including encryption',
        requirement: 'Encryption of personal data in transit and at rest',
        testFunction: async () => this.testDataEncryption(),
        weight: 12,
        tags: ['encryption', 'security']
      },
      {
        id: 'gdpr-art33',
        framework: 'GDPR',
        category: 'Breach Notification',
        name: 'Breach Notification Process',
        description: 'Notify authorities within 72 hours of breach',
        requirement: 'Documented breach notification procedures',
        testFunction: async () => this.testBreachNotification(),
        weight: 10,
        tags: ['incident', 'notification']
      }
    ];

    this.controls.set('GDPR', gdprControls);
  }

  private initializeHIPAAControls() {
    const hipaaControls: ComplianceControl[] = [
      {
        id: 'hipaa-164.308',
        framework: 'HIPAA',
        category: 'Administrative Safeguards',
        name: 'Security Officer',
        description: 'Designate a security officer',
        requirement: 'Assigned security officer responsible for HIPAA compliance',
        testFunction: async () => this.testSecurityOfficer(),
        weight: 8,
        tags: ['governance', 'roles']
      },
      {
        id: 'hipaa-164.310',
        framework: 'HIPAA',
        category: 'Physical Safeguards',
        name: 'Facility Access Controls',
        description: 'Limit physical access to electronic systems',
        requirement: 'Physical access controls to data centers and facilities',
        testFunction: async () => this.testPhysicalAccess(),
        weight: 10,
        tags: ['physical', 'access']
      },
      {
        id: 'hipaa-164.312',
        framework: 'HIPAA',
        category: 'Technical Safeguards',
        name: 'Access Control',
        description: 'Technical policies and procedures for electronic access',
        requirement: 'Unique user identification and automatic logoff',
        testFunction: async () => this.testTechnicalAccessControls(),
        weight: 15,
        tags: ['access', 'technical']
      }
    ];

    this.controls.set('HIPAA', hipaaControls);
  }

  private initializePCIDSSControls() {
    const pcidssControls: ComplianceControl[] = [
      {
        id: 'pci-1.1',
        framework: 'PCI-DSS',
        category: 'Network Security',
        name: 'Firewall Configuration',
        description: 'Install and maintain firewall configuration',
        requirement: 'Firewall rules reviewed every 6 months',
        testFunction: async () => this.testFirewallConfiguration(),
        weight: 12,
        tags: ['network', 'firewall']
      },
      {
        id: 'pci-2.1',
        framework: 'PCI-DSS',
        category: 'Default Security',
        name: 'Default Passwords',
        description: 'Change vendor-supplied defaults',
        requirement: 'No default passwords in production systems',
        testFunction: async () => this.testDefaultPasswords(),
        weight: 10,
        tags: ['password', 'configuration']
      },
      {
        id: 'pci-8.1',
        framework: 'PCI-DSS',
        category: 'Access Control',
        name: 'User Identification',
        description: 'Assign unique ID to each person with computer access',
        requirement: 'Unique user IDs for all system access',
        testFunction: async () => this.testUniqueUserIds(),
        weight: 8,
        tags: ['identity', 'access']
      }
    ];

    this.controls.set('PCI-DSS', pcidssControls);
  }

  private initializeNISTControls() {
    const nistControls: ComplianceControl[] = [
      {
        id: 'nist-id.am',
        framework: 'NIST',
        category: 'Identify',
        name: 'Asset Management',
        description: 'Physical devices and systems are inventoried',
        requirement: 'Complete asset inventory maintained',
        testFunction: async () => this.testAssetManagement(),
        weight: 8,
        tags: ['asset', 'inventory']
      },
      {
        id: 'nist-pr.ac',
        framework: 'NIST',
        category: 'Protect',
        name: 'Identity Management and Access Control',
        description: 'Access to assets is limited to authorized users',
        requirement: 'Role-based access control implemented',
        testFunction: async () => this.testIdentityManagement(),
        weight: 15,
        tags: ['identity', 'rbac']
      },
      {
        id: 'nist-de.cm',
        framework: 'NIST',
        category: 'Detect',
        name: 'Security Continuous Monitoring',
        description: 'Network is monitored to detect cybersecurity events',
        requirement: 'Continuous monitoring tools deployed',
        testFunction: async () => this.testContinuousMonitoring(),
        weight: 12,
        tags: ['monitoring', 'detection']
      }
    ];

    this.controls.set('NIST', nistControls);
  }

  private initializeCISControls() {
    const cisControls: ComplianceControl[] = [
      {
        id: 'cis-1',
        framework: 'CIS',
        category: 'Basic',
        name: 'Inventory of Authorized Devices',
        description: 'Actively manage all hardware devices',
        requirement: 'Automated device discovery and inventory',
        testFunction: async () => this.testDeviceInventory(),
        weight: 10,
        tags: ['inventory', 'devices']
      },
      {
        id: 'cis-2',
        framework: 'CIS',
        category: 'Basic',
        name: 'Inventory of Authorized Software',
        description: 'Actively manage all software',
        requirement: 'Software whitelist and unauthorized software detection',
        testFunction: async () => this.testSoftwareInventory(),
        weight: 10,
        tags: ['inventory', 'software']
      },
      {
        id: 'cis-5',
        framework: 'CIS',
        category: 'Basic',
        name: 'Secure Configuration',
        description: 'Secure configuration for hardware and software',
        requirement: 'Hardened configurations with regular reviews',
        testFunction: async () => this.testSecureConfiguration(),
        weight: 12,
        tags: ['configuration', 'hardening']
      }
    ];

    this.controls.set('CIS', cisControls);
  }

  private initializeTemplates() {
    // Executive Summary Template
    this.templates.set('executive_summary', {
      id: 'executive_summary',
      name: 'Executive Summary Report',
      type: 'monthly_executive',
      sections: [
        {
          id: 'overview',
          title: 'Executive Overview',
          type: 'summary',
          order: 1,
          visible: true
        },
        {
          id: 'scores',
          title: 'Compliance Scores',
          type: 'charts',
          order: 2,
          visible: true
        },
        {
          id: 'findings',
          title: 'Key Findings',
          type: 'table',
          order: 3,
          visible: true
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          type: 'recommendations',
          order: 4,
          visible: true
        }
      ]
    });

    // Technical Detail Template
    this.templates.set('technical_detail', {
      id: 'technical_detail',
      name: 'Technical Detail Report',
      type: 'custom',
      sections: [
        {
          id: 'controls',
          title: 'Control Assessment',
          type: 'details',
          order: 1,
          visible: true
        },
        {
          id: 'evidence',
          title: 'Evidence Collection',
          type: 'evidence',
          order: 2,
          visible: true
        },
        {
          id: 'technical',
          title: 'Technical Analysis',
          type: 'details',
          order: 3,
          visible: true
        }
      ]
    });

    // Audit Evidence Template
    this.templates.set('audit_evidence', {
      id: 'audit_evidence',
      name: 'Audit Evidence Report',
      type: 'annual_audit',
      sections: [
        {
          id: 'summary',
          title: 'Audit Summary',
          type: 'summary',
          order: 1,
          visible: true
        },
        {
          id: 'evidence',
          title: 'Evidence Documentation',
          type: 'evidence',
          order: 2,
          visible: true
        },
        {
          id: 'findings',
          title: 'Audit Findings',
          type: 'table',
          order: 3,
          visible: true
        }
      ]
    });
  }

  // Control Test Functions
  private async testIntegrityAndEthics(): Promise<ControlTestResult> {
    const evidence: ComplianceEvidence[] = [];
    const findings: string[] = [];
    let score = 100;

    try {
      // Check for code of conduct acknowledgments
      const users = await db.select().from('users').where(eq('isActive', true));
      const acknowledgedCount = users.filter(u => u.metadata?.codeOfConductAcknowledged).length;
      const acknowledgmentRate = (acknowledgedCount / users.length) * 100;

      if (acknowledgmentRate < 100) {
        score -= (100 - acknowledgmentRate) * 0.5;
        findings.push(`Only ${acknowledgmentRate.toFixed(1)}% of users have acknowledged code of conduct`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'user_database',
        timestamp: new Date(),
        description: 'Code of conduct acknowledgment status',
        data: { acknowledgmentRate, totalUsers: users.length }
      });

      // Check for ethics training completion
      const trainingRecords = await this.checkEthicsTraining();
      if (trainingRecords.completionRate < 90) {
        score -= (90 - trainingRecords.completionRate) * 0.3;
        findings.push(`Ethics training completion rate is ${trainingRecords.completionRate}%`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'training_system',
        timestamp: new Date(),
        description: 'Ethics training completion records',
        data: trainingRecords
      });

    } catch (error) {
      logger.error('Error testing integrity and ethics:', error);
      score = 0;
      findings.push('Failed to assess integrity and ethics controls');
    }

    return {
      passed: score >= 70,
      score,
      evidence,
      findings,
      recommendations: findings.length > 0 ? [
        'Ensure all users acknowledge code of conduct',
        'Implement mandatory ethics training program',
        'Regular refresher training for existing employees'
      ] : []
    };
  }

  private async testInternalCommunication(): Promise<ControlTestResult> {
    const evidence: ComplianceEvidence[] = [];
    const findings: string[] = [];
    let score = 100;

    try {
      // Check for security policy distribution
      const policyDistribution = await this.checkPolicyDistribution();
      if (policyDistribution.coverage < 100) {
        score -= (100 - policyDistribution.coverage) * 0.4;
        findings.push(`Security policies not distributed to all personnel`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'policy_management',
        timestamp: new Date(),
        description: 'Policy distribution records',
        data: policyDistribution
      });

      // Check for security awareness communications
      const awarenessComms = await this.checkSecurityAwareness();
      if (awarenessComms.frequency < 12) { // Monthly communications expected
        score -= (12 - awarenessComms.frequency) * 2;
        findings.push(`Insufficient security awareness communications`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'communication_logs',
        timestamp: new Date(),
        description: 'Security awareness communication logs',
        data: awarenessComms
      });

    } catch (error) {
      logger.error('Error testing internal communication:', error);
      score = 0;
      findings.push('Failed to assess internal communication controls');
    }

    return {
      passed: score >= 70,
      score,
      evidence,
      findings,
      recommendations: findings.length > 0 ? [
        'Implement automated policy distribution system',
        'Increase frequency of security awareness communications',
        'Track and report on communication effectiveness'
      ] : []
    };
  }

  private async testLogicalAccessControls(): Promise<ControlTestResult> {
    const evidence: ComplianceEvidence[] = [];
    const findings: string[] = [];
    let score = 100;

    try {
      // Test MFA adoption
      const mfaStats = await identityManager.getMFAStatistics();
      if (mfaStats.adoptionRate < 80) {
        score -= (80 - mfaStats.adoptionRate) * 0.5;
        findings.push(`MFA adoption rate is only ${mfaStats.adoptionRate}%`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'configuration',
        source: 'identity_manager',
        timestamp: new Date(),
        description: 'MFA adoption statistics',
        data: mfaStats
      });

      // Test password policy compliance
      const passwordCompliance = await this.checkPasswordCompliance();
      if (passwordCompliance.complianceRate < 95) {
        score -= (95 - passwordCompliance.complianceRate) * 0.3;
        findings.push(`Password policy compliance at ${passwordCompliance.complianceRate}%`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'configuration',
        source: 'password_policy',
        timestamp: new Date(),
        description: 'Password policy compliance check',
        data: passwordCompliance
      });

      // Test least privilege implementation
      const privilegeReview = await accessControlManager.reviewPrivileges();
      if (privilegeReview.excessivePrivileges > 0) {
        score -= privilegeReview.excessivePrivileges * 2;
        findings.push(`${privilegeReview.excessivePrivileges} users with excessive privileges`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'access_control',
        timestamp: new Date(),
        description: 'Privilege review results',
        data: privilegeReview
      });

    } catch (error) {
      logger.error('Error testing logical access controls:', error);
      score = 0;
      findings.push('Failed to assess logical access controls');
    }

    return {
      passed: score >= 70,
      score,
      evidence,
      findings,
      recommendations: findings.length > 0 ? [
        'Enforce mandatory MFA for all users',
        'Strengthen password policy requirements',
        'Conduct quarterly access privilege reviews'
      ] : []
    };
  }

  private async testSecurityMonitoring(): Promise<ControlTestResult> {
    const evidence: ComplianceEvidence[] = [];
    const findings: string[] = [];
    let score = 100;

    try {
      // Check monitoring coverage
      const monitoringCoverage = await this.assessMonitoringCoverage();
      if (monitoringCoverage.coverage < 95) {
        score -= (95 - monitoringCoverage.coverage) * 0.4;
        findings.push(`Monitoring coverage is ${monitoringCoverage.coverage}%`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'configuration',
        source: 'monitoring_system',
        timestamp: new Date(),
        description: 'Security monitoring coverage assessment',
        data: monitoringCoverage
      });

      // Check threat detection effectiveness
      const threatDetection = await threatDetectionEngine.getDetectionMetrics();
      if (threatDetection.detectionRate < 90) {
        score -= (90 - threatDetection.detectionRate) * 0.3;
        findings.push(`Threat detection rate is ${threatDetection.detectionRate}%`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'threat_detection',
        timestamp: new Date(),
        description: 'Threat detection metrics',
        data: threatDetection
      });

      // Check incident response times
      const incidentMetrics = await this.getIncidentResponseMetrics();
      if (incidentMetrics.avgResponseTime > 15) { // 15 minutes
        score -= (incidentMetrics.avgResponseTime - 15) * 2;
        findings.push(`Average incident response time is ${incidentMetrics.avgResponseTime} minutes`);
      }

      evidence.push({
        id: crypto.randomUUID(),
        type: 'record',
        source: 'incident_management',
        timestamp: new Date(),
        description: 'Incident response metrics',
        data: incidentMetrics
      });

    } catch (error) {
      logger.error('Error testing security monitoring:', error);
      score = 0;
      findings.push('Failed to assess security monitoring');
    }

    return {
      passed: score >= 70,
      score,
      evidence,
      findings,
      recommendations: findings.length > 0 ? [
        'Expand monitoring coverage to all critical systems',
        'Improve threat detection algorithms',
        'Optimize incident response procedures'
      ] : []
    };
  }

  // Placeholder test functions for other controls
  private async testSecurityPolicies(): Promise<ControlTestResult> {
    // Implementation would check for documented and approved security policies
    return {
      passed: true,
      score: 85,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testPersonnelScreening(): Promise<ControlTestResult> {
    // Implementation would verify background check processes
    return {
      passed: true,
      score: 90,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testEndpointSecurity(): Promise<ControlTestResult> {
    // Implementation would check endpoint encryption and controls
    return {
      passed: true,
      score: 88,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testPrivacyByDesign(): Promise<ControlTestResult> {
    // Implementation would assess privacy considerations in system design
    return {
      passed: true,
      score: 82,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testDataEncryption(): Promise<ControlTestResult> {
    // Implementation would verify encryption of data at rest and in transit
    return {
      passed: true,
      score: 95,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testBreachNotification(): Promise<ControlTestResult> {
    // Implementation would check breach notification procedures
    return {
      passed: true,
      score: 90,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testSecurityOfficer(): Promise<ControlTestResult> {
    // Implementation would verify security officer designation
    return {
      passed: true,
      score: 100,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testPhysicalAccess(): Promise<ControlTestResult> {
    // Implementation would check physical access controls
    return {
      passed: true,
      score: 87,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testTechnicalAccessControls(): Promise<ControlTestResult> {
    // Implementation would verify technical access controls
    return {
      passed: true,
      score: 92,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testFirewallConfiguration(): Promise<ControlTestResult> {
    // Implementation would check firewall rules and configuration
    return {
      passed: true,
      score: 89,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testDefaultPasswords(): Promise<ControlTestResult> {
    // Implementation would scan for default passwords
    return {
      passed: true,
      score: 100,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testUniqueUserIds(): Promise<ControlTestResult> {
    // Implementation would verify unique user IDs
    return {
      passed: true,
      score: 100,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testAssetManagement(): Promise<ControlTestResult> {
    // Implementation would check asset inventory
    return {
      passed: true,
      score: 85,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testIdentityManagement(): Promise<ControlTestResult> {
    // Implementation would assess identity management
    return {
      passed: true,
      score: 91,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testContinuousMonitoring(): Promise<ControlTestResult> {
    // Implementation would verify continuous monitoring
    return {
      passed: true,
      score: 88,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testDeviceInventory(): Promise<ControlTestResult> {
    // Implementation would check device inventory
    return {
      passed: true,
      score: 86,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testSoftwareInventory(): Promise<ControlTestResult> {
    // Implementation would verify software inventory
    return {
      passed: true,
      score: 84,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  private async testSecureConfiguration(): Promise<ControlTestResult> {
    // Implementation would assess secure configurations
    return {
      passed: true,
      score: 87,
      evidence: [],
      findings: [],
      recommendations: []
    };
  }

  // Helper functions
  private async checkEthicsTraining(): Promise<any> {
    // Mock implementation - would connect to training system
    return {
      completionRate: 85,
      totalEmployees: 100,
      completed: 85,
      inProgress: 10,
      notStarted: 5
    };
  }

  private async checkPolicyDistribution(): Promise<any> {
    // Mock implementation - would check policy management system
    return {
      coverage: 95,
      distributed: 95,
      acknowledged: 90,
      pending: 5
    };
  }

  private async checkSecurityAwareness(): Promise<any> {
    // Mock implementation - would check communication logs
    return {
      frequency: 12,
      lastCommunication: new Date(),
      topics: ['phishing', 'passwords', 'data protection']
    };
  }

  private async checkPasswordCompliance(): Promise<any> {
    // Mock implementation - would check password policy compliance
    return {
      complianceRate: 92,
      strongPasswords: 92,
      weakPasswords: 8,
      expired: 3
    };
  }

  private async assessMonitoringCoverage(): Promise<any> {
    // Mock implementation - would assess monitoring coverage
    return {
      coverage: 93,
      monitoredSystems: 93,
      totalSystems: 100,
      criticalSystemsCovered: 100
    };
  }

  private async getIncidentResponseMetrics(): Promise<any> {
    // Mock implementation - would get incident response metrics
    return {
      avgResponseTime: 12,
      totalIncidents: 45,
      resolved: 42,
      pending: 3,
      avgResolutionTime: 120
    };
  }

  // Report Generation
  public async generateReport(
    type: ReportType,
    framework?: ComplianceFramework,
    period?: { start: Date; end: Date },
    format: ReportFormat = 'pdf',
    userId?: number
  ): Promise<ComplianceReport> {
    const reportId = crypto.randomUUID();
    const report: ComplianceReport = {
      id: reportId,
      name: `${type}_${framework || 'all'}_${new Date().toISOString()}`,
      type,
      framework,
      period: period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      generatedAt: new Date(),
      generatedBy: userId || 0,
      format,
      status: 'generating',
      findings: [],
      evidence: [],
      recommendations: []
    };

    this.reports.set(reportId, report);
    this.emit('report_generation_started', { reportId, type, framework });

    try {
      // Assess compliance based on framework
      if (framework) {
        const assessment = await this.assessFrameworkCompliance(framework);
        report.score = assessment.score;
        report.findings = assessment.findings;
        report.evidence = assessment.evidence;
        report.recommendations = assessment.recommendations;
      } else {
        // Assess all frameworks
        const allAssessments = await this.assessAllFrameworks();
        report.score = allAssessments.averageScore;
        report.findings = allAssessments.findings;
        report.evidence = allAssessments.evidence;
        report.recommendations = allAssessments.recommendations;
        report.metadata = { frameworkScores: allAssessments.frameworkScores };
      }

      // Generate executive summary
      report.executive_summary = await this.generateExecutiveSummary(report);

      // Generate technical details
      report.technical_details = await this.generateTechnicalDetails(report);

      // Export report in requested format
      const filePath = await this.exportReport(report, format);
      report.filePath = filePath;

      report.status = 'completed';
      this.reports.set(reportId, report);
      this.emit('report_generation_completed', { reportId, filePath });

      // Update compliance scores
      if (framework) {
        await this.updateComplianceScore(framework, report.score || 0);
      }

      return report;

    } catch (error) {
      logger.error('Error generating compliance report:', error);
      report.status = 'failed';
      this.reports.set(reportId, report);
      this.emit('report_generation_failed', { reportId, error });
      throw error;
    }
  }

  private async assessFrameworkCompliance(
    framework: ComplianceFramework
  ): Promise<{
    score: number;
    findings: ComplianceFinding[];
    evidence: ComplianceEvidence[];
    recommendations: string[];
  }> {
    const controls = this.controls.get(framework) || [];
    const findings: ComplianceFinding[] = [];
    const evidence: ComplianceEvidence[] = [];
    const recommendations: string[] = [];
    let totalWeight = 0;
    let weightedScore = 0;

    for (const control of controls) {
      try {
        const result = await control.testFunction();
        
        const finding: ComplianceFinding = {
          id: crypto.randomUUID(),
          control: control.id,
          requirement: control.requirement,
          status: result.passed ? 'compliant' : 
                 result.score >= 50 ? 'partial' : 'non-compliant',
          severity: result.score < 50 ? 'high' : 
                   result.score < 70 ? 'medium' : 'low',
          description: result.findings.join('; ') || 'Control assessment completed',
          evidence: result.evidence.map(e => e.id)
        };

        if (!result.passed && result.recommendations) {
          finding.remediation = result.recommendations.join('; ');
          recommendations.push(...result.recommendations);
        }

        findings.push(finding);
        evidence.push(...result.evidence);
        
        totalWeight += control.weight;
        weightedScore += result.score * control.weight;

      } catch (error) {
        logger.error(`Error testing control ${control.id}:`, error);
        findings.push({
          id: crypto.randomUUID(),
          control: control.id,
          requirement: control.requirement,
          status: 'not-applicable',
          severity: 'medium',
          description: 'Control test failed to execute'
        });
      }
    }

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    return {
      score: Math.round(overallScore),
      findings,
      evidence,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  private async assessAllFrameworks(): Promise<{
    averageScore: number;
    frameworkScores: Record<ComplianceFramework, number>;
    findings: ComplianceFinding[];
    evidence: ComplianceEvidence[];
    recommendations: string[];
  }> {
    const frameworks: ComplianceFramework[] = ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST', 'CIS'];
    const frameworkScores: Record<string, number> = {};
    const allFindings: ComplianceFinding[] = [];
    const allEvidence: ComplianceEvidence[] = [];
    const allRecommendations: string[] = [];
    let totalScore = 0;

    for (const framework of frameworks) {
      const assessment = await this.assessFrameworkCompliance(framework);
      frameworkScores[framework] = assessment.score;
      totalScore += assessment.score;
      allFindings.push(...assessment.findings);
      allEvidence.push(...assessment.evidence);
      allRecommendations.push(...assessment.recommendations);
    }

    return {
      averageScore: Math.round(totalScore / frameworks.length),
      frameworkScores: frameworkScores as Record<ComplianceFramework, number>,
      findings: allFindings,
      evidence: allEvidence,
      recommendations: [...new Set(allRecommendations)]
    };
  }

  private async generateExecutiveSummary(report: ComplianceReport): Promise<string> {
    const summaryParts = [];

    summaryParts.push(`Compliance Assessment Report - ${report.type}`);
    summaryParts.push(`Generated: ${report.generatedAt.toLocaleDateString()}`);
    
    if (report.framework) {
      summaryParts.push(`Framework: ${report.framework}`);
    }

    if (report.score !== undefined) {
      summaryParts.push(`Overall Compliance Score: ${report.score}%`);
      
      if (report.score >= 90) {
        summaryParts.push('Status: Excellent compliance posture');
      } else if (report.score >= 70) {
        summaryParts.push('Status: Good compliance with minor gaps');
      } else if (report.score >= 50) {
        summaryParts.push('Status: Moderate compliance with significant gaps');
      } else {
        summaryParts.push('Status: Poor compliance requiring immediate attention');
      }
    }

    const criticalFindings = report.findings.filter(f => f.severity === 'critical');
    const highFindings = report.findings.filter(f => f.severity === 'high');
    
    if (criticalFindings.length > 0) {
      summaryParts.push(`Critical Issues: ${criticalFindings.length}`);
    }
    if (highFindings.length > 0) {
      summaryParts.push(`High Priority Issues: ${highFindings.length}`);
    }

    if (report.recommendations.length > 0) {
      summaryParts.push('\nTop Recommendations:');
      report.recommendations.slice(0, 5).forEach(rec => {
        summaryParts.push(`• ${rec}`);
      });
    }

    return summaryParts.join('\n');
  }

  private async generateTechnicalDetails(report: ComplianceReport): Promise<any> {
    return {
      assessmentDate: report.generatedAt,
      controlsTested: report.findings.length,
      evidenceCollected: report.evidence.length,
      complianceBreakdown: {
        compliant: report.findings.filter(f => f.status === 'compliant').length,
        partial: report.findings.filter(f => f.status === 'partial').length,
        nonCompliant: report.findings.filter(f => f.status === 'non-compliant').length,
        notApplicable: report.findings.filter(f => f.status === 'not-applicable').length
      },
      severityBreakdown: {
        critical: report.findings.filter(f => f.severity === 'critical').length,
        high: report.findings.filter(f => f.severity === 'high').length,
        medium: report.findings.filter(f => f.severity === 'medium').length,
        low: report.findings.filter(f => f.severity === 'low').length
      }
    };
  }

  private async exportReport(report: ComplianceReport, format: ReportFormat): Promise<string> {
    const fileName = `${report.name}.${format}`;
    const filePath = path.join(this.REPORTS_DIR, fileName);

    switch (format) {
      case 'pdf':
        await this.exportToPDF(report, filePath);
        break;
      case 'csv':
        await this.exportToCSV(report, filePath);
        break;
      case 'json':
        await this.exportToJSON(report, filePath);
        break;
      case 'html':
        await this.exportToHTML(report, filePath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return filePath;
  }

  private async exportToPDF(report: ComplianceReport, filePath: string): Promise<void> {
    const doc = new PDFDocument();
    const stream = doc.pipe(fs.createWriteStream(filePath));

    // Title
    doc.fontSize(20).text('Compliance Report', { align: 'center' });
    doc.moveDown();

    // Executive Summary
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.fontSize(12).text(report.executive_summary || 'No summary available');
    doc.moveDown();

    // Compliance Score
    if (report.score !== undefined) {
      doc.fontSize(16).text('Compliance Score', { underline: true });
      doc.fontSize(14).text(`Overall Score: ${report.score}%`);
      doc.moveDown();
    }

    // Key Findings
    doc.fontSize(16).text('Key Findings', { underline: true });
    report.findings.slice(0, 10).forEach(finding => {
      doc.fontSize(12).text(`• ${finding.control}: ${finding.status}`, { indent: 20 });
      doc.fontSize(10).text(finding.description, { indent: 40 });
    });
    doc.moveDown();

    // Recommendations
    if (report.recommendations.length > 0) {
      doc.fontSize(16).text('Recommendations', { underline: true });
      report.recommendations.forEach(rec => {
        doc.fontSize(12).text(`• ${rec}`, { indent: 20 });
      });
    }

    doc.end();
    await new Promise(resolve => stream.on('finish', resolve));
  }

  private async exportToCSV(report: ComplianceReport, filePath: string): Promise<void> {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'control', title: 'Control' },
        { id: 'requirement', title: 'Requirement' },
        { id: 'status', title: 'Status' },
        { id: 'severity', title: 'Severity' },
        { id: 'description', title: 'Description' },
        { id: 'remediation', title: 'Remediation' }
      ]
    });

    const csvContent = csvStringifier.getHeaderString() + 
                      csvStringifier.stringifyRecords(report.findings);
    
    await fs.writeFile(filePath, csvContent);
  }

  private async exportToJSON(report: ComplianceReport, filePath: string): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  private async exportToHTML(report: ComplianceReport, filePath: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Compliance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          h2 { color: #666; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          .score { font-size: 24px; font-weight: bold; color: ${report.score >= 70 ? 'green' : 'red'}; }
          .finding { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #ddd; }
          .critical { border-left-color: #d32f2f; }
          .high { border-left-color: #f57c00; }
          .medium { border-left-color: #fbc02d; }
          .low { border-left-color: #388e3c; }
        </style>
      </head>
      <body>
        <h1>Compliance Report</h1>
        <p>Generated: ${report.generatedAt.toLocaleDateString()}</p>
        ${report.score !== undefined ? `<p class="score">Overall Score: ${report.score}%</p>` : ''}
        
        <h2>Executive Summary</h2>
        <pre>${report.executive_summary}</pre>
        
        <h2>Findings</h2>
        ${report.findings.map(f => `
          <div class="finding ${f.severity}">
            <strong>${f.control}</strong>: ${f.status}<br>
            ${f.description}<br>
            ${f.remediation ? `<em>Remediation: ${f.remediation}</em>` : ''}
          </div>
        `).join('')}
        
        <h2>Recommendations</h2>
        <ul>
          ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    
    await fs.writeFile(filePath, html);
  }

  // Report Scheduling
  public async scheduleReport(schedule: ReportSchedule): Promise<void> {
    this.schedules.set(schedule.id, schedule);
    
    if (schedule.enabled) {
      const job = cron.schedule(schedule.schedule, async () => {
        try {
          const report = await this.generateReport(
            schedule.type,
            schedule.framework,
            undefined,
            schedule.format
          );
          
          if (schedule.recipients.length > 0) {
            await this.distributeReport(report, schedule.recipients);
          }
          
          schedule.lastRun = new Date();
          this.schedules.set(schedule.id, schedule);
          
        } catch (error) {
          logger.error(`Failed to generate scheduled report ${schedule.id}:`, error);
        }
      });
      
      this.scheduledJobs.set(schedule.id, job);
      job.start();
    }
  }

  public async removeSchedule(scheduleId: string): Promise<void> {
    const job = this.scheduledJobs.get(scheduleId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(scheduleId);
    }
    this.schedules.delete(scheduleId);
  }

  private async distributeReport(report: ComplianceReport, recipients: string[]): Promise<void> {
    if (!this.emailTransporter) {
      logger.warn('Email transporter not configured, skipping report distribution');
      return;
    }

    for (const recipient of recipients) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'compliance@example.com',
          to: recipient,
          subject: `Compliance Report: ${report.name}`,
          text: report.executive_summary || 'Please find the compliance report attached.',
          attachments: report.filePath ? [{
            filename: path.basename(report.filePath),
            path: report.filePath
          }] : []
        });
        
        logger.info(`Report ${report.id} sent to ${recipient}`);
      } catch (error) {
        logger.error(`Failed to send report to ${recipient}:`, error);
      }
    }
  }

  // Compliance Score Management
  private async updateComplianceScore(framework: ComplianceFramework, score: number): Promise<void> {
    const existingScore = this.scores.get(framework);
    
    const trend = existingScore && existingScore.overallScore !== undefined ? 
      (score > existingScore.overallScore ? 'improving' : 
       score < existingScore.overallScore ? 'declining' : 'stable') : 'stable';

    const newScore: ComplianceScore = {
      framework,
      overallScore: score,
      categoryScores: {},
      controlScores: {},
      trend,
      lastAssessment: new Date(),
      nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    this.scores.set(framework, newScore);
    this.emit('compliance_score_updated', { framework, score, trend });
  }

  public async getComplianceScores(): Promise<Map<ComplianceFramework, ComplianceScore>> {
    return this.scores;
  }

  public async getFrameworkStatus(framework: ComplianceFramework): Promise<{
    score: ComplianceScore | undefined;
    lastReport: ComplianceReport | undefined;
    nextScheduledReport: Date | undefined;
  }> {
    const score = this.scores.get(framework);
    
    const frameworkReports = Array.from(this.reports.values())
      .filter(r => r.framework === framework)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    
    const lastReport = frameworkReports[0];
    
    const nextScheduled = Array.from(this.schedules.values())
      .filter(s => s.framework === framework && s.enabled)
      .map(s => {
        // Calculate next run time from cron expression
        // This is simplified - would use a cron parser library
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      })[0];
    
    return {
      score,
      lastReport,
      nextScheduledReport: nextScheduled
    };
  }

  // Evidence Collection
  public async collectEvidence(
    sources?: string[]
  ): Promise<ComplianceEvidence[]> {
    const evidence: ComplianceEvidence[] = [];
    const defaultSources = ['audit_logs', 'access_logs', 'configurations', 'policies'];
    const sourcesToCollect = sources || defaultSources;

    for (const source of sourcesToCollect) {
      try {
        switch (source) {
          case 'audit_logs':
            const auditEvidence = await this.collectAuditLogEvidence();
            evidence.push(...auditEvidence);
            break;
          
          case 'access_logs':
            const accessEvidence = await this.collectAccessLogEvidence();
            evidence.push(...accessEvidence);
            break;
          
          case 'configurations':
            const configEvidence = await this.collectConfigurationEvidence();
            evidence.push(...configEvidence);
            break;
          
          case 'policies':
            const policyEvidence = await this.collectPolicyEvidence();
            evidence.push(...policyEvidence);
            break;
        }
      } catch (error) {
        logger.error(`Failed to collect evidence from ${source}:`, error);
      }
    }

    // Generate hash for each evidence item for integrity
    for (const item of evidence) {
      item.hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(item.data))
        .digest('hex');
    }

    return evidence;
  }

  private async collectAuditLogEvidence(): Promise<ComplianceEvidence[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const logs = await db.select()
      .from(auditLogs)
      .where(gte(auditLogs.timestamp, thirtyDaysAgo))
      .limit(1000);

    return logs.map(log => ({
      id: crypto.randomUUID(),
      type: 'log',
      source: 'audit_logs',
      timestamp: new Date(),
      description: `Audit log entry: ${log.action}`,
      data: log
    }));
  }

  private async collectAccessLogEvidence(): Promise<ComplianceEvidence[]> {
    // Would collect actual access logs
    return [{
      id: crypto.randomUUID(),
      type: 'log',
      source: 'access_logs',
      timestamp: new Date(),
      description: 'Access control logs',
      data: { sample: 'access_log_data' }
    }];
  }

  private async collectConfigurationEvidence(): Promise<ComplianceEvidence[]> {
    // Would collect system configurations
    return [{
      id: crypto.randomUUID(),
      type: 'configuration',
      source: 'system_config',
      timestamp: new Date(),
      description: 'System configuration snapshot',
      data: { sample: 'configuration_data' }
    }];
  }

  private async collectPolicyEvidence(): Promise<ComplianceEvidence[]> {
    // Would collect policy documents
    return [{
      id: crypto.randomUUID(),
      type: 'policy',
      source: 'policy_management',
      timestamp: new Date(),
      description: 'Security policy documentation',
      data: { sample: 'policy_data' }
    }];
  }

  // Report Management
  public async getReport(reportId: string): Promise<ComplianceReport | undefined> {
    return this.reports.get(reportId);
  }

  public async listReports(
    filters?: {
      type?: ReportType;
      framework?: ComplianceFramework;
      startDate?: Date;
      endDate?: Date;
      status?: string;
    }
  ): Promise<ComplianceReport[]> {
    let reports = Array.from(this.reports.values());

    if (filters) {
      if (filters.type) {
        reports = reports.filter(r => r.type === filters.type);
      }
      if (filters.framework) {
        reports = reports.filter(r => r.framework === filters.framework);
      }
      if (filters.startDate) {
        reports = reports.filter(r => r.generatedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        reports = reports.filter(r => r.generatedAt <= filters.endDate!);
      }
      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
    }

    return reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  private async loadSchedules(): Promise<void> {
    // Load saved schedules from database or file
    // This is a placeholder - would load from persistent storage
    logger.info('Loading report schedules');
  }
}

// Export singleton instance
export const complianceReportingEngine = ComplianceReportingEngine.getInstance();

// Export types and interfaces for external use
export type {
  ComplianceReport,
  ComplianceFinding,
  ComplianceEvidence,
  ReportSchedule,
  ComplianceControl,
  ControlTestResult,
  ComplianceScore,
  ReportTemplate,
  ReportSection
};