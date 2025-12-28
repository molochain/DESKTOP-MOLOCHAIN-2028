/**
 * Google Drive Collaboration Utilities
 * 
 * This module provides functionality for real-time collaboration on Google Drive documents.
 * It creates and manages collaborative documents using Google Drive's API.
 */

import { google } from 'googleapis';
import { STORAGE_CONFIG } from '../../config';
import { logger } from './logger';

// Document MIME types for Google Apps
export enum GoogleDocType {
  DOCUMENT = 'application/vnd.google-apps.document',
  SPREADSHEET = 'application/vnd.google-apps.spreadsheet',
  PRESENTATION = 'application/vnd.google-apps.presentation',
  DRAWING = 'application/vnd.google-apps.drawing',
  FORM = 'application/vnd.google-apps.form',
}

// Interface for document permissions
export interface DocumentPermission {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  domain?: string;
}

/**
 * Initialize Google Drive client for document collaboration
 */
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
    logger.error('Failed to initialize Google Drive client for collaboration:', error);
    throw new Error('Google Drive configuration is invalid');
  }
}

/**
 * Create a new collaborative document
 * 
 * @param name Document name
 * @param type Document type (document, spreadsheet, etc.)
 * @param parentFolderId Parent folder ID
 * @returns Created document metadata
 */
export async function createCollaborativeDocument(
  name: string, 
  type: GoogleDocType, 
  parentFolderId?: string
) {
  try {
    const drive = getGoogleDriveClient();
    const folderId = parentFolderId || STORAGE_CONFIG.googleDrive.folderId;
    
    const fileMetadata = {
      name,
      mimeType: type,
      parents: folderId ? [folderId] : undefined
    };
    
    logger.info(`Creating new collaborative document: ${name} (${type})`);
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, webViewLink, webContentLink, createdTime'
    });
    
    logger.info(`Collaborative document created: ${name} (${response.data.id})`);
    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      createdTime: response.data.createdTime
    };
  } catch (error) {
    logger.error('Failed to create collaborative document:', error);
    throw new Error(`Failed to create collaborative document: ${(error as Error).message}`);
  }
}

/**
 * Share a collaborative document with users
 * 
 * @param fileId Document ID to share
 * @param permissions List of permission settings
 * @param notificationEmails Send notification emails to users
 * @returns List of created permissions
 */
export async function shareCollaborativeDocument(
  fileId: string,
  permissions: DocumentPermission[],
  notificationEmails: boolean = false
) {
  try {
    const drive = getGoogleDriveClient();
    const results = [];
    
    logger.info(`Sharing document ${fileId} with ${permissions.length} users/groups`);
    
    for (const permission of permissions) {
      const requestBody: any = {
        role: permission.role,
        type: permission.type,
      };
      
      if (permission.emailAddress) {
        requestBody.emailAddress = permission.emailAddress;
      }
      
      if (permission.domain) {
        requestBody.domain = permission.domain;
      }
      
      const response = await drive.permissions.create({
        fileId,
        requestBody,
        sendNotificationEmail: notificationEmails,
        fields: 'id, type, role, emailAddress, domain'
      });
      
      results.push(response.data);
    }
    
    logger.info(`Successfully shared document ${fileId}`);
    return results;
  } catch (error) {
    logger.error('Failed to share collaborative document:', error);
    throw new Error(`Failed to share document: ${(error as Error).message}`);
  }
}

/**
 * Get a document's web view URL for embedding
 * 
 * @param fileId Document ID
 * @returns Web view URL and document metadata
 */
export async function getCollaborativeDocumentUrl(fileId: string) {
  try {
    const drive = getGoogleDriveClient();
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink'
    });
    
    // Determine the appropriate embed URL based on document type
    let embedUrl = response.data.webViewLink as string;
    
    // Convert standard view URL to embedded view URL
    if (embedUrl) {
      if (response.data.mimeType === GoogleDocType.DOCUMENT) {
        embedUrl = embedUrl.replace('/edit', '/preview');
      } else if (response.data.mimeType === GoogleDocType.SPREADSHEET) {
        embedUrl = embedUrl.replace('/edit', '/preview');
      } else if (response.data.mimeType === GoogleDocType.PRESENTATION) {
        embedUrl = embedUrl.replace('/edit', '/preview');
      }
    }
    
    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      webViewLink: response.data.webViewLink,
      embedUrl
    };
  } catch (error) {
    logger.error('Failed to get collaborative document URL:', error);
    throw new Error(`Failed to get document URL: ${(error as Error).message}`);
  }
}

/**
 * List all collaborative documents of a specific type
 * 
 * @param type Document type filter
 * @param folderId Optional folder to search in
 * @returns List of collaborative documents
 */
export async function listCollaborativeDocuments(type?: GoogleDocType, folderId?: string) {
  try {
    const drive = getGoogleDriveClient();
    const searchFolder = folderId || STORAGE_CONFIG.googleDrive.folderId;
    
    // Build query string
    let query = '';
    
    // Add folder filter if specified
    if (searchFolder && searchFolder !== 'root') {
      query += `'${searchFolder}' in parents`;
    }
    
    // Add type filter if specified
    if (type) {
      if (query) query += ' and ';
      query += `mimeType='${type}'`;
    } else {
      // Only include Google Apps documents
      if (query) query += ' and ';
      query += `(mimeType='${GoogleDocType.DOCUMENT}' or ` +
               `mimeType='${GoogleDocType.SPREADSHEET}' or ` +
               `mimeType='${GoogleDocType.PRESENTATION}' or ` +
               `mimeType='${GoogleDocType.DRAWING}' or ` +
               `mimeType='${GoogleDocType.FORM}')`;
    }
    
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc'
    });
    
    return response.data.files || [];
  } catch (error) {
    logger.error('Failed to list collaborative documents:', error);
    throw new Error(`Failed to list documents: ${(error as Error).message}`);
  }
}