import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { STORAGE_CONFIG } from '../../config';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';
import { requirePermission, PERMISSIONS } from '../middleware/requirePermission';
import { createLoggerWithContext } from '../utils/logger';
import { google } from 'googleapis';
import dotenv from 'dotenv';

const logger = createLoggerWithContext('settingsRoutes');
const router = Router();

function updateEnvVariable(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*`, 'gm');
  const newLine = `${key}=${value}`;
  
  if (content.match(regex)) {
    return content.replace(regex, newLine);
  } else {
    return content + (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
  }
}

router.get('/storage', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SETTINGS_VIEW), (req, res) => {
  try {
    const settings = {
      defaultProvider: STORAGE_CONFIG.defaultProvider,
      googleDrive: {
        enabled: STORAGE_CONFIG.googleDrive.enabled,
        clientId: STORAGE_CONFIG.googleDrive.clientId,
        clientSecret: STORAGE_CONFIG.googleDrive.clientSecret ? '••••••••••••••••' : '',
        redirectUri: STORAGE_CONFIG.googleDrive.redirectUri,
        refreshToken: STORAGE_CONFIG.googleDrive.refreshToken ? '••••••••••••••••' : '',
        folderId: STORAGE_CONFIG.googleDrive.folderId
      }
    };
    
    res.status(200).json(settings);
  } catch (error) {
    logger.error('Failed to get storage settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage settings'
    });
  }
});

router.post('/storage', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), (req, res) => {
  try {
    const { defaultProvider, googleDrive } = req.body;
    
    if (!defaultProvider) {
      return res.status(400).json({
        success: false,
        message: 'Default provider is required'
      });
    }
    
    if (googleDrive) {
      if (googleDrive.clientId) {
        googleDrive.clientId = googleDrive.clientId.trim();
      }
      
      if (googleDrive.folderId && googleDrive.folderId.includes('folders/')) {
        const match = googleDrive.folderId.match(/folders\/([^/?]+)/);
        if (match && match[1]) {
          googleDrive.folderId = match[1];
        }
      }
      
      if (googleDrive.redirectUri && googleDrive.redirectUri.startsWith('https://developers.google.com/oauthplayground')) {
        googleDrive.redirectUri = 'https://developers.google.com/oauthplayground';
      }
    }
    
    if (defaultProvider === 'google_drive' && !googleDrive?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive must be enabled to use it as the default provider'
      });
    }
    
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      const updatedEnv = updateEnvVariable(envContent, 'STORAGE_PROVIDER', defaultProvider);
      
      if (googleDrive) {
        const updatedWithClientId = googleDrive.clientId && !googleDrive.clientId.includes('•')
          ? updateEnvVariable(updatedEnv, 'GOOGLE_CLIENT_ID', googleDrive.clientId)
          : updatedEnv;
          
        const updatedWithClientSecret = googleDrive.clientSecret && !googleDrive.clientSecret.includes('•')
          ? updateEnvVariable(updatedWithClientId, 'GOOGLE_CLIENT_SECRET', googleDrive.clientSecret)
          : updatedWithClientId;
          
        const updatedWithRedirectUri = googleDrive.redirectUri
          ? updateEnvVariable(updatedWithClientSecret, 'GOOGLE_REDIRECT_URI', googleDrive.redirectUri)
          : updatedWithClientSecret;
          
        const updatedWithRefreshToken = googleDrive.refreshToken && !googleDrive.refreshToken.includes('•')
          ? updateEnvVariable(updatedWithRedirectUri, 'GOOGLE_REFRESH_TOKEN', googleDrive.refreshToken)
          : updatedWithRedirectUri;
          
        const updatedWithFolderId = googleDrive.folderId
          ? updateEnvVariable(updatedWithRefreshToken, 'GOOGLE_DRIVE_FOLDER_ID', googleDrive.folderId)
          : updatedWithRefreshToken;
        
        const finalEnv = updateEnvVariable(
          updatedWithFolderId, 
          'ENABLE_GOOGLE_DRIVE', 
          googleDrive.enabled ? 'true' : 'false'
        );
        
        fs.writeFileSync(envPath, finalEnv);
      } else {
        fs.writeFileSync(envPath, updatedEnv);
      }
      
      dotenv.config();
      
      res.status(200).json({
        success: true,
        message: 'Storage settings updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update .env file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update environment variables'
      });
    }
  } catch (error) {
    logger.error('Failed to update storage settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update storage settings'
    });
  }
});

router.get('/test-drive-connection', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SETTINGS_VIEW), async (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri, refreshToken } = req.query;
    
    const auth = new google.auth.OAuth2(
      clientId as string || STORAGE_CONFIG.googleDrive.clientId,
      clientSecret as string || STORAGE_CONFIG.googleDrive.clientSecret,
      redirectUri as string || STORAGE_CONFIG.googleDrive.redirectUri
    );
    
    auth.setCredentials({
      refresh_token: refreshToken as string || STORAGE_CONFIG.googleDrive.refreshToken
    });
    
    try {
      const drive = google.drive({ version: 'v3', auth });
      
      const response = await drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)'
      });
      
      res.status(200).json({
        success: true,
        message: 'Successfully connected to Google Drive',
        data: {
          files: response.data.files
        }
      });
    } catch (error) {
      logger.error('Google Drive connection test failed:', error);
      res.status(400).json({
        success: false,
        message: `Failed to connect to Google Drive: ${(error as Error).message}`
      });
    }
  } catch (error) {
    logger.error('Error testing Google Drive connection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while testing Google Drive connection'
    });
  }
});

export default router;
