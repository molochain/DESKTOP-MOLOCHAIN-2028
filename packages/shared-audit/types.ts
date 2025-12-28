/**
 * Shared Audit Types
 * TypeScript interfaces and types for audit logging across services
 */

export interface AuditLogData {
  userId: number;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: 'success' | 'error';
}

export interface AuditFilters {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AuditUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface AuditLogWithUser {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string | null;
  createdAt: Date | null;
  user?: AuditUser | null;
}

export interface AuditLogEntry {
  id: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  tags?: string[];
  timestamp: Date;
}

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditActionSummary {
  totalActions: number;
  byAction: { action: string; count: number }[];
  byEntityType: { entityType: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byUser: { userId: number; username: string; count: number }[];
}

export interface ComplianceAuditData {
  userId: number;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  tags: string[];
}
