import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('validation');

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'date' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

function validateField(value: any, rule: ValidationRule): string | null {
  if (value === undefined || value === null || value === '') {
    if (rule.required) {
      return `${rule.field} is required`;
    }
    return null;
  }
  
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${rule.field} must be a string`;
      }
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.field} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${rule.field} must be at most ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${rule.field} has invalid format`;
      }
      break;
      
    case 'number':
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (typeof num !== 'number' || isNaN(num)) {
        return `${rule.field} must be a number`;
      }
      if (rule.min !== undefined && num < rule.min) {
        return `${rule.field} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && num > rule.max) {
        return `${rule.field} must be at most ${rule.max}`;
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${rule.field} must be a boolean`;
      }
      break;
      
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return `${rule.field} must be a valid email address`;
      }
      break;
      
    case 'uuid':
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(value)) {
        return `${rule.field} must be a valid UUID`;
      }
      break;
      
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${rule.field} must be a valid date`;
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        return `${rule.field} must be an array`;
      }
      break;
      
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return `${rule.field} must be an object`;
      }
      break;
  }
  
  if (rule.enum && !rule.enum.includes(value)) {
    return `${rule.field} must be one of: ${rule.enum.join(', ')}`;
  }
  
  return null;
}

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const value = req.body?.[rule.field];
      const error = validateField(value, rule);
      
      if (error) {
        errors.push({
          field: rule.field,
          message: error,
          value: typeof value === 'string' && value.length > 100 
            ? value.substring(0, 100) + '...' 
            : value
        });
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Request body validation failed', {
        path: req.path,
        errors: errors.map(e => e.message)
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request body validation failed',
        errors
      });
    }
    
    next();
  };
}

export function validateQuery(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const value = req.query[rule.field];
      const error = validateField(value, rule);
      
      if (error) {
        errors.push({
          field: rule.field,
          message: error
        });
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Query parameter validation failed', {
        path: req.path,
        errors: errors.map(e => e.message)
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Query parameter validation failed',
        errors
      });
    }
    
    next();
  };
}

export function validateParams(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const value = req.params[rule.field];
      const error = validateField(value, rule);
      
      if (error) {
        errors.push({
          field: rule.field,
          message: error
        });
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Path parameter validation failed', {
        path: req.path,
        errors: errors.map(e => e.message)
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Path parameter validation failed',
        errors
      });
    }
    
    next();
  };
}

const maxBodySize = parseInt(process.env.MAX_BODY_SIZE || '10485760', 10);
const maxArrayLength = parseInt(process.env.MAX_ARRAY_LENGTH || '1000', 10);

export function validateRequestSize() {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    
    if (contentLength > maxBodySize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body exceeds maximum size of ${maxBodySize} bytes`
      });
    }
    
    if (req.body && Array.isArray(req.body)) {
      if (req.body.length > maxArrayLength) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Array exceeds maximum length of ${maxArrayLength} items`
        });
      }
    }
    
    next();
  };
}
