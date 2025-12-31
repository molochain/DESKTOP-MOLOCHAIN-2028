import cron from 'node-cron';
import { Logger } from 'winston';
import { EventBus, WorkflowEvent } from './event-bus.js';
import { WorkflowRegistry, WorkflowDefinition } from './registry.js';

interface WorkflowRun {
  runId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  currentStep?: string;
  stepResults: Record<string, any>;
  error?: string;
}

interface WorkflowStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDurationMs: number;
  lastRunAt?: string;
  lastStatus?: string;
}

export class WorkflowOrchestrator {
  private eventBus: EventBus;
  private registry: WorkflowRegistry;
  private logger: Logger;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private activeRuns: Map<string, WorkflowRun> = new Map();
  private executionHistory: WorkflowRun[] = [];
  private workflowStats: Map<string, WorkflowStats> = new Map();

  constructor(eventBus: EventBus, registry: WorkflowRegistry, logger: Logger) {
    this.eventBus = eventBus;
    this.registry = registry;
    this.logger = logger;
  }

  getExecutionHistory(limit: number = 50): WorkflowRun[] {
    return this.executionHistory.slice(-limit);
  }

  getWorkflowStats(): Record<string, WorkflowStats> {
    return Object.fromEntries(this.workflowStats);
  }

  private updateStats(workflowId: string, run: WorkflowRun): void {
    const current = this.workflowStats.get(workflowId) || {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageDurationMs: 0
    };

    current.totalRuns++;
    if (run.status === 'completed') {
      current.successfulRuns++;
    } else if (run.status === 'failed') {
      current.failedRuns++;
    }

    if (run.completedAt && run.startedAt) {
      const duration = new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime();
      current.averageDurationMs = Math.round(
        (current.averageDurationMs * (current.totalRuns - 1) + duration) / current.totalRuns
      );
    }

    current.lastRunAt = run.completedAt || run.startedAt;
    current.lastStatus = run.status;

    this.workflowStats.set(workflowId, current);
  }

  setupEventHandlers(): void {
    const workflows = this.registry.getRegisteredWorkflows();
    for (const wf of workflows) {
      const definition = this.registry.get(wf.id);
      if (definition?.triggerEvents) {
        for (const eventType of definition.triggerEvents) {
          this.eventBus.subscribe(eventType, async (event) => {
            await this.handleEventTrigger(wf.id, event);
          });
        }
      }
    }
  }

  private async handleEventTrigger(workflowId: string, event: WorkflowEvent): Promise<void> {
    this.logger.info('Event triggered workflow', { workflowId, eventType: event.type, eventId: event.id });
    await this.triggerWorkflow(workflowId, { triggerEvent: event });
  }

  startScheduler(): void {
    const schedules = this.registry.getSchedules();
    
    for (const { workflowId, schedule } of schedules) {
      if (cron.validate(schedule)) {
        const job = cron.schedule(schedule, async () => {
          this.logger.info('Scheduled workflow triggered', { workflowId, schedule });
          await this.triggerWorkflow(workflowId, { triggeredBy: 'scheduler' });
        });
        this.scheduledJobs.set(workflowId, job);
        this.logger.info('Workflow scheduled', { workflowId, schedule });
      } else {
        this.logger.warn('Invalid cron schedule', { workflowId, schedule });
      }
    }
  }

  stopScheduler(): void {
    for (const [workflowId, job] of this.scheduledJobs) {
      job.stop();
      this.logger.info('Workflow schedule stopped', { workflowId });
    }
    this.scheduledJobs.clear();
  }

  async triggerWorkflow(workflowId: string, inputData: any = {}): Promise<WorkflowRun> {
    const workflow = this.registry.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const run: WorkflowRun = {
      runId: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      stepResults: {}
    };

    this.activeRuns.set(run.runId, run);
    
    await this.eventBus.publish('workflow.started', {
      runId: run.runId,
      workflowId,
      workflowName: workflow.name
    });

    this.executeWorkflow(workflow, run, inputData).catch(error => {
      this.logger.error('Workflow execution failed', { runId: run.runId, error: error.message });
    });

    return run;
  }

