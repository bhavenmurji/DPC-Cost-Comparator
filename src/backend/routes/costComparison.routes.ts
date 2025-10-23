import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { calculateCostComparison } from '../services/cost-calculator';

const router = Router();

// POST /api/v1/cost-comparison/calculate (public with optional auth)
router.post('/calculate', optionalAuthenticate, async (req, res) => {
  try {
    const { currentPlan, usage, profile } = req.body;

    if (!currentPlan || !usage || !profile) {
      return res.status(400).json({
        error: 'Missing required fields: currentPlan, usage, and profile are required'
      });
    }

    const calculationResult = calculateCostComparison(currentPlan, usage, profile);

    // Transform to frontend-expected format
    const response = {
      comparison: {
        traditional: calculationResult.insuranceOnly,
        dpc: calculationResult.dpcOnly,
        savings: calculationResult.potentialSavings,
        savingsPercentage: calculationResult.savingsPercentage,
      },
      providers: [], // TODO: Add provider search
      recommendations: [
        `Best option: ${calculationResult.bestOption.replace(/_/g, ' ').toUpperCase()}`,
        `Potential annual savings: $${calculationResult.potentialSavings.toFixed(2)}`,
        `You could save ${calculationResult.savingsPercentage.toFixed(1)}% on healthcare costs`,
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Legacy route for backwards compatibility
router.post('/', optionalAuthenticate, async (req, res) => {
  try {
    const { currentPlan, usage, profile } = req.body;

    if (!currentPlan || !usage || !profile) {
      return res.status(400).json({
        error: 'Missing required fields: currentPlan, usage, and profile are required'
      });
    }

    const calculationResult = calculateCostComparison(currentPlan, usage, profile);

    // Transform to frontend-expected format
    const response = {
      comparison: {
        traditional: calculationResult.insuranceOnly,
        dpc: calculationResult.dpcOnly,
        savings: calculationResult.potentialSavings,
        savingsPercentage: calculationResult.savingsPercentage,
      },
      providers: [], // TODO: Add provider search
      recommendations: [
        `Best option: ${calculationResult.bestOption.replace(/_/g, ' ').toUpperCase()}`,
        `Potential annual savings: $${calculationResult.potentialSavings.toFixed(2)}`,
        `You could save ${calculationResult.savingsPercentage.toFixed(1)}% on healthcare costs`,
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Authenticated routes for saved scenarios
router.use(authenticate);

// GET /api/v1/cost-comparison/scenarios
router.get('/scenarios', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// POST /api/v1/cost-comparison/scenarios
router.post('/scenarios', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/v1/cost-comparison/scenarios/:id
router.get('/scenarios/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// PATCH /api/v1/cost-comparison/scenarios/:id
router.patch('/scenarios/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// DELETE /api/v1/cost-comparison/scenarios/:id
router.delete('/scenarios/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
