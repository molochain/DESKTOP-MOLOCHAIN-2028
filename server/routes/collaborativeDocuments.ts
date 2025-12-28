/**
 * Collaborative Documents Router
 * 
 * This module provides API endpoints for creating, sharing and working with
 * collaborative Google Drive documents.
 */

import express from 'express';
import { z } from 'zod';
import { 
  createCollaborativeDocument, 
  shareCollaborativeDocument, 
  getCollaborativeDocumentUrl,
  listCollaborativeDocuments,
  GoogleDocType,
  DocumentPermission
} from '../utils/driveCollaboration';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.nativeEnum(GoogleDocType),
  folderId: z.string().optional(),
});

const shareDocumentSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  permissions: z.array(
    z.object({
      type: z.enum(['user', 'group', 'domain', 'anyone']),
      role: z.enum(['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader']),
      emailAddress: z.string().email().optional(),
      domain: z.string().optional(),
    })
  ),
  sendNotifications: z.boolean().default(false),
});

/**
 * GET /api/collaborative-documents
 * List collaborative documents
 */
router.get('/', async (req, res) => {
  try {
    const { type, folderId } = req.query;
    
    // Validate type if provided
    let docType: GoogleDocType | undefined;
    if (type) {
      const typeValues = Object.values(GoogleDocType) as string[];
      if (typeValues.includes(type as string)) {
        docType = type as GoogleDocType;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid document type. Must be one of: ${typeValues.join(', ')}`
        });
      }
    }
    
    const documents = await listCollaborativeDocuments(docType, folderId as string | undefined);
    
    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    logger.error('Error listing collaborative documents:', error);
    res.status(500).json({
      success: false,
      message: `Failed to list documents: ${(error as Error).message}`
    });
  }
});

/**
 * POST /api/collaborative-documents
 * Create a new collaborative document
 */
router.post('/', async (req, res) => {
  try {
    const validationResult = createDocumentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document creation parameters',
        errors: validationResult.error.errors
      });
    }
    
    const { name, type, folderId } = validationResult.data;
    
    const document = await createCollaborativeDocument(name, type, folderId);
    
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    logger.error('Error creating collaborative document:', error);
    res.status(500).json({
      success: false,
      message: `Failed to create document: ${(error as Error).message}`
    });
  }
});

/**
 * POST /api/collaborative-documents/:id/share
 * Share a collaborative document with users
 */
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = shareDocumentSchema.safeParse({
      ...req.body,
      fileId: id
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sharing parameters',
        errors: validationResult.error.errors
      });
    }
    
    const { fileId, permissions, sendNotifications } = validationResult.data;
    
    const result = await shareCollaborativeDocument(
      fileId,
      permissions as DocumentPermission[],
      sendNotifications
    );
    
    res.status(200).json({
      success: true,
      permissions: result
    });
  } catch (error) {
    logger.error('Error sharing collaborative document:', error);
    res.status(500).json({
      success: false,
      message: `Failed to share document: ${(error as Error).message}`
    });
  }
});

/**
 * GET /api/collaborative-documents/:id/embed
 * Get embed URL for a collaborative document
 */
router.get('/:id/embed', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    const documentInfo = await getCollaborativeDocumentUrl(id);
    
    res.status(200).json({
      success: true,
      document: documentInfo
    });
  } catch (error) {
    logger.error('Error getting collaborative document embed info:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get document info: ${(error as Error).message}`
    });
  }
});

export default router;