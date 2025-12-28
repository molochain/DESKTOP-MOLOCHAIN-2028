import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { isAuthenticated } from '../core/auth/auth.service';
import { validateRequest } from '../middleware/validate';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  language: z.string().optional().default('javascript'),
});

const updateFileSchema = z.object({
  content: z.string(),
});

const createFileSchema = z.object({
  name: z.string().min(1).max(100),
  language: z.string().default('javascript'),
  content: z.string().default(''),
});

// Mock data for development (will be replaced with actual database)
let workspaceProjects = [
  {
    id: 'project-1',
    name: 'Logistics API Client',
    description: 'TypeScript client library for MoloChain APIs',
    files: [
      {
        id: 'file-1',
        name: 'index.ts',
        language: 'typescript',
        content: `// MoloChain API Client
import axios from 'axios';

export class MoloChainClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async getServices() {
    const response = await axios.get(\`\${this.baseURL}/api/services\`, {
      headers: { Authorization: \`Bearer \${this.apiKey}\` }
    });
    return response.data;
  }

  async trackShipment(trackingNumber: string) {
    const response = await axios.get(\`\${this.baseURL}/api/tracking/\${trackingNumber}\`, {
      headers: { Authorization: \`Bearer \${this.apiKey}\` }
    });
    return response.data;
  }
}`,
        lastModified: new Date().toISOString(),
        modifiedBy: 'user-1',
      },
      {
        id: 'file-2',
        name: 'types.ts',
        language: 'typescript',
        content: `// Type definitions for MoloChain API
export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

export interface TrackingData {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  lastUpdated: string;
}`,
        lastModified: new Date().toISOString(),
        modifiedBy: 'user-1',
      },
    ],
    collaborators: [
      {
        id: 'user-1',
        name: 'John Developer',
        avatar: '/api/placeholder/32/32',
        status: 'online' as const,
      },
      {
        id: 'user-2',
        name: 'Sarah Engineer',
        avatar: '/api/placeholder/32/32',
        status: 'away' as const,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-2',
    name: 'WebSocket Integration Example',
    description: 'Real-time tracking dashboard implementation',
    files: [
      {
        id: 'file-3',
        name: 'tracking-dashboard.tsx',
        language: 'typescript',
        content: `import React, { useEffect, useState } from 'react';

interface TrackingUpdate {
  trackingNumber: string;
  status: string;
  location: string;
  timestamp: string;
}

export default function TrackingDashboard() {
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket('wss://api.molochain.com/ws/tracking');
    
    websocket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [update, ...prev]);
    };

    setWs(websocket);

    return () => websocket.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Tracking Updates</h1>
      <div className="space-y-2">
        {updates.map((update, index) => (
          <div key={index} className="border p-3 rounded">
            <div className="font-semibold">{update.trackingNumber}</div>
            <div className="text-sm text-gray-600">
              {update.status} - {update.location}
            </div>
            <div className="text-xs text-gray-400">{update.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
        lastModified: new Date().toISOString(),
        modifiedBy: 'user-2',
      },
    ],
    collaborators: [
      {
        id: 'user-2',
        name: 'Sarah Engineer',
        avatar: '/api/placeholder/32/32',
        status: 'online' as const,
      },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Get all workspace projects
router.get('/projects', isAuthenticated, (req, res) => {
  try {
    logger.info('Fetching workspace projects', { userId: (req.user as any)?.id || (req.user as any)?.email });
    res.json(workspaceProjects);
  } catch (error) {
    logger.error('Error fetching workspace projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get specific project
router.get('/projects/:projectId', isAuthenticated, (req, res) => {
  try {
    const { projectId } = req.params;
    const project = workspaceProjects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    logger.info('Fetching workspace project', { projectId, userId: (req.user as any)?.id || (req.user as any)?.email });
    res.json(project);
  } catch (error) {
    logger.error('Error fetching workspace project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/projects', isAuthenticated, (req, res) => {
  try {
    const { name, description, language } = req.body;
    const userId = (req.user as any)?.id || (req.user as any)?.email || 'anonymous';

    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description,
      files: [
        {
          id: `file-${Date.now()}`,
          name: language === 'typescript' ? 'index.ts' : 'index.js',
          language,
          content: `// ${name}\n// Created by ${(req.user as any)?.email || 'Unknown'}\n\n// Start coding here\n`,
          lastModified: new Date().toISOString(),
          modifiedBy: userId || 'unknown',
        },
      ],
      collaborators: [
        {
          id: userId || 'unknown',
          name: (req.user as any)?.email || 'Unknown User',
          avatar: '/api/placeholder/32/32',
          status: 'online' as const,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workspaceProjects.push(newProject);

    logger.info('Created workspace project', { projectId: newProject.id, userId });
    res.status(201).json(newProject);
  } catch (error) {
    logger.error('Error creating workspace project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update file content
router.put('/projects/:projectId/files/:fileId', isAuthenticated, (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content } = req.body;
    const userId = (req.user as any)?.id || (req.user as any)?.email || 'anonymous';

    const project = workspaceProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const file = project.files.find(f => f.id === fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.content = content;
    file.lastModified = new Date().toISOString();
    file.modifiedBy = userId || 'unknown';
    project.updatedAt = new Date().toISOString();

    logger.info('Updated workspace file', { projectId, fileId, userId });
    res.json(file);
  } catch (error) {
    logger.error('Error updating workspace file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Create new file
router.post('/projects/:projectId/files', isAuthenticated, (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, language, content } = req.body;
    const userId = (req.user as any)?.id || (req.user as any)?.email || 'anonymous';

    const project = workspaceProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const newFile = {
      id: `file-${Date.now()}`,
      name,
      language,
      content,
      lastModified: new Date().toISOString(),
      modifiedBy: userId || 'unknown',
    };

    project.files.push(newFile);
    project.updatedAt = new Date().toISOString();

    logger.info('Created workspace file', { projectId, fileId: newFile.id, userId });
    res.status(201).json(newFile);
  } catch (error) {
    logger.error('Error creating workspace file:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// Delete file
router.delete('/projects/:projectId/files/:fileId', isAuthenticated, (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const userId = (req.user as any)?.id || (req.user as any)?.email || 'anonymous';

    const project = workspaceProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const fileIndex = project.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    project.files.splice(fileIndex, 1);
    project.updatedAt = new Date().toISOString();

    logger.info('Deleted workspace file', { projectId, fileId, userId });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting workspace file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get project collaborators
router.get('/projects/:projectId/collaborators', isAuthenticated, (req, res) => {
  try {
    const { projectId } = req.params;
    const project = workspaceProjects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    logger.info('Fetching project collaborators', { projectId, userId: (req.user as any)?.id || (req.user as any)?.email });
    res.json(project.collaborators);
  } catch (error) {
    logger.error('Error fetching project collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

export default router;