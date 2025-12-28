/**
 * Collaboration Domain Registrar
 * Consolidates all collaboration-related route registrations
 * 
 * Routes consolidated:
 * - collaborationRoutes: Real-time collaboration features and endpoints
 * - collaborativeDocumentsRoutes: Google Drive collaborative document creation and sharing
 * - developerWorkspaceRoutes: Developer workspace collaboration features
 */

import type { Express } from "express";
import collaborationRoutes from "../api/collaboration/collaboration";
import collaborativeDocumentsRoutes from "../routes/collaborativeDocuments";
import developerWorkspaceRoutes from "../routes/developer-workspace";

/**
 * Registers all collaboration-related routes
 * @param app - Express application instance
 */
export function registerCollaborationRoutes(app: Express): void {
  app.use("/api", collaborationRoutes);
  app.use("/api/collaborative-documents", collaborativeDocumentsRoutes);
  app.use("/api/collaboration/workspace", developerWorkspaceRoutes);
}
