import { Router } from 'express';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.use(optionalAuthenticate);

// GET /api/v1/insurance/carriers
router.get('/carriers', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/insurance/plans
router.get('/plans', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/insurance/plans/:id
router.get('/plans/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/insurance/search
router.get('/search', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
