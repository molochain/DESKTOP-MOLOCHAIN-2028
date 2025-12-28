import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { google } from 'googleapis';
import { createLoggerWithContext } from '../utils/logger';
import { STORAGE_CONFIG } from '../../config';

const logger = createLoggerWithContext('driveRoutes');
const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(os.tmpdir(), 'drive-uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Use original filename but make it unique with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Initialize Google Drive API client
function getGoogleDriveClient() {
  try {
    // Validate required configuration
    if (!STORAGE_CONFIG.googleDrive.enabled) {
      throw new Error('Google Drive integration is not enabled');
    }
    
    if (!STORAGE_CONFIG.googleDrive.clientId || !STORAGE_CONFIG.googleDrive.clientSecret) {
      throw new Error('Google Drive client credentials are missing');
    }
    
    if (!STORAGE_CONFIG.googleDrive.refreshToken) {
      throw new Error('Google Drive refresh token is missing');
    }
    
    // Initialize OAuth2 client
    const auth = new google.auth.OAuth2(
      STORAGE_CONFIG.googleDrive.clientId.trim(),
      STORAGE_CONFIG.googleDrive.clientSecret.trim(),
      STORAGE_CONFIG.googleDrive.redirectUri?.trim() || 'https://developers.google.com/oauthplayground'
    );
    
    // Set refresh token
    auth.setCredentials({
      refresh_token: STORAGE_CONFIG.googleDrive.refreshToken.trim()
    });
    
    // Create and return Drive client
    const drive = google.drive({ 
      version: 'v3', 
      auth,
      // Add retry configuration
      retryConfig: {
        retry: 3,
        retryDelay: 1000,
        statusCodesToRetry: [[500, 599]]
      }
    });
    
    return drive;
  } catch (error) {
    logger.error('Failed to initialize Google Drive client:', error);
    throw error instanceof Error ? error : new Error('Google Drive configuration is invalid');
  }
}

// Test Google Drive connection
router.get('/test-connection', async (req, res) => {
  try {
    // Check if Google Drive is enabled in configuration
    if (!STORAGE_CONFIG.googleDrive.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive integration is not enabled',
        details: 'Set ENABLE_GOOGLE_DRIVE=true in your .env file'
      });
    }

    // Validate required configuration values
    const missingConfig = [];
    if (!STORAGE_CONFIG.googleDrive.clientId) missingConfig.push('GOOGLE_CLIENT_ID');
    if (!STORAGE_CONFIG.googleDrive.clientSecret) missingConfig.push('GOOGLE_CLIENT_SECRET');
    if (!STORAGE_CONFIG.googleDrive.redirectUri) missingConfig.push('GOOGLE_REDIRECT_URI');
    if (!STORAGE_CONFIG.googleDrive.refreshToken) missingConfig.push('GOOGLE_REFRESH_TOKEN');
    
    if (missingConfig.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Google Drive configuration',
        details: `Missing: ${missingConfig.join(', ')}`
      });
    }
    
    // Initialize client and verify connection by getting account info
    const drive = getGoogleDriveClient();
    
    const aboutResponse = await drive.about.get({
      fields: 'user,storageQuota'
    });
    
    // Validate folder ID if specified
    let folderStatus = null;
    if (STORAGE_CONFIG.googleDrive.folderId) {
      try {
        const folderResponse = await drive.files.get({
          fileId: STORAGE_CONFIG.googleDrive.folderId,
          fields: 'id,name,mimeType'
        });
        
        const isFolder = folderResponse.data.mimeType === 'application/vnd.google-apps.folder';
        folderStatus = {
          valid: isFolder,
          name: folderResponse.data.name,
          message: isFolder ? 'Root folder is valid' : 'Specified ID is not a folder'
        };
      } catch (folderError) {
        folderStatus = {
          valid: false,
          message: `Cannot access folder: ${(folderError as Error).message}`
        };
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Google Drive connection successful',
      user: aboutResponse.data.user,
      storageQuota: aboutResponse.data.storageQuota,
      folder: folderStatus
    });
  } catch (error) {
    logger.error('Failed to test Google Drive connection:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = `Failed to connect to Google Drive: ${(error as Error).message || 'Unknown error'}`;
    let statusCode = 500;
    
    const errorStr = String(error);
    if (errorStr.includes('invalid_client')) {
      errorMessage = 'Invalid client credentials. Check your Client ID and Client Secret.';
      statusCode = 401;
    } else if (errorStr.includes('invalid_grant')) {
      errorMessage = 'Invalid refresh token. You may need to generate a new refresh token.';
      statusCode = 401;
    } else if (errorStr.includes('access_denied')) {
      errorMessage = 'Access denied. Check your Google Drive permissions.';
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
});

// List files in a folder
router.get('/files', async (req, res) => {
  try {
    const drive = getGoogleDriveClient();
    
    const parentId = req.query.parentId as string || 'root';
    const searchTerm = req.query.q as string || '';
    const typeFilter = req.query.type as string || '';
    const sortField = req.query.sort as string || 'name';
    const sortOrder = req.query.order as string || 'asc';
    
    // Construct query
    let query = `'${parentId}' in parents and trashed = false`;
    
    if (searchTerm) {
      query += ` and name contains '${searchTerm}'`;
    }
    
    if (typeFilter) {
      if (typeFilter === 'folder') {
        query += ` and mimeType = 'application/vnd.google-apps.folder'`;
      } else {
        query += ` and mimeType contains '${typeFilter}'`;
      }
    }
    
    // Execute query
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webContentLink, webViewLink, thumbnailLink, createdTime, modifiedTime, size, parents, iconLink)',
      orderBy: `${sortField} ${sortOrder}`,
      pageSize: 1000
    });
    
    res.status(200).json({
      success: true,
      files: response.data.files || []
    });
  } catch (error) {
    logger.error('Failed to list files from Google Drive:', error);
    res.status(500).json({
      success: false,
      message: `Failed to list files: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Get file details
router.get('/files/:fileId', async (req, res) => {
  try {
    const drive = getGoogleDriveClient();
    const fileId = req.params.fileId;
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webContentLink, webViewLink, thumbnailLink, createdTime, modifiedTime, size, parents, iconLink'
    });
    
    res.status(200).json({
      success: true,
      file: response.data
    });
  } catch (error) {
    logger.error(`Failed to get file details for ID ${req.params.fileId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get file details: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const drive = getGoogleDriveClient();
    const parentId = req.body.parentId || STORAGE_CONFIG.googleDrive.folderId || 'root';
    
    const fileMetadata = {
      name: req.file.originalname,
      parents: [parentId]
    };
    
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({
      success: true,
      file: response.data
    });
  } catch (error) {
    logger.error('Failed to upload file to Google Drive:', error);
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to upload file: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Create folder
router.post('/folders', async (req, res) => {
  try {
    const { name, parentId = 'root' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }
    
    const drive = getGoogleDriveClient();
    
    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };
    
    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name, webViewLink'
    });
    
    res.status(201).json({
      success: true,
      folder: response.data
    });
  } catch (error) {
    logger.error('Failed to create folder in Google Drive:', error);
    res.status(500).json({
      success: false,
      message: `Failed to create folder: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Delete file
router.delete('/files/:fileId', async (req, res) => {
  try {
    const drive = getGoogleDriveClient();
    const fileId = req.params.fileId;
    
    await drive.files.delete({
      fileId
    });
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error(`Failed to delete file with ID ${req.params.fileId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to delete file: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Batch delete files
router.post('/batch-delete', async (req, res) => {
  try {
    const { fileIds } = req.body;
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File IDs array is required'
      });
    }
    
    const drive = getGoogleDriveClient();
    
    // Execute batch delete requests
    const results = await Promise.allSettled(
      fileIds.map(fileId => 
        drive.files.delete({
          fileId
        })
      )
    );
    
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;
    
    if (failureCount > 0) {
      logger.warn(`Batch delete: ${failureCount} out of ${results.length} operations failed`);
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${successCount} files, failed to delete ${failureCount} files`
    });
  } catch (error) {
    logger.error('Failed to execute batch delete operation:', error);
    res.status(500).json({
      success: false,
      message: `Failed to delete files: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Download file

// Auto-organize files by type
router.post('/auto-organize', async (req, res) => {
  try {
    const { folderId = 'root' } = req.body;
    const drive = getGoogleDriveClient();
    
    // Get all files in the folder
    const filesResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, parents)'
    });
    
    const files = filesResponse.data.files || [];
    
    // Create organization folders
    const folderTypes = ['Images', 'Documents', 'Videos', 'Audio', 'Spreadsheets', 'Presentations'];
    const createdFolders: { [key: string]: string } = {};
    
    for (const folderName of folderTypes) {
      const folderResponse = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId]
        },
        fields: 'id'
      });
      createdFolders[folderName.toLowerCase()] = folderResponse.data.id!;
    }
    
    // Move files to appropriate folders
    let movedCount = 0;
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') continue;
      
      let targetFolder = '';
      if (file.mimeType?.startsWith('image/')) {
        targetFolder = createdFolders['images'];
      } else if (file.mimeType?.includes('document') || file.mimeType?.includes('text/')) {
        targetFolder = createdFolders['documents'];
      } else if (file.mimeType?.startsWith('video/')) {
        targetFolder = createdFolders['videos'];
      } else if (file.mimeType?.startsWith('audio/')) {
        targetFolder = createdFolders['audio'];
      } else if (file.mimeType?.includes('spreadsheet')) {
        targetFolder = createdFolders['spreadsheets'];
      } else if (file.mimeType?.includes('presentation')) {
        targetFolder = createdFolders['presentations'];
      }
      
      if (targetFolder) {
        await drive.files.update({
          fileId: file.id!,
          addParents: targetFolder,
          removeParents: folderId
        });
        movedCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Organized ${movedCount} files into ${folderTypes.length} folders`
    });
  } catch (error) {
    logger.error('Failed to auto-organize files:', error);
    res.status(500).json({
      success: false,
      message: `Failed to organize files: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Create quick access folders
router.post('/create-quick-folders', async (req, res) => {
  try {
    const { parentId = 'root', folders } = req.body;
    const drive = getGoogleDriveClient();
    
    const createdFolders = [];
    
    for (const folder of folders) {
      const response = await drive.files.create({
        requestBody: {
          name: folder.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId]
        },
        fields: 'id, name'
      });
      
      createdFolders.push(response.data);
    }
    
    res.status(201).json({
      success: true,
      folders: createdFolders
    });
  } catch (error) {
    logger.error('Failed to create quick folders:', error);
    res.status(500).json({
      success: false,
      message: `Failed to create folders: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Star/unstar files
router.post('/files/:fileId/star', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { starred } = req.body;
    const drive = getGoogleDriveClient();
    
    await drive.files.update({
      fileId,
      requestBody: {
        starred: starred
      }
    });
    
    res.status(200).json({
      success: true,
      message: starred ? 'File starred' : 'File unstarred'
    });
  } catch (error) {
    logger.error(`Failed to ${req.body.starred ? 'star' : 'unstar'} file:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to update file: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Move files
router.post('/move', async (req, res) => {
  try {
    const { fileIds, targetFolderId } = req.body;
    const drive = getGoogleDriveClient();
    
    for (const fileId of fileIds) {
      // Get current parents
      const file = await drive.files.get({
        fileId,
        fields: 'parents'
      });
      
      const previousParents = file.data.parents?.join(',') || '';
      
      // Move file
      await drive.files.update({
        fileId,
        addParents: targetFolderId,
        removeParents: previousParents
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Moved ${fileIds.length} files`
    });
  } catch (error) {
    logger.error('Failed to move files:', error);
    res.status(500).json({
      success: false,
      message: `Failed to move files: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

// Archive old files
router.post('/archive-old', async (req, res) => {
  try {
    const { thresholdDays, folderId = 'root' } = req.body;
    const drive = getGoogleDriveClient();
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
    
    // Create archive folder
    const archiveResponse = await drive.files.create({
      requestBody: {
        name: 'Archive',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId]
      },
      fields: 'id'
    });
    
    const archiveFolderId = archiveResponse.data.id!;
    
    // Get old files
    const filesResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and modifiedTime < '${thresholdDate.toISOString()}'`,
      fields: 'files(id, name, modifiedTime, parents)'
    });
    
    const oldFiles = filesResponse.data.files || [];
    let archivedCount = 0;
    
    for (const file of oldFiles) {
      if (file.mimeType === 'application/vnd.google-apps.folder') continue;
      
      await drive.files.update({
        fileId: file.id!,
        addParents: archiveFolderId,
        removeParents: folderId
      });
      archivedCount++;
    }
    
    res.status(200).json({
      success: true,
      message: `Archived ${archivedCount} old files`
    });
  } catch (error) {
    logger.error('Failed to archive old files:', error);
    res.status(500).json({
      success: false,
      message: `Failed to archive files: ${(error as Error).message || 'Unknown error'}`
    });
  }
});

router.get('/download/:fileId', async (req, res) => {
  try {
    const drive = getGoogleDriveClient();
    const fileId = req.params.fileId;
    
    // First get file metadata to determine the filename
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name, mimeType'
    });
    
    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;
    
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName || 'download')}"`);
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
    }
    
    // Stream the file
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media'
      },
      { responseType: 'stream' }
    );
    
    response.data
      .on('error', (err: Error) => {
        logger.error(`Error streaming file with ID ${fileId}:`, err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: `Failed to download file: ${err.message || 'Unknown error'}`
          });
        }
      })
      .pipe(res);
      
  } catch (error) {
    logger.error(`Failed to download file with ID ${req.params.fileId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: `Failed to download file: ${(error as Error).message || 'Unknown error'}`
      });
    }
  }
});

export default router;