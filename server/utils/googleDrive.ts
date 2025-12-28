import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// Define types for Google Drive service
interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  folderId: string; // Root folder ID in Google Drive to store files
}

class GoogleDriveService {
  private drive;
  private folderId: string;

  constructor(config: GoogleDriveConfig) {
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: config.refreshToken
    });

    this.drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });

    this.folderId = config.folderId;
  }

  /**
   * Upload a file to Google Drive
   * @param fileBuffer - Buffer containing file data
   * @param filename - Name to save the file as
   * @param mimeType - MIME type of the file
   */
  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ id: string, webViewLink: string }> {
    try {
      // Create a readable stream from the buffer
      const fileStream = new Readable();
      fileStream.push(fileBuffer);
      fileStream.push(null); // End of stream

      // Upload the file to Google Drive
      const response = await this.drive.files.create({
        requestBody: {
          name: filename,
          mimeType: mimeType,
          parents: [this.folderId]
        },
        media: {
          mimeType: mimeType,
          body: fileStream
        },
        fields: 'id,webViewLink'
      });

      logger.info(`File uploaded to Google Drive successfully: ${filename}`, { 
        fileId: response.data.id, 
        filename 
      });

      return {
        id: response.data.id!,
        webViewLink: response.data.webViewLink!
      };
    } catch (error) {
      logger.error(`Failed to upload file to Google Drive: ${filename}`, { error });
      throw new Error(`Google Drive upload failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate a publicly accessible URL for a file
   * @param fileId - Google Drive file ID
   */
  async getPublicUrl(fileId: string): Promise<string> {
    try {
      // Update file permissions to make it publicly accessible
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Get the file details including webContentLink
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink,webViewLink'
      });

      // Return a direct link to the file content
      return response.data.webContentLink || response.data.webViewLink!;
    } catch (error) {
      logger.error(`Failed to generate public URL for file: ${fileId}`, { error });
      throw new Error(`Failed to generate public URL: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a file from Google Drive
   * @param fileId - Google Drive file ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      logger.info(`File deleted from Google Drive successfully: ${fileId}`);
    } catch (error) {
      logger.error(`Failed to delete file from Google Drive: ${fileId}`, { error });
      throw new Error(`Google Drive delete failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Rename a file in Google Drive
   * @param fileId - Google Drive file ID
   * @param newName - New file name
   */
  async renameFile(fileId: string, newName: string): Promise<{id: string, name: string, mimeType: string}> {
    try {
      const response = await this.drive.files.update({
        fileId: fileId,
        requestBody: {
          name: newName
        },
        fields: 'id, name, mimeType'
      });
      
      logger.info(`File renamed in Google Drive successfully: ${fileId} to ${newName}`);
      
      return {
        id: response.data.id || '',
        name: response.data.name || '',
        mimeType: response.data.mimeType || ''
      };
    } catch (error) {
      logger.error(`Failed to rename file in Google Drive: ${fileId}`, { error });
      throw new Error(`Google Drive rename failed: ${(error as Error).message}`);
    }
  }

  /**
   * Create a folder in Google Drive
   * @param folderName - Name of the folder to create
   * @param parentFolderId - Optional parent folder ID
   */
  async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId || this.folderId]
        },
        fields: 'id'
      });

      logger.info(`Folder created in Google Drive successfully: ${folderName}`, { 
        folderId: response.data.id, 
        folderName 
      });

      return response.data.id!;
    } catch (error) {
      logger.error(`Failed to create folder in Google Drive: ${folderName}`, { error });
      throw new Error(`Google Drive folder creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * List files in a Google Drive folder
   * @param folderId - ID of the folder to list files from (defaults to root folder)
   */
  async listFiles(folderId?: string): Promise<Array<{ id: string, name: string, mimeType: string }>> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId || this.folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)'
      });

      // Transform the response to ensure all required properties are string type
      return (response.data.files || []).map(file => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || ''
      }));
    } catch (error) {
      logger.error(`Failed to list files in Google Drive folder: ${folderId || this.folderId}`, { error });
      throw new Error(`Google Drive list files failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get detailed information about a file
   * @param fileId - Google Drive file ID
   */
  async getFileDetails(fileId: string): Promise<{
    webViewLink?: string | null;
    size?: string | null;
    createdTime?: string | null;
    modifiedTime?: string | null;
  }> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, webViewLink, createdTime, modifiedTime'
      });
      
      return {
        webViewLink: response.data.webViewLink || undefined,
        size: response.data.size || undefined,
        createdTime: response.data.createdTime || undefined,
        modifiedTime: response.data.modifiedTime || undefined
      };
    } catch (error) {
      logger.error(`Failed to get details for file: ${fileId}`, { error });
      throw new Error(`Google Drive get file details failed: ${(error as Error).message}`);
    }
  }
}

import { STORAGE_CONFIG } from '../../config';

// Export a function to create the Google Drive service
export const createGoogleDriveService = (customConfig?: Partial<GoogleDriveConfig>): GoogleDriveService | null => {
  try {
    // Start with default config from environment
    const config: GoogleDriveConfig = {
      clientId: STORAGE_CONFIG.googleDrive.clientId,
      clientSecret: STORAGE_CONFIG.googleDrive.clientSecret,
      redirectUri: STORAGE_CONFIG.googleDrive.redirectUri,
      refreshToken: STORAGE_CONFIG.googleDrive.refreshToken,
      folderId: STORAGE_CONFIG.googleDrive.folderId
    };

    // Override with custom config if provided
    if (customConfig) {
      Object.assign(config, customConfig);
    }

    // Check if all required fields are present
    const missingVars = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      logger.warn(`Google Drive service not initialized. Missing configuration: ${missingVars.join(', ')}`);
      return null;
    }

    return new GoogleDriveService(config);
  } catch (error) {
    logger.error('Failed to initialize Google Drive service', { error });
    return null;
  }
};

// Singleton instance
let driveServiceInstance: GoogleDriveService | null = null;

export const getGoogleDriveService = (): GoogleDriveService | null => {
  if (!driveServiceInstance) {
    driveServiceInstance = createGoogleDriveService();
  }
  return driveServiceInstance;
};