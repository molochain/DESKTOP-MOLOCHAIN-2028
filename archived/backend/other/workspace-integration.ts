
import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execAsync = promisify(exec);
const router = Router();

// Validation schemas
const repositoryActionSchema = z.object({
  action: z.enum(['setup', 'sync', 'status', 'update']),
  repository: z.string().optional(),
  branch: z.string().optional()
});

// Get workspace status
router.get('/status', async (req, res) => {
  try {
    const status = {
      mainApp: { status: 'running', port: 5000 },
      repositories: [],
      scripts: [],
      workflows: []
    };

    // Check repository status
    const repoStatus = await execAsync('node workspace-integration.js status').catch(() => ({ stdout: '{}' }));
    
    // Check available scripts
    const scripts = await execAsync('ls scripts/').catch(() => ({ stdout: '' }));
    status.scripts = scripts.stdout.split('\n').filter(Boolean);

    // Check processes
    const processes = await execAsync('ps aux | grep -E "(node|npm)" | grep -v grep').catch(() => ({ stdout: '' }));
    
    res.json({
      success: true,
      data: status,
      processes: processes.stdout.split('\n').filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute repository actions
router.post('/action', async (req, res) => {
  try {
    const { action, repository, branch } = repositoryActionSchema.parse(req.body);
    
    let command = '';
    
    switch (action) {
      case 'setup':
        command = './scripts/setup-repositories.sh';
        break;
      case 'sync':
        if (repository) {
          command = `./scripts/sync-individual.sh ${repository}`;
        } else {
          command = './scripts/sync-all.sh';
        }
        break;
      case 'status':
        command = 'node workspace-integration.js status';
        break;
      case 'update':
        command = './workspace-manager.sh update';
        break;
      default:
        throw new Error('Invalid action');
    }

    const result = await execAsync(command);
    
    res.json({
      success: true,
      data: {
        action,
        repository,
        branch,
        output: result.stdout,
        errors: result.stderr
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start development environment
router.post('/dev/start', async (req, res) => {
  try {
    // Start development mode in background
    exec('./workspace-manager.sh dev', (error, stdout, stderr) => {
      // Process runs in background
    });
    
    res.json({
      success: true,
      message: 'Development environment starting...',
      port: 5000
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available branches for MOLOCHAIN
router.get('/branches', async (req, res) => {
  try {
    const result = await execAsync('./scripts/branch-manager.sh list');
    const branches = result.stdout.split('\n').filter(Boolean);
    
    res.json({
      success: true,
      data: { branches }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Switch branch
router.post('/branches/switch', async (req, res) => {
  try {
    const { branch } = z.object({ branch: z.string() }).parse(req.body);
    
    const result = await execAsync(`./scripts/branch-manager.sh switch ${branch}`);
    
    res.json({
      success: true,
      message: `Switched to branch: ${branch}`,
      output: result.stdout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Repository health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      mainRepository: { status: 'healthy' },
      modules: [],
      lastSync: new Date().toISOString()
    };

    // Check each module
    const modules = ['molochain', 'ecosystem-panel', 'rayan-brain'];
    
    for (const module of modules) {
      try {
        const status = await execAsync(`cd modules/${module} && git status --porcelain`);
        health.modules.push({
          name: module,
          status: status.stdout.trim() ? 'modified' : 'clean',
          hasChanges: status.stdout.trim().length > 0
        });
      } catch {
        health.modules.push({
          name: module,
          status: 'not_found',
          hasChanges: false
        });
      }
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
