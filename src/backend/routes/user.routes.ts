import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// PATCH /api/v1/users/me
router.patch('/me', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// DELETE /api/v1/users/me
router.delete('/me', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
