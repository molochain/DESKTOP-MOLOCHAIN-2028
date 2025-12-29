import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

const COMMS_HUB_URL = process.env.COMMS_HUB_URL || 'http://localhost:7020';

router.use(isAuthenticated);

router.get('/', async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await axios.get(`${COMMS_HUB_URL}/api/preferences/${userId}`, {
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      return res.json({
        userId: req.user?.id,
        preferences: {
          email: { enabled: true },
          sms: { enabled: true },
          whatsapp: { enabled: true },
          push: { enabled: true },
        },
        fallback: true,
      });
    }

    logger.error('Error fetching notification preferences:', axiosError.message);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.get('/:channel', async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const channel = req.params.channel;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await axios.get(
      `${COMMS_HUB_URL}/api/preferences/${userId}/${channel}`,
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      return res.json({
        userId: req.user?.id,
        channel: req.params.channel,
        enabled: true,
        fallback: true,
      });
    }

    logger.error('Error fetching channel preference:', axiosError.message);
    res.status(500).json({ error: 'Failed to fetch preference' });
  }
});

router.put('/', async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ 
        error: 'preferences object required',
        example: { email: true, sms: false, push: true }
      });
    }

    const response = await axios.put(
      `${COMMS_HUB_URL}/api/preferences/${userId}`,
      { preferences },
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      logger.error('Communications Hub not available');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Notification preferences service is not running',
      });
    }

    logger.error('Error updating preferences:', axiosError.message);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

router.put('/:channel', async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const channel = req.params.channel;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { enabled, address, preferences } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    const response = await axios.put(
      `${COMMS_HUB_URL}/api/preferences/${userId}/${channel}`,
      { enabled, address, preferences },
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      logger.error('Communications Hub not available');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Notification preferences service is not running',
      });
    }

    logger.error('Error updating channel preference:', axiosError.message);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

router.post('/unsubscribe/:channel', async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const channel = req.params.channel;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await axios.post(
      `${COMMS_HUB_URL}/api/preferences/${userId}/unsubscribe/${channel}`,
      {},
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      logger.error('Communications Hub not available');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Notification preferences service is not running',
      });
    }

    logger.error('Error unsubscribing:', axiosError.message);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
