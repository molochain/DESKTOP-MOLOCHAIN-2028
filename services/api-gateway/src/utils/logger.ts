import winston from 'winston';
import { gatewayConfig } from '../config/services.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: gatewayConfig.logLevel,
  format: logFormat,
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
        })
      )
    })
  ]
});

export function createLoggerWithContext(context: string) {
  return logger.child({ context });
}
