export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogMessage {
  timestamp: number;
  message: string;
  level: LogLevel;
  metadata?: Record<string, any>;
}