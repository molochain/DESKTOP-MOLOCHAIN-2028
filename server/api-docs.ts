import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from './utils/logger';
import { isAuthenticated, isAdmin } from './core/auth/auth.service';

// Get current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Setup the API documentation routes
 * 
 * @param app Express application
 */
export function setupApiDocs(app: express.Application) {
  try {
    // Load the OpenAPI specification
    const openApiPath = path.join(__dirname, 'openapi.json');
    const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    
    // Serve Swagger UI for public documentation (limited information for security)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
      // Custom options for Swagger UI
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "MOLOCHAIN API Documentation",
      swaggerOptions: {
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
      }
    }));
    
    // Serve full documentation for authenticated admins with detailed information
    app.use('/api-docs/admin', 
      isAuthenticated, 
      isAdmin, 
      swaggerUi.serve, 
      swaggerUi.setup(openApiSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "MOLOCHAIN API Documentation (Admin)",
        swaggerOptions: {
          filter: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'list',
          persistAuthorization: true,
        }
      })
    );
    
    // Endpoint to download the OpenAPI specification
    app.get('/api-docs/spec', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="openapi.json"');
      res.send(openApiSpec);
    });
    
    logger.info('API Documentation setup complete');
  } catch (error) {
    logger.error('Failed to setup API documentation:', error);
    throw error;
  }
}