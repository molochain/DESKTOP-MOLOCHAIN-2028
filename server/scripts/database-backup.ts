/**
 * Database Backup and Recovery Script
 * Production-grade backup system for PostgreSQL
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export class DatabaseBackup {
  private backupDir = path.join(process.cwd(), 'backups');
  private maxBackups = 7; // Keep 7 days of backups
  
  constructor() {
    this.ensureBackupDirectory();
  }
  
  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }
  }
  
  /**
   * Create a database backup
   */
  public async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }
    
    try {
      logger.info(`Starting database backup to: ${backupFile}`);
      
      // Create backup using pg_dump
      const command = `pg_dump "${databaseUrl}" > "${backupFile}"`;
      await execAsync(command);
      
      // Compress the backup
      await execAsync(`gzip "${backupFile}"`);
      const compressedFile = `${backupFile}.gz`;
      
      // Verify backup was created
      const stats = fs.statSync(compressedFile);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      logger.info(`Backup completed successfully: ${compressedFile} (${sizeMB} MB)`);
      
      // Clean old backups
      await this.cleanOldBackups();
      
      return compressedFile;
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }
  
  /**
   * Restore database from backup
   */
  public async restoreBackup(backupFile: string): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    try {
      logger.info(`Starting database restore from: ${backupFile}`);
      
      // Decompress if needed
      let sqlFile = backupFile;
      if (backupFile.endsWith('.gz')) {
        await execAsync(`gunzip -c "${backupFile}" > "${backupFile.replace('.gz', '')}"`);
        sqlFile = backupFile.replace('.gz', '');
      }
      
      // Restore database
      const command = `psql "${databaseUrl}" < "${sqlFile}"`;
      await execAsync(command);
      
      logger.info('Database restored successfully');
      
      // Clean up decompressed file if we created one
      if (sqlFile !== backupFile) {
        fs.unlinkSync(sqlFile);
      }
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }
  
  /**
   * List available backups
   */
  public listBackups(): string[] {
    const files = fs.readdirSync(this.backupDir);
    return files
      .filter(f => f.startsWith('backup-') && f.endsWith('.gz'))
      .sort()
      .reverse();
  }
  
  /**
   * Clean old backups
   */
  private async cleanOldBackups(): Promise<void> {
    const backups = this.listBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        const filePath = path.join(this.backupDir, backup);
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${backup}`);
      }
    }
  }
  
  /**
   * Verify database connection
   */
  public async verifyConnection(): Promise<boolean> {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return false;
    }
    
    try {
      const result = await execAsync(`psql "${databaseUrl}" -c "SELECT 1"`);
      return result.stdout.includes('1');
    } catch {
      return false;
    }
  }
  
  /**
   * Get backup metadata
   */
  public getBackupInfo(backupFile: string): any {
    const filePath = path.join(this.backupDir, backupFile);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    const timestamp = backupFile.match(/backup-(.+)\.sql\.gz/)?.[1];
    
    return {
      file: backupFile,
      path: filePath,
      size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
      created: stats.birthtime,
      timestamp: timestamp?.replace(/-/g, ':').replace('T', ' ')
    };
  }
}

// Command-line interface
if (require.main === module) {
  const backup = new DatabaseBackup();
  const command = process.argv[2];
  
  async function run() {
    try {
      switch (command) {
        case 'backup':
          await backup.createBackup();
          break;
        case 'restore':
          const file = process.argv[3];
          if (!file) {
            console.error('Please specify backup file to restore');
            process.exit(1);
          }
          await backup.restoreBackup(file);
          break;
        case 'list':
          const backups = backup.listBackups();
          console.log('Available backups:');
          backups.forEach(b => {
            const info = backup.getBackupInfo(b);
            console.log(`  - ${b} (${info.size})`);
          });
          break;
        default:
          console.log('Usage: tsx database-backup.ts [backup|restore|list] [file]');
          process.exit(1);
      }
    } catch (error) {
      console.error('Operation failed:', error);
      process.exit(1);
    }
  }
  
  run();
}

export const databaseBackup = new DatabaseBackup();