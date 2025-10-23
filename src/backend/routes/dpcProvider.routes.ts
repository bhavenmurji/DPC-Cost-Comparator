import { Router } from 'express';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.use(optionalAuthenticate);

// GET /api/v1/dpc-providers
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/:id
router.get('/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/search
router.get('/search', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/:id/reviews
router.get('/:id/reviews', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
