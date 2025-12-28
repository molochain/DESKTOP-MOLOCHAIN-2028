import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '../database/db.service';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger';

/**
 * Two-Factor Authentication utilities
 * Consolidated from multiple auth files for workspace organization
 */

interface TOTPSecret {
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}

/**
 * Generate TOTP secret and QR code for user
 */
export async function generateTOTPSecret(username: string, email: string): Promise<TOTPSecret> {
  const secret = authenticator.generateSecret();
  const keyuri = authenticator.keyuri(email, 'MoloChain', secret);
  
  try {
    const qrCode = await QRCode.toDataURL(keyuri);
    
    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 12).toUpperCase();
    });
    
    return {
      secret,
      qrCode,
      recoveryCodes
    };
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate 2FA setup');
  }
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({
    token,
    secret
  });
}

/**
 * Enable two-factor authentication for user
 */
export async function enableTwoFactorAuth(userId: number, secret: string, recoveryCodes: string[]): Promise<boolean> {
  try {
    // Hash recovery codes before storing
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map(code => bcrypt.hash(code, 10))
    );
    
    await db.update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        recoveryCodes: JSON.stringify(hashedRecoveryCodes)
      })
      .where(eq(users.id, userId));
      
    logger.info(`2FA enabled for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Failed to enable 2FA:', error);
    return false;
  }
}

/**
 * Disable two-factor authentication for user
 */
export async function disableTwoFactorAuth(userId: number): Promise<boolean> {
  try {
    await db.update(users)
      .set({
        twoFactorSecret: null,
        twoFactorEnabled: false,
        recoveryCodes: null
      })
      .where(eq(users.id, userId));
      
    logger.info(`2FA disabled for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Failed to disable 2FA:', error);
    return false;
  }
}

/**
 * Use recovery code for authentication
 */
export async function useRecoveryCode(userId: number, providedCode: string): Promise<boolean> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user?.recoveryCodes) {
      return false;
    }
    
    const storedCodes = JSON.parse(user.recoveryCodes as string) as string[];
    
    // Check if provided code matches any stored code
    for (let i = 0; i < storedCodes.length; i++) {
      const isMatch = await bcrypt.compare(providedCode, storedCodes[i]);
      if (isMatch) {
        // Remove used recovery code
        storedCodes.splice(i, 1);
        
        await db.update(users)
          .set({
            recoveryCodes: JSON.stringify(storedCodes)
          })
          .where(eq(users.id, userId));
          
        logger.info(`Recovery code used for user ${userId}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error('Failed to use recovery code:', error);
    return false;
  }
}

/**
 * Generate secret key (legacy compatibility)
 */
export const generateSecretKey = () => authenticator.generateSecret();

/**
 * Generate QR code URL (legacy compatibility)
 */
export const generateQRCodeUrl = (secret: string, email: string) => 
  authenticator.keyuri(email, 'MoloChain', secret);