  private async executeWorkflow(workflow: WorkflowDefinition, run: WorkflowRun, inputData: any): Promise<void> {
    run.status = 'running';
    let stepInput = inputData;

    try {
      for (const step of workflow.steps) {
        run.currentStep = step.id;
        this.logger.info('Executing workflow step', { runId: run.runId, stepId: step.id, stepName: step.name });

        await this.eventBus.publish('workflow.step.started', {
          runId: run.runId,
          workflowId: workflow.id,
          stepId: step.id,
          stepName: step.name
        });

        try {
          const result = await this.executeStep(step, stepInput, workflow.retryConfig);
          run.stepResults[step.id] = result;
          stepInput = { ...stepInput, ...result };

          await this.eventBus.publish('workflow.step.completed', {
            runId: run.runId,
            stepId: step.id,
            result
          });
        } catch (stepError: any) {
          await this.eventBus.publish('workflow.step.failed', {
            runId: run.runId,
            stepId: step.id,
            error: stepError.message
          });
          throw stepError;
        }
      }

      run.status = 'completed';
      run.completedAt = new Date().toISOString();
      
      await this.eventBus.publish('workflow.completed', {
        runId: run.runId,
        workflowId: workflow.id,
        duration: Date.now() - new Date(run.startedAt).getTime()
      });

      this.logger.info('Workflow completed successfully', { runId: run.runId, workflowId: workflow.id });

    } catch (error: any) {
      run.status = 'failed';
      run.error = error.message;
      run.completedAt = new Date().toISOString();

      await this.eventBus.publish('workflow.failed', {
        runId: run.runId,
        workflowId: workflow.id,
        error: error.message,
        failedStep: run.currentStep
      });

      this.logger.error('Workflow failed', { runId: run.runId, workflowId: workflow.id, error: error.message });
    }

    this.activeRuns.set(run.runId, run);
    this.executionHistory.push(run);
    if (this.executionHistory.length > 1000) {
      this.executionHistory.shift();
    }
    this.updateStats(workflow.id, run);
  }

  private async executeStep(
    step: { id: string; name: string; handler: string; timeout?: number },
    input: any,
    retryConfig?: { attempts: number; backoffMs: number }
  ): Promise<any> {
    const maxAttempts = retryConfig?.attempts || 1;
    const backoffMs = retryConfig?.backoffMs || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.callHandler(step.handler, input, step.timeout);
        return result;
      } catch (error: any) {
        this.logger.warn('Step execution failed', { stepId: step.id, attempt, maxAttempts, error: error.message });
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
      }
    }
  }

  private handlers: Map<string, (input: any) => Promise<any>> = new Map();

  registerHandler(handlerName: string, handler: (input: any) => Promise<any>): void {
    this.handlers.set(handlerName, handler);
    this.logger.info('Handler registered', { handlerName });
  }

  private async callHandler(handlerName: string, input: any, timeout?: number): Promise<any> {
    const timeoutMs = timeout || 30000;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Handler ${handlerName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.executeHandler(handlerName, input)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private async executeHandler(handlerName: string, input: any): Promise<any> {
    const handler = this.handlers.get(handlerName);
    
    if (handler) {
      this.logger.debug('Executing registered handler', { handler: handlerName });
      return await handler(input);
    }

    this.logger.debug('Handler not registered, using default execution', { handler: handlerName });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      handler: handlerName,
      executedAt: new Date().toISOString(),
      success: true,
      data: { processed: true, note: 'Default handler - register custom implementation' }
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    const workflow = this.registry.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const runs = Array.from(this.activeRuns.values())
      .filter(r => r.workflowId === workflowId)
      .slice(-10);

    return {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        schedule: workflow.schedule,
        stepsCount: workflow.steps.length
      },
      recentRuns: runs,
      isScheduled: this.scheduledJobs.has(workflowId)
    };
  }
}
