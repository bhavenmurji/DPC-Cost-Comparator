import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { calculateCostComparison } from '../services/cost-calculator';
import { validateBody } from '../middleware/validation';
import { CostComparisonCalculateSchema } from '../validators/schemas';

const router = Router();

// POST /api/v1/cost-comparison/calculate (public with optional auth)
// Validates input using Zod schema for security
router.post('/calculate', optionalAuthenticate, validateBody(CostComparisonCalculateSchema), async (req, res) => {
  try {
    // Data is already validated and sanitized by middleware
    const { currentPlan, usage, profile } = req.body;

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
router.post('/', optionalAuthenticate, validateBody(CostComparisonCalculateSchema), async (req, res) => {
  try {
    // Data is already validated and sanitized by middleware
    const { currentPlan, usage, profile } = req.body;

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
