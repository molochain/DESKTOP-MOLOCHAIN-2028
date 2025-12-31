import express from 'express';
import { WorkflowOrchestrator } from './orchestrator.js';
import { EventBus } from './event-bus.js';
import { WorkflowRegistry } from './registry.js';
import { createLogger } from './logger.js';
import { registerDefaultHandlers } from './handlers/index.js';

const app = express();
const port = process.env.PORT || 5003;
const logger = createLogger('workflow-orchestrator');

app.use(express.json());

const eventBus = new EventBus({
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  logger
});

const registry = new WorkflowRegistry(logger);
const orchestrator = new WorkflowOrchestrator(eventBus, registry, logger);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    workflows: registry.getRegisteredWorkflows(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/workflows', (req, res) => {
  res.json({
    workflows: registry.getRegisteredWorkflows(),
    schedules: registry.getSchedules()
  });
});

app.post('/api/workflows/:workflowId/trigger', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const result = await orchestrator.triggerWorkflow(workflowId, req.body);
    res.json({ success: true, result });
  } catch (error: any) {
    logger.error('Failed to trigger workflow', { workflowId: req.params.workflowId, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workflows/:workflowId/status', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const status = await orchestrator.getWorkflowStatus(workflowId);
    res.json(status);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await eventBus.getRecentEvents(50);
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    await eventBus.publish(eventType, payload);
    res.json({ success: true, eventType });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  res.json({
    stats: orchestrator.getWorkflowStats(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({
    history: orchestrator.getExecutionHistory(limit),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/metrics', (req, res) => {
  const stats = orchestrator.getWorkflowStats();
  const workflows = registry.getRegisteredWorkflows();
  
  let metrics = '# HELP workflow_runs_total Total number of workflow runs\n';
  metrics += '# TYPE workflow_runs_total counter\n';
  
  for (const [workflowId, stat] of Object.entries(stats)) {
    metrics += `workflow_runs_total{workflow="${workflowId}",status="success"} ${stat.successfulRuns}\n`;
    metrics += `workflow_runs_total{workflow="${workflowId}",status="failed"} ${stat.failedRuns}\n`;
  }
  
  metrics += '\n# HELP workflow_duration_ms_avg Average workflow execution duration in milliseconds\n';
  metrics += '# TYPE workflow_duration_ms_avg gauge\n';
  
  for (const [workflowId, stat] of Object.entries(stats)) {
    metrics += `workflow_duration_ms_avg{workflow="${workflowId}"} ${stat.averageDurationMs}\n`;
  }
  
  metrics += '\n# HELP workflow_orchestrator_uptime_seconds Uptime of the workflow orchestrator\n';
  metrics += '# TYPE workflow_orchestrator_uptime_seconds gauge\n';
  metrics += `workflow_orchestrator_uptime_seconds ${Math.round(process.uptime())}\n`;
  
  metrics += '\n# HELP workflows_registered_total Total number of registered workflows\n';
  metrics += '# TYPE workflows_registered_total gauge\n';
  metrics += `workflows_registered_total ${workflows.length}\n`;
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

async function start() {
  try {
    await eventBus.connect();
    logger.info('Event bus connected');

    registry.registerBuiltInWorkflows();
    logger.info('Built-in workflows registered', { count: registry.getRegisteredWorkflows().length });

    registerDefaultHandlers(orchestrator, logger);
    logger.info('Default handlers registered');

    orchestrator.setupEventHandlers();
    logger.info('Event handlers configured');

    orchestrator.startScheduler();
    logger.info('Workflow scheduler started');

    app.listen(port, () => {
      logger.info(`Workflow Orchestrator running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start orchestrator', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  orchestrator.stopScheduler();
  await eventBus.disconnect();
  process.exit(0);
});

start();
