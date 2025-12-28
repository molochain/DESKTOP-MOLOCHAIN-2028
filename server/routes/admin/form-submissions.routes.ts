import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { contactSubmissions, formTypes } from '../../../shared/schema';
import { eq, and, gte, lte, sql, count, desc } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '../../utils/logger';

const router = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  formType: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'responded', 'closed']),
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [statusCounts, formTypeCounts, totalCount] = await Promise.all([
      db.select({
        status: contactSubmissions.status,
        count: count(),
      })
        .from(contactSubmissions)
        .groupBy(contactSubmissions.status),

      db.select({
        formTypeId: contactSubmissions.formTypeId,
        formTypeName: formTypes.name,
        count: count(),
      })
        .from(contactSubmissions)
        .leftJoin(formTypes, eq(contactSubmissions.formTypeId, formTypes.id))
        .groupBy(contactSubmissions.formTypeId, formTypes.name),

      db.select({ count: count() }).from(contactSubmissions),
    ]);

    const byStatus = statusCounts.reduce((acc, item) => {
      acc[item.status || 'unknown'] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const byFormType = formTypeCounts.map(item => ({
      formTypeId: item.formTypeId,
      formTypeName: item.formTypeName || 'Unknown',
      count: Number(item.count),
    }));

    res.json({
      success: true,
      data: {
        total: Number(totalCount[0]?.count || 0),
        byStatus,
        byFormType,
      },
    });
  } catch (error) {
    logger.error('Failed to get submission stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submission statistics',
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const query = paginationSchema.parse(req.query);
    const { page, limit, formType, status, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (formType) {
      conditions.push(eq(contactSubmissions.formTypeId, formType));
    }

    if (status) {
      conditions.push(eq(contactSubmissions.status, status));
    }

    if (startDate) {
      conditions.push(gte(contactSubmissions.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(contactSubmissions.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [submissions, totalResult] = await Promise.all([
      db.select({
        id: contactSubmissions.id,
        name: contactSubmissions.name,
        email: contactSubmissions.email,
        subject: contactSubmissions.subject,
        message: contactSubmissions.message,
        status: contactSubmissions.status,
        formTypeId: contactSubmissions.formTypeId,
        formTypeName: formTypes.name,
        createdAt: contactSubmissions.createdAt,
      })
        .from(contactSubmissions)
        .leftJoin(formTypes, eq(contactSubmissions.formTypeId, formTypes.id))
        .where(whereClause)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() })
        .from(contactSubmissions)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to get submissions', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID',
      });
    }

    const [submission] = await db.select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      email: contactSubmissions.email,
      subject: contactSubmissions.subject,
      message: contactSubmissions.message,
      status: contactSubmissions.status,
      formTypeId: contactSubmissions.formTypeId,
      formTypeName: formTypes.name,
      createdAt: contactSubmissions.createdAt,
    })
      .from(contactSubmissions)
      .leftJoin(formTypes, eq(contactSubmissions.formTypeId, formTypes.id))
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error('Failed to get submission', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submission',
    });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID',
      });
    }

    const body = statusUpdateSchema.parse(req.body);

    const [existing] = await db.select({ id: contactSubmissions.id })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    await db.update(contactSubmissions)
      .set({ status: body.status })
      .where(eq(contactSubmissions.id, id));

    logger.info('Submission status updated', { submissionId: id, newStatus: body.status });

    res.json({
      success: true,
      data: {
        id,
        status: body.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to update submission status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update submission status',
    });
  }
});

export default router;
