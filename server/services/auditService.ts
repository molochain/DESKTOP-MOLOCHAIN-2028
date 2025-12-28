import { db } from '../db';
import { adminActivityLogs, users } from '../../shared/schema';
import { eq, desc, and, gte, lte, count, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

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
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  } | null;
}

export async function logAdminAction(data: AuditLogData): Promise<void> {
  try {
    await db.insert(adminActivityLogs).values({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      status: data.status || 'success',
    });
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
}

export async function getAuditLogs(filters: AuditFilters): Promise<{ logs: AuditLogWithUser[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];

  if (filters.userId) {
    conditions.push(eq(adminActivityLogs.userId, filters.userId));
  }
  if (filters.action) {
    conditions.push(eq(adminActivityLogs.action, filters.action));
  }
  if (filters.entityType) {
    conditions.push(eq(adminActivityLogs.entityType, filters.entityType));
  }
  if (filters.status) {
    conditions.push(eq(adminActivityLogs.status, filters.status));
  }
  if (filters.startDate) {
    conditions.push(gte(adminActivityLogs.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(adminActivityLogs.createdAt, filters.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, totalResult] = await Promise.all([
    db
      .select({
        id: adminActivityLogs.id,
        userId: adminActivityLogs.userId,
        action: adminActivityLogs.action,
        entityType: adminActivityLogs.entityType,
        entityId: adminActivityLogs.entityId,
        details: adminActivityLogs.details,
        ipAddress: adminActivityLogs.ipAddress,
        userAgent: adminActivityLogs.userAgent,
        status: adminActivityLogs.status,
        createdAt: adminActivityLogs.createdAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
        },
      })
      .from(adminActivityLogs)
      .leftJoin(users, eq(adminActivityLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(adminActivityLogs)
      .where(whereClause),
  ]);

  return {
    logs: logs as AuditLogWithUser[],
    total: totalResult[0]?.count || 0,
  };
}

export async function getAuditLogById(id: number): Promise<AuditLogWithUser | null> {
  const result = await db
    .select({
      id: adminActivityLogs.id,
      userId: adminActivityLogs.userId,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      details: adminActivityLogs.details,
      ipAddress: adminActivityLogs.ipAddress,
      userAgent: adminActivityLogs.userAgent,
      status: adminActivityLogs.status,
      createdAt: adminActivityLogs.createdAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
      },
    })
    .from(adminActivityLogs)
    .leftJoin(users, eq(adminActivityLogs.userId, users.id))
    .where(eq(adminActivityLogs.id, id))
    .limit(1);

  return (result[0] as AuditLogWithUser) || null;
}

export async function getRecentActions(userId: number, limit: number = 10): Promise<AuditLogWithUser[]> {
  const result = await db
    .select({
      id: adminActivityLogs.id,
      userId: adminActivityLogs.userId,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      details: adminActivityLogs.details,
      ipAddress: adminActivityLogs.ipAddress,
      userAgent: adminActivityLogs.userAgent,
      status: adminActivityLogs.status,
      createdAt: adminActivityLogs.createdAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
      },
    })
    .from(adminActivityLogs)
    .leftJoin(users, eq(adminActivityLogs.userId, users.id))
    .where(eq(adminActivityLogs.userId, userId))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(limit);

  return result as AuditLogWithUser[];
}

export async function getActionSummary(startDate?: Date, endDate?: Date): Promise<{
  totalActions: number;
  byAction: { action: string; count: number }[];
  byEntityType: { entityType: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byUser: { userId: number; username: string; count: number }[];
}> {
  const conditions: any[] = [];

  if (startDate) {
    conditions.push(gte(adminActivityLogs.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(adminActivityLogs.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult, byActionResult, byEntityTypeResult, byStatusResult, byUserResult] = await Promise.all([
    db.select({ count: count() }).from(adminActivityLogs).where(whereClause),
    db
      .select({
        action: adminActivityLogs.action,
        count: count(),
      })
      .from(adminActivityLogs)
      .where(whereClause)
      .groupBy(adminActivityLogs.action)
      .orderBy(desc(count())),
    db
      .select({
        entityType: adminActivityLogs.entityType,
        count: count(),
      })
      .from(adminActivityLogs)
      .where(whereClause)
      .groupBy(adminActivityLogs.entityType)
      .orderBy(desc(count())),
    db
      .select({
        status: adminActivityLogs.status,
        count: count(),
      })
      .from(adminActivityLogs)
      .where(whereClause)
      .groupBy(adminActivityLogs.status),
    db
      .select({
        userId: adminActivityLogs.userId,
        username: users.username,
        count: count(),
      })
      .from(adminActivityLogs)
      .leftJoin(users, eq(adminActivityLogs.userId, users.id))
      .where(whereClause)
      .groupBy(adminActivityLogs.userId, users.username)
      .orderBy(desc(count()))
      .limit(10),
  ]);

  return {
    totalActions: totalResult[0]?.count || 0,
    byAction: byActionResult.map((r: { action: string; count: number }) => ({ action: r.action, count: r.count })),
    byEntityType: byEntityTypeResult.map((r: { entityType: string; count: number }) => ({ entityType: r.entityType, count: r.count })),
    byStatus: byStatusResult.map((r: { status: string | null; count: number }) => ({ status: r.status || 'unknown', count: r.count })),
    byUser: byUserResult.map((r: { userId: number; username: string | null; count: number }) => ({ userId: r.userId, username: r.username || 'unknown', count: r.count })),
  };
}
