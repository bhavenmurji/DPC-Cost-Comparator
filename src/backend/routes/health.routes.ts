import { Router, Request, Response } from 'express';
import { config } from '../config/environment';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

router.get('/ready', (req: Request, res: Response) => {
  // Check database connection, redis, etc.
  // For now, simple check
  res.status(200).json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'live',
  });
});

export default router;
