import { Router, Request, Response } from 'express';
import { otmsClient } from '../../services/otms-client';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * OTMS Public API Routes
 * 
 * These routes provide public access to order tracking functionality
 * via the OTMS (Order Tracking Management System) at opt.molochain.com
 * 
 * Routes:
 * - GET /api/otms/health - Health check for OTMS connection
 * - GET /api/otms/track/:trackingId - Get order by tracking ID
 * - GET /api/otms/status/:trackingId - Get order status history
 * - GET /api/otms/search - Search orders (optional)
 */

/**
 * GET /api/otms/health
 * Health check endpoint for OTMS service
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthStatus = await otmsClient.healthCheck();
    const stats = otmsClient.getStats();

    res.json({
      success: true,
      service: 'OTMS',
      ...healthStatus,
      stats: {
        totalRequests: stats.totalRequests,
        successRate: stats.totalRequests > 0 
          ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
          : 'N/A',
        averageLatencyMs: Math.round(stats.averageLatencyMs),
      },
    });
  } catch (error) {
    logger.error('OTMS health check failed:', error);
    res.status(503).json({
      success: false,
      service: 'OTMS',
      status: 'error',
      message: 'Failed to check OTMS health',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/otms/track/:trackingId
 * Get order details by tracking ID
 */
router.get('/track/:trackingId', async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId || trackingId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Tracking ID is required',
      });
    }

    const order = await otmsClient.getOrder(trackingId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        trackingId,
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    logger.error('Failed to track order:', {
      trackingId: req.params.trackingId,
      error: error.message,
    });

    // Handle specific error cases
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ETIMEDOUT')) {
      return res.status(503).json({
        success: false,
        error: 'OTMS service is temporarily unavailable',
        message: 'Please try again later',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch order information',
      message: error.message,
    });
  }
});

/**
 * GET /api/otms/status/:trackingId
 * Get order status history by tracking ID
 */
router.get('/status/:trackingId', async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId || trackingId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Tracking ID is required',
      });
    }

    const statusHistory = await otmsClient.getOrderStatus(trackingId);

    res.json({
      success: true,
      trackingId,
      data: statusHistory,
      count: statusHistory.length,
    });
  } catch (error: any) {
    logger.error('Failed to get order status:', {
      trackingId: req.params.trackingId,
      error: error.message,
    });

    // Handle specific error cases
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ETIMEDOUT')) {
      return res.status(503).json({
        success: false,
        error: 'OTMS service is temporarily unavailable',
        message: 'Please try again later',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch order status',
      message: error.message,
    });
  }
});

/**
 * GET /api/otms/search
 * Search orders with query parameters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, status, origin, destination, from_date, to_date, page, limit } = req.query;

    const searchResult = await otmsClient.searchOrders({
      q: q as string,
      status: status as string,
      origin: origin as string,
      destination: destination as string,
      fromDate: from_date as string,
      toDate: to_date as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json({
      success: true,
      ...searchResult,
    });
  } catch (error: any) {
    logger.error('Failed to search orders:', {
      query: req.query,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search orders',
      message: error.message,
      // Return empty result for graceful degradation
      orders: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    });
  }
});

/**
 * GET /api/otms/diagnostics
 * Get diagnostic information about OTMS connection (for admin/debugging)
 */
router.get('/diagnostics', async (_req: Request, res: Response) => {
  try {
    const diagnostics = await otmsClient.getDiagnosticSummary();

    res.json({
      success: true,
      ...diagnostics,
    });
  } catch (error: any) {
    logger.error('Failed to get OTMS diagnostics:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get diagnostics',
      message: error.message,
    });
  }
});

export default router;
