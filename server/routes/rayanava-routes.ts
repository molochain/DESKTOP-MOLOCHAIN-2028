/**
 * Rayanava AI API Routes
 * Exposes Rayanava's independent AI capabilities to MoloChain
 */

import { Router, Request, Response } from 'express';
import { rayanavaBridge } from '../ai/rayanava/integration-bridge';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

/**
 * Get Rayanava's status and capabilities
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = rayanavaBridge.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting Rayanava status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Rayanava status'
    });
  }
});

/**
 * Chat with Rayanava AI character
 */
router.post('/chat', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { message, context, sessionId } = req.body;
    const userId = (req as any).user?.id;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await rayanavaBridge.chat(message, context, userId, chatSessionId);
    
    res.json({
      success: true,
      data: {
        ...response,
        sessionId: chatSessionId
      }
    });
  } catch (error) {
    console.error('Error in Rayanava chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request'
    });
  }
});

/**
 * Process general AI request through Rayanava
 */
router.post('/process', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type, context, data, requirements } = req.body;
    
    const result = await rayanavaBridge.process({
      type: type || 'general',
      context,
      data,
      requirements
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing Rayanava request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
});

/**
 * Process logistics-specific request
 */
router.post('/logistics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type, data, context } = req.body;
    
    const result = await rayanavaBridge.processLogisticsRequest({
      type,
      data,
      context
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in logistics processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process logistics request'
    });
  }
});

/**
 * Get business intelligence analysis
 */
router.post('/business-intelligence', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { query, data } = req.body;
    
    const result = await rayanavaBridge.getBusinessIntelligence(query, data);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in business intelligence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate business intelligence'
    });
  }
});

/**
 * Monitor operations with AI
 */
router.post('/monitor-operations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { metrics, thresholds } = req.body;
    
    const result = await rayanavaBridge.monitorOperations(metrics, thresholds);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in operations monitoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to monitor operations'
    });
  }
});

/**
 * Execute Rayanava workflow
 */
router.post('/workflow', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { workflowId, inputData } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    const result = await rayanavaBridge.executeWorkflow(workflowId, inputData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow'
    });
  }
});

/**
 * Generate marketing content
 */
router.post('/generate-content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type, topic, keywords, tone, length } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Content type is required'
      });
    }
    
    const result = await rayanavaBridge.generateContent({
      type,
      topic,
      keywords,
      tone,
      length
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

/**
 * Handle sales automation tasks
 */
router.post('/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { task, leadData, context } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Sales task is required'
      });
    }
    
    const result = await rayanavaBridge.handleSalesTask({
      task,
      leadData,
      context
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error handling sales task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle sales task'
    });
  }
});

export default router;