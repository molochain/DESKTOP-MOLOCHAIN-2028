import { STORAGE_CONFIG } from '../../config';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { randomUUID } from 'crypto';

// Storage provider types
export enum StorageProvider {
  REPLIT = 'replit',
  GOOGLE_DRIVE = 'google_drive'
}

// Interface for storage providers
export interface StorageProviderConfig {
  provider: StorageProvider;
  isConfigured: boolean;
}

// Upload result interface
export interface UploadResult {
  url: string;
  provider: string;
  driveFileId?: string;
}

// Function to check if Google Drive is properly configured
export function isGoogleDriveConfigured(): boolean {
  const { clientId, clientSecret, redirectUri, refreshToken } = STORAGE_CONFIG.googleDrive;
  
  const isConfigured = Boolean(
    clientId && clientSecret && redirectUri && refreshToken
  );
  
  if (!isConfigured && STORAGE_CONFIG.defaultProvider === StorageProvider.GOOGLE_DRIVE) {
    logger.warn('Google Drive is set as default storage provider but is not fully configured');
  }
  
  return isConfigured;
}

// Alias for checking if Google Drive is available
export function isGoogleDriveAvailable(): boolean {
  return isGoogleDriveConfigured();
}

// Function to check if a specific storage provider is configured
export function isStorageProviderConfigured(provider: StorageProvider): boolean {
  switch (provider) {
    case StorageProvider.REPLIT:
      return true; // Always available
    case StorageProvider.GOOGLE_DRIVE:
      return isGoogleDriveConfigured();
    default:
      return false;
  }
}

// Get the active storage provider
export function getActiveStorageProvider(): StorageProviderConfig {
  const defaultProvider = STORAGE_CONFIG.defaultProvider as StorageProvider;
  
  // If the default provider is Google Drive but not configured, fallback to Replit
  if (defaultProvider === StorageProvider.GOOGLE_DRIVE && !isGoogleDriveConfigured()) {
    logger.warn('Falling back to Replit storage because Google Drive is not configured');
    return {
      provider: StorageProvider.REPLIT,
      isConfigured: true
    };
  }
  
  return {
    provider: defaultProvider,
    isConfigured: isStorageProviderConfigured(defaultProvider)
  };
}

// Get the storage provider as a string
export function getStorageProvider(): string {
  return getActiveStorageProvider().provider;
}

// Get configuration status of all available storage providers
export function getAllStorageProviders(): Record<StorageProvider, boolean> {
  return {
    [StorageProvider.REPLIT]: true,
    [StorageProvider.GOOGLE_DRIVE]: isGoogleDriveConfigured()
  };
}

// Initialize Google Drive client
function getGoogleDriveClient() {
  try {
    const auth = new google.auth.OAuth2(
      STORAGE_CONFIG.googleDrive.clientId,
      STORAGE_CONFIG.googleDrive.clientSecret,
      STORAGE_CONFIG.googleDrive.redirectUri
    );
    
    auth.setCredentials({
      refresh_token: STORAGE_CONFIG.googleDrive.refreshToken
    });
    
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    logger.error('Failed to initialize Google Drive client:', error);
    throw new Error('Google Drive configuration is invalid');
  }
}

// Upload a file to storage (either local or Google Drive)
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  const activeProvider = getActiveStorageProvider();
  
  if (activeProvider.provider === StorageProvider.GOOGLE_DRIVE && activeProvider.isConfigured) {
    // Google Drive upload
    try {
      const drive = getGoogleDriveClient();
      const folderId = STORAGE_CONFIG.googleDrive.folderId || 'root';
      
      // Create the file on Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: filename,
          mimeType: mimeType,
          parents: [folderId]
        },
        media: {
          mimeType: mimeType,
          body: Buffer.from(fileBuffer)
        },
        fields: 'id, webViewLink, webContentLink'
      });
      
      if (!response.data.id) {
        throw new Error('Failed to get file ID from Google Drive');
      }
      
      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      
      // Get a direct download link
      const url = response.data.webContentLink || 
        `https://drive.google.com/uc?export=download&id=${response.data.id}`;
      
      return {
        url,
        provider: StorageProvider.GOOGLE_DRIVE,
        driveFileId: response.data.id
      };
    } catch (error) {
      logger.error('Google Drive upload error:', error);
      throw new Error(`Failed to upload to Google Drive: ${(error as Error).message}`);
    }
  } else {
    // Replit storage upload
    try {
      const uploadsDir = path.join(process.cwd(), 'attached_assets', 'uploads');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, fileBuffer);
      
      return {
        url: `/uploads/${filename}`,
        provider: StorageProvider.REPLIT
      };
    } catch (error) {
      logger.error('Local storage upload error:', error);
      throw new Error(`Failed to upload to local storage: ${(error as Error).message}`);
    }
  }
}

// Upload a thumbnail to storage
export async function uploadThumbnail(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  return uploadFile(fileBuffer, filename, mimeType);
}

// Delete a file from storage
export async function deleteFile(
  filename: string,
  provider: string,
  driveFileId?: string
): Promise<boolean> {
  if (provider === StorageProvider.GOOGLE_DRIVE && driveFileId) {
    // Delete from Google Drive
    try {
      const drive = getGoogleDriveClient();
      await drive.files.delete({
        fileId: driveFileId
      });
      return true;
    } catch (error) {
      logger.error(`Failed to delete file ${filename} from Google Drive:`, error);
      throw new Error(`Failed to delete from Google Drive: ${(error as Error).message}`);
    }
  } else {
    // Delete from local storage
    try {
      const filePath = path.join(process.cwd(), 'attached_assets', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      logger.error(`Failed to delete file ${filename} from local storage:`, error);
      throw new Error(`Failed to delete from local storage: ${(error as Error).message}`);
    }
  }
}