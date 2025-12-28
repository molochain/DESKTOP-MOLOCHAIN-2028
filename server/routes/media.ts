import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { db } from '../db';
import { mediaFiles } from '@db/schema';
import { eq, sql } from 'drizzle-orm';
import { 
  uploadFile, 
  uploadThumbnail, 
  deleteFile, 
  getStorageProvider, 
  isGoogleDriveAvailable 
} from '../utils/storageConfig';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs and Word documents are allowed.'));
    }
  },
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Use Drizzle ORM query approach
    let whereCondition = undefined;
    if (type) {
      whereCondition = eq(mediaFiles.fileType, String(type));
    }

    const [files, totalResult] = await Promise.all([
      db.query.mediaFiles.findMany({
        where: whereCondition,
        orderBy: (mediaFiles, { desc }) => [desc(mediaFiles.createdAt)],
        limit: Number(limit),
        offset: offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(mediaFiles).where(whereCondition),
    ]);

    const totalCount = Number(totalResult[0]?.count || 0);

    res.json({
      files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    // Error fetching media files - handled by error response
    res.status(500).json({ message: 'Failed to fetch media files' });
  }
});

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const user = req.user as any;
    if (!user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Log the configured storage provider
    const storageProvider = getStorageProvider();
    logger.info(`Using storage provider: ${storageProvider}`, {
      isGoogleDriveAvailable: isGoogleDriveAvailable()
    });

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
        const isImage = file.mimetype.startsWith('image/');
        
        // Upload original file
        const uploadResult = await uploadFile(file.buffer, filename, file.mimetype);
        
        // Prepare thumbnail data
        let thumbnailData = null;
        
        // Generate and upload thumbnail for images
        if (isImage) {
          const thumbnailBuffer = await sharp(file.buffer)
            .resize(200, 200, {
              fit: 'cover',
              position: 'center',
            })
            .toBuffer();

          const thumbnailFilename = `thumb-${filename}`;
          thumbnailData = await uploadThumbnail(thumbnailBuffer, thumbnailFilename, file.mimetype);
        }

        // Insert file record with only valid schema fields
        const mediaFile = await db.insert(mediaFiles).values({
          filename: file.originalname,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadResult.url,
          thumbnailUrl: thumbnailData?.url,
          fileType: file.mimetype.split('/')[0],
          folder: req.body.folder || 'uploads',
          uploadedBy: user.id,
          metadata: {
            encoding: file.encoding,
          },
        }).returning();

        return mediaFile[0];
      })
    );

    res.status(201).json(uploadedFiles);
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload files' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const file = await db.query.mediaFiles.findFirst({
      where: eq(mediaFiles.id, parseInt(id)),
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const user = req.user as any;
    if (file.uploadedBy !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Clean up storage files if configured
    const fileWithStorage = file as any;
    if (fileWithStorage.filename) {
      // File cleanup would be handled by storage service
    }

    // Delete database record
    await db.delete(mediaFiles).where(eq(mediaFiles.id, parseInt(id)));

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

export default router;