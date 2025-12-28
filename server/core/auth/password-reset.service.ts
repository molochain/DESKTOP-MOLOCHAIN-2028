import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { db } from '../database/db.service';
import { users, passwordResetTokens } from '@db/schema';
import { and, eq, sql, isNull } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { validateRequest } from '../../middleware/validate';
import { requestPasswordResetSchema, resetPasswordSchema } from '../../validation/reset-password.schema';
import { verifyCsrfToken, refreshCsrfToken } from '../../middleware/csrf';
import { passwordResetLimiter } from '../../middleware/auth-rate-limit';
import { SECURITY_CONFIG } from '../../../config';
import { emailService } from '../../services/email.service';

// Constants
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generate a random token for password reset
export const generateResetToken = () => crypto.randomBytes(40).toString('hex');

// Hash a token for secure storage
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Find a user by email
const getUserByEmail = async (email: string) => {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
};

// Create a reset token for a user
const createResetToken = async (userId: number) => {
  // Generate a unique token
  const token = generateResetToken();
  const hashedToken = hashToken(token);
  
  // Calculate expiration date (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + TOKEN_EXPIRY);
  
  // Create the hashed token in the database
  const [resetToken] = await db
    .insert(passwordResetTokens)
    .values({
      userId,
      token: hashedToken, // Store hashed token for security
      expiresAt,
    })
    .returning();
  
  // Return the database record with the original token for email/logging
  return { ...resetToken, originalToken: token };
};

// Find a valid (unexpired and unused) token
const findValidToken = async (token: string) => {
  const hashedToken = hashToken(token);
  return await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, hashedToken), // Compare hashed token
        sql`${passwordResetTokens.expiresAt} > NOW()`,
        isNull(passwordResetTokens.usedAt)
      )
    )
    .limit(1);
};

// Route setup
export function setupPasswordReset(app: express.Application) {
  // Request password reset (needs email)
  app.post(
    '/api/auth/request-reset',
    refreshCsrfToken,
    verifyCsrfToken,
    passwordResetLimiter,
    validateRequest({ body: requestPasswordResetSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.body;
        
        // Find user by email
        const user = await getUserByEmail(email);
        
        // Even if user is not found, don't reveal that in the response
        // for security reasons (prevents email enumeration)
        if (!user.length) {
          logger.info(`Password reset requested for non-existent email: ${email}`);
          return res.status(200).json({
            message: 'If your email is registered, you will receive a password reset link.',
          });
        }
        
        // Create a reset token
        const resetToken = await createResetToken(user[0].id);
        
        // Send password reset email with reset link
        const resetUrl = `https://app.molochain.com/reset-password?token=${resetToken.originalToken}`;
        
        emailService.sendAuthEmail('password-reset', user[0].email, {
          username: user[0].username || user[0].email,
          reset_link: resetUrl,
          reset_token: resetToken.originalToken,
          expiry_hours: '24',
        }).catch(err => logger.debug('Password reset email failed (non-critical):', err));
        
        logger.info(`Password reset token created for user ${user[0].email}`);
        
        // Send a generic response to prevent email enumeration
        res.status(200).json({
          message: 'If your email is registered, you will receive a password reset link.',
        });
      } catch (error) {
        logger.error('Error in password reset request:', error);
        next(error);
      }
    }
  );
  
  // Reset password with token
  app.post(
    '/api/auth/reset-password',
    refreshCsrfToken,
    verifyCsrfToken,
    validateRequest({ body: resetPasswordSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token, password } = req.body;
        
        // Verify token is valid
        const resetTokens = await findValidToken(token);
        
        if (!resetTokens.length) {
          return res.status(400).json({
            error: 'Invalid token',
            message: 'The password reset link is invalid or has expired.',
          });
        }
        
        const resetToken = resetTokens[0];
        
        // Get the user associated with the token
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, resetToken.userId))
          .limit(1);
        
        if (!user.length) {
          return res.status(400).json({
            error: 'User not found',
            message: 'The user associated with this token no longer exists.',
          });
        }
        
        // Hash the new password
        const passwordHash = await bcrypt.hash(password, SECURITY_CONFIG.passwordHashRounds);
        
        // Update the user's password
        await db
          .update(users)
          .set({
            password: passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, resetToken.userId));
        
        // Mark the token as used
        await db
          .update(passwordResetTokens)
          .set({
            usedAt: new Date(),
          })
          .where(eq(passwordResetTokens.id, resetToken.id));
        
        // Log the password change
        logger.info(`Password reset completed for user ID ${resetToken.userId}`);
        
        // Return success response
        res.status(200).json({
          message: 'Your password has been reset successfully. You can now log in with your new password.',
        });
      } catch (error) {
        logger.error('Error in password reset:', error);
        next(error);
      }
    }
  );
}