import { Router, Request, Response } from 'express';
import os from 'os';

const router = Router();

/**
 * GET /api/external/status
 * وضعیت خارجی/عمومی سرور رو برمی‌گردونه (برای health-check و تست از بیرون)
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    server: {
      hostname: os.hostname(),
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
    },
    meta: {
      service: 'molochain-platform',
      source: 'external-status-route',
    },
  });
});

export default router;
