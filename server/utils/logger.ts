import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { MONITORING_CONFIG } from '../../config';

// Create a logger instance with log rotation
export const logger = winston.createLogger({
  level: MONITORING_CONFIG.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'molochain-platform' },
  transports: [
    // Console transport (MUST HAVE for stdout)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write error logs to files with daily rotation
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'error'
    }),
    // Write all logs to files with daily rotation
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'info'
    })
  ]
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Create a named logger with context
export function createLoggerWithContext(context: string) {
  return {
    info: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { context, ...meta });
    },
    warn: (message: string, meta?: Record<string, any>) => {
      logger.warn(message, { context, ...meta });
    },
    error: (message: string, error?: unknown, meta?: Record<string, any>) => {
      const errorMeta = error instanceof Error
        ? { 
            errorMessage: error.message, 
            stack: error.stack,
            ...meta 
          }
        : meta;
      logger.error(message, { context, ...errorMeta });
    },
    debug: (message: string, meta?: Record<string, any>) => {
      logger.debug(message, { context, ...meta });
    }
  };
}