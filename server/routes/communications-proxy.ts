import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';

const router = Router();

const COMMS_HUB_URL = process.env.COMMS_HUB_URL || 'http://localhost:7020';

router.use(isAuthenticated);
router.use(isAdmin);

router.all('/*', async (req: Request, res: Response) => {
  const path = req.params[0] || '';
  const targetUrl = `${COMMS_HUB_URL}/api/${path}`;

  try {
    const response = await axios({
      method: req.method as any,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.ip,
        'X-Request-ID': req.headers['x-request-id'] || '',
      },
      timeout: 30000,
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      logger.error('Communications Hub not available:', targetUrl);
      return res.status(503).json({
        error: 'Communications Hub service unavailable',
        message: 'The communications service is not running. Please start it first.',
      });
    }

    logger.error('Communications proxy error:', axiosError.message);
    res.status(500).json({
      error: 'Proxy error',
      message: axiosError.message,
    });
  }
});

export default router;
