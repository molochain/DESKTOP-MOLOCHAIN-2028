import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../core/database/db.service';
import { 
  collaborationSessions, 
  collaborationParticipants, 
  collaborationMessages 
} from '@db/schema';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest } from '../../utils/validate-request';
import { logger } from '../../utils/logger';
import { requireAuth } from '../../middleware/auth';
import { isAuthenticated } from '../../core/auth/auth.service';
import { APIError } from '../../utils/unified-error-handler';

const router = Router();

// Schema for creating a new collaboration session
const createSessionSchema = z.object({
  body: z.object({
    projectId: z.number({
      required_error: 'Project ID is required',
      invalid_type_error: 'Project ID must be a number'
    }),
    name: z.string({
      required_error: 'Session name is required'
    }).min(3).max(100)
  })
});

// Schema for updating a session status
const updateSessionSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'paused', 'completed'])
  }),
  params: z.object({
    id: z.string().transform(val => parseInt(val))
  })
});

/**
 * Get all collaboration sessions for a project
 * GET /api/projects/:projectId/collaboration
 */
router.get('/projects/:projectId/collaboration', isAuthenticated, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    // Get all sessions for this project
    const sessions = await db.select()
      .from(collaborationSessions)
      .where(eq(collaborationSessions.projectId, projectId))
      .orderBy(desc(collaborationSessions.updatedAt));
    
    return res.json(sessions);
  } catch (error) {
    logger.error('Error fetching collaboration sessions', { error });
    next(error);
  }
});

/**
 * Get a specific collaboration session
 * GET /api/collaboration/sessions/:id
 */
router.get('/collaboration/sessions/:id', isAuthenticated, async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Get the session
    const [session] = await db.select()
      .from(collaborationSessions)
      .where(eq(collaborationSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      throw new APIError('Collaboration session not found', 404, 'NOT_FOUND');
    }
    
    // Return messages in chronological order (oldest first)
    if (session.messages && Array.isArray(session.messages)) {
      (session.messages as any[]).reverse();
    }
    
    return res.json(session);
  } catch (error) {
    logger.error('Error fetching collaboration session', { error });
    next(error);
  }
});

/**
 * Create a new collaboration session
 * POST /api/projects/:projectId/collaboration
 */
router.post(
  '/projects/:projectId/collaboration',
  isAuthenticated,
  validateRequest(createSessionSchema),
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const projectId = parseInt(req.params.projectId);
      const userId = (req.user as any).id;
      
      // Create a new session
      const [session] = await db.insert(collaborationSessions)
        .values({
          projectId,
          name,
          status: 'active',
          createdById: userId
        })
        .returning();
      
      // Add the creator as a participant with host role
      await db.insert(collaborationParticipants)
        .values({
          sessionId: session.id,
          userId,
          role: 'host',
          isActive: true
        });
      
      logger.info('Collaboration session created', { 
        sessionId: session.id, 
        projectId,
        userId 
      });
      
      return res.status(201).json(session);
    } catch (error) {
      logger.error('Error creating collaboration session', { error });
      next(error);
    }
  }
);

/**
 * Update a collaboration session status
 * PATCH /api/collaboration/sessions/:id
 */
router.patch(
  '/collaboration/sessions/:id',
  isAuthenticated,
  validateRequest(updateSessionSchema),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const sessionId = parseInt(req.params.id);
      
      // Check if the session exists
      const [existingSession] = await db.select()
        .from(collaborationSessions)
        .where(eq(collaborationSessions.id, sessionId))
        .limit(1);
      
      if (!existingSession) {
        throw new APIError('Collaboration session not found', 404, 'NOT_FOUND');
      }
      
      // Update the session status
      const [updatedSession] = await db.update(collaborationSessions)
        .set({
          status,
          updatedAt: new Date(),
          ...(status === 'completed' ? { endedAt: new Date() } : {})
        })
        .where(eq(collaborationSessions.id, sessionId))
        .returning();
      
      logger.info('Collaboration session updated', {
        sessionId,
        status,
        userId: (req.user as any).id
      });
      
      return res.json(updatedSession);
    } catch (error) {
      logger.error('Error updating collaboration session', { error });
      next(error);
    }
  }
);

/**
 * Get messages for a collaboration session
 * GET /api/collaboration/sessions/:id/messages
 */
router.get('/collaboration/sessions/:id/messages', isAuthenticated, async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Get pagination parameters with defaults
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before 
      ? new Date(req.query.before as string) 
      : new Date();
    
    // Get messages for this session with pagination
    const messages = await db.select()
      .from(collaborationMessages)
      .where(eq(collaborationMessages.sessionId, sessionId))
      .orderBy(desc(collaborationMessages.sentAt))
      .limit(limit);
    
    // Sort messages in ascending order (oldest first)
    messages.reverse();
    
    return res.json(messages);
  } catch (error) {
    logger.error('Error fetching collaboration messages', { error });
    next(error);
  }
});

/**
 * Get participants in a collaboration session
 * GET /api/collaboration/sessions/:id/participants
 */
router.get('/collaboration/sessions/:id/participants', isAuthenticated, async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Get participants for this session
    const participants = await db.select()
      .from(collaborationParticipants)
      .where(eq(collaborationParticipants.sessionId, sessionId));
    
    return res.json(participants);
  } catch (error) {
    logger.error('Error fetching collaboration participants', { error });
    next(error);
  }
});

export default router;