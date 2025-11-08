import { Router } from 'express';
import { optionalAuthenticate } from '../middleware/auth';
import { validateQuery, validateParams } from '../middleware/validation';
import { DPCProviderSearchQuerySchema, ProviderIdSchema } from '../validators/schemas';
import { searchLimiter, publicLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (with optional auth for personalization)
router.use(optionalAuthenticate);

// GET /api/v1/dpc-providers
// Rate limited: 300 requests per 15 minutes (public endpoint)
router.get('/', publicLimiter, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/:id
// Validates provider ID format
// Rate limited: 300 requests per 15 minutes (public endpoint)
router.get('/:id', publicLimiter, validateParams(ProviderIdSchema), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/search
// Validates search query parameters
// Rate limited: 30 requests per minute (search operation)
router.get('/search', searchLimiter, validateQuery(DPCProviderSearchQuerySchema), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/dpc-providers/:id/reviews
// Rate limited: 300 requests per 15 minutes (public endpoint)
router.get('/:id/reviews', publicLimiter, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
