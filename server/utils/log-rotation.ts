import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream, WriteStream } from 'fs';
import { logger } from './logger';

interface LogRotationConfig {
  maxSize: number; // Maximum size in bytes
  maxFiles: number; // Maximum number of backup files
  compress?: boolean; // Whether to compress old logs
}

export class LogRotation {
  private config: LogRotationConfig;
  private currentStream?: WriteStream;
  private currentSize: number = 0;
  private logPath: string;
  
  constructor(logPath: string, config: Partial<LogRotationConfig> = {}) {
    this.logPath = logPath;
    this.config = {
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB default
      maxFiles: config.maxFiles || 5,
      compress: config.compress || false
    };
    
    // Check current file size
    this.checkAndRotate();
    
    // Setup automatic rotation check every hour
    setInterval(() => this.checkAndRotate(), 3600000);
  }
  
  private async checkAndRotate() {
    try {
      const stats = fs.statSync(this.logPath);
      this.currentSize = stats.size;
      
      if (this.currentSize >= this.config.maxSize) {
        await this.rotate();
      }
    } catch (error) {
      // File doesn't exist yet, that's fine
      if ((error as any).code !== 'ENOENT') {
        logger.error('Error checking log file:', error);
      }
    }
  }
  
  private async rotate() {
    logger.info(`Rotating log file ${this.logPath} (size: ${this.currentSize} bytes)`);
    
    // Close current stream if exists
    if (this.currentStream) {
      this.currentStream.end();
    }
    
    const dir = path.dirname(this.logPath);
    const basename = path.basename(this.logPath, path.extname(this.logPath));
    const ext = path.extname(this.logPath);
    
    // Shift existing backup files
    for (let i = this.config.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${basename}.${i}${ext}`);
      const newFile = path.join(dir, `${basename}.${i + 1}${ext}`);
      
      if (fs.existsSync(oldFile)) {
        if (i === this.config.maxFiles - 1) {
          // Delete the oldest file
          fs.unlinkSync(oldFile);
        } else {
          // Rename to next number
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Rename current log to .1
    if (fs.existsSync(this.logPath)) {
      const backupPath = path.join(dir, `${basename}.1${ext}`);
      fs.renameSync(this.logPath, backupPath);
      
      if (this.config.compress) {
        // Compress the backup file
        await this.compressFile(backupPath);
      }
    }
    
    // Reset current size
    this.currentSize = 0;
    
    logger.info('Log rotation completed');
  }
  
  private async compressFile(filePath: string) {
    try {
      const zlib = await import('zlib');
      const pipeline = await import('stream').then(m => m.promises.pipeline);
      
      const gzipPath = `${filePath}.gz`;
      await pipeline(
        fs.createReadStream(filePath),
        zlib.createGzip(),
        fs.createWriteStream(gzipPath)
      );
      
      // Remove original file after compression
      fs.unlinkSync(filePath);
      
      logger.info(`Compressed log file to ${gzipPath}`);
    } catch (error) {
      logger.error('Error compressing log file:', error);
    }
  }
  
  write(data: string) {
    this.currentSize += Buffer.byteLength(data);
    
    if (this.currentSize >= this.config.maxSize) {
      this.checkAndRotate();
    }
  }
  
  getStream(): WriteStream {
    if (!this.currentStream || this.currentStream.destroyed) {
      this.currentStream = createWriteStream(this.logPath, { flags: 'a' });
    }
    return this.currentStream;
  }
}

// Initialize log rotation for main logs
export const setupLogRotation = () => {
  const logsDir = path.join(process.cwd(), 'logs');
  
  // Ensure logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Setup rotation for combined and error logs
  const combinedRotation = new LogRotation(
    path.join(logsDir, 'combined.log'),
    { maxSize: 5 * 1024 * 1024, maxFiles: 3 } // 5MB, keep 3 files
  );
  
  const errorRotation = new LogRotation(
    path.join(logsDir, 'error.log'),
    { maxSize: 2 * 1024 * 1024, maxFiles: 3 } // 2MB, keep 3 files
  );
  
  logger.info('Log rotation initialized');
  
  return { combinedRotation, errorRotation };
};