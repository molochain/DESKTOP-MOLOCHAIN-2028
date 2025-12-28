import crypto from 'crypto';
import { logger } from './logger';

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function verifyApiKey(plainKey: string, hashedKey: string): boolean {
  try {
    const computedHash = hashApiKey(plainKey);
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(hashedKey, 'hex');
    
    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch (error) {
    logger.error('Error verifying API key', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
}

export function generateApiKey(): { plain: string; hash: string } {
  const plain = crypto.randomBytes(32).toString('hex');
  const hash = hashApiKey(plain);
  return { plain, hash };
}

export function generateSecureApiKey(prefix: string = 'mk'): { plain: string; hash: string } {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const plain = `${prefix}_${randomPart}`;
  const hash = hashApiKey(plain);
  return { plain, hash };
}
