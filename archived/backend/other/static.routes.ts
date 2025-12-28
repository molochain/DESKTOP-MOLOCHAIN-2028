import { Express } from 'express';
import express from 'express';
import path from 'path';
import { logger } from '../utils/logger';

export function setupStaticRoutes(app: Express) {
  // Static file serving for uploads and projects
  app.use('/uploads', express.static(path.join(process.cwd(), 'attached_assets', 'uploads')));
  app.use('/projects', express.static(path.join(process.cwd(), 'attached_assets', 'projects')));
  
  // Serve images and other assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));
  
  logger.info('Static routes initialized');
}