import express from 'express';
import { z } from 'zod';
import { isAuthenticated, User } from '../../core/auth/auth.service';
import { validateRequest } from '../../middleware/validate';
import { 
  generateTOTPSecret, 
  verifyTOTP, 
  enableTwoFactorAuth, 
  disableTwoFactorAuth,
  useRecoveryCode
} from '../../core/auth/two-factor.service';
import { logger } from '../../utils/logger';

const router = express.Router();

// Validation schemas
const verifyTokenSchema = z.object({
  token: z.string().min(6).max(6),
});

const verifyRecoverySchema = z.object({
  recoveryCode: z.string().min(10).max(10),
});

// Generate 2FA secret route
router.post('/2fa/generate', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as User;
    const { username, email } = user;
    
    // If email is not available, use username
    const emailOrUsername = email || username;
    
    const secret = await generateTOTPSecret(username, emailOrUsername as string);
    
    // Store secret and recovery codes in session temporarily for verification
    req.session.twoFactorSecret = secret.secret;
    req.session.twoFactorRecoveryCodes = secret.recoveryCodes;
    
    res.status(200).json({
      success: true,
      data: {
        qrCode: secret.qrCode,
        recoveryCodes: secret.recoveryCodes,
        // Don't send the secret to client for security - it's stored in session
      }
    });
  } catch (error) {
    logger.error('Error generating 2FA secret:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate two-factor authentication secret'
    });
  }
});

// Verify and enable 2FA
router.post(
  '/2fa/verify', 
  isAuthenticated,
  validateRequest({ body: verifyTokenSchema }),
  async (req, res) => {
    try {
      const { token } = req.body;
      const user = req.user as User;
      const { id } = user;
      
      // Get the user's temporary secret from the session
      const secret = req.session.twoFactorSecret;
      const recoveryCodes = req.session.twoFactorRecoveryCodes;
      
      if (!secret || !recoveryCodes) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication setup not initiated'
        });
      }
      
      // Verify the token
      const isValid = verifyTOTP(token, secret);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }
      
      // Enable 2FA for the user
      const enabled = await enableTwoFactorAuth(id, secret, recoveryCodes);
      
      if (!enabled) {
        return res.status(500).json({
          success: false,
          message: 'Failed to enable two-factor authentication'
        });
      }
      
      // Clear temp data from session
      delete req.session.twoFactorSecret;
      delete req.session.twoFactorRecoveryCodes;
      
      res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    } catch (error) {
      logger.error('Error verifying 2FA token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify and enable two-factor authentication'
      });
    }
  }
);

// Verify 2FA during login
router.post(
  '/2fa/login', 
  validateRequest({ body: verifyTokenSchema }),
  async (req, res) => {
    try {
      const { token } = req.body;
      
      // Get user ID and secret from session (set during login process)
      const userId = req.session.twoFactorUserId;
      const twoFactorSecret = req.session.twoFactorSecret;
      
      if (!userId || !twoFactorSecret) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication session not found'
        });
      }
      
      // Verify the token
      const isValid = verifyTOTP(token, twoFactorSecret);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }
      
      // Clear 2FA data from session
      delete req.session.twoFactorUserId;
      delete req.session.twoFactorSecret;
      
      // Mark as fully authenticated
      req.session.twoFactorAuthenticated = true;
      
      res.status(200).json({
        success: true,
        message: 'Two-factor authentication successful'
      });
    } catch (error) {
      logger.error('Error verifying 2FA login:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify two-factor authentication'
      });
    }
  }
);

// Handle recovery code
router.post(
  '/2fa/recovery', 
  validateRequest({ body: verifyRecoverySchema }),
  async (req, res) => {
    try {
      const { recoveryCode } = req.body;
      
      // Get user ID from session (set during login process)
      const userId = req.session.twoFactorUserId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication session not found'
        });
      }
      
      // Use recovery code
      const isValid = await useRecoveryCode(userId, recoveryCode);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recovery code'
        });
      }
      
      // Clear 2FA data from session
      delete req.session.twoFactorUserId;
      delete req.session.twoFactorSecret;
      
      // Mark as fully authenticated
      req.session.twoFactorAuthenticated = true;
      
      res.status(200).json({
        success: true,
        message: 'Recovery successful'
      });
    } catch (error) {
      logger.error('Error using recovery code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process recovery code'
      });
    }
  }
);

// Disable 2FA
router.post('/2fa/disable', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as User;
    const { id } = user;
    
    // Disable 2FA for the user
    const disabled = await disableTwoFactorAuth(id);
    
    if (!disabled) {
      return res.status(500).json({
        success: false,
        message: 'Failed to disable two-factor authentication'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable two-factor authentication'
    });
  }
});

export default router;