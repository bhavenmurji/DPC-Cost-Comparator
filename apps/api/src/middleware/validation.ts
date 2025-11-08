/**
 * Validation Middleware using Zod
 *
 * Security Hardening: Generic middleware for request validation
 * - Validates request body, query params, or route params
 * - Returns user-friendly error messages
 * - Prevents invalid data from reaching controllers
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation targets
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation error response format
 */
interface ValidationErrorResponse {
  error: string;
  details: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Generic validation middleware factory
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 * @returns Express middleware function
 *
 * @example
 * router.post('/calculate',
 *   validate(ComparisonInputSchema, 'body'),
 *   calculateHandler
 * );
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get the data to validate based on target
      const dataToValidate = req[target];

      // Validate and parse the data
      const validatedData = await schema.parseAsync(dataToValidate);

      // Replace the request data with validated and sanitized data
      req[target] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const errorResponse: ValidationErrorResponse = {
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        };

        res.status(400).json(errorResponse);
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
}

/**
 * Convenience function for body validation
 * Most common use case
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Convenience function for query parameter validation
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Convenience function for route parameter validation
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

/**
 * Multiple validation middleware
 * Validates multiple parts of the request
 *
 * @example
 * router.get('/providers/:id',
 *   validateMultiple({
 *     params: ProviderIdSchema,
 *     query: PaginationSchema
 *   }),
 *   getProviderHandler
 * );
 */
export function validateMultiple(validators: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ValidationErrorResponse = {
      error: 'Validation failed',
      details: [],
    };

    try {
      // Validate body if schema provided
      if (validators.body) {
        try {
          req.body = await validators.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.details.push(
              ...error.errors.map((err) => ({
                field: `body.${err.path.join('.')}`,
                message: err.message,
              }))
            );
          }
        }
      }

      // Validate query if schema provided
      if (validators.query) {
        try {
          req.query = await validators.query.parseAsync(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.details.push(
              ...error.errors.map((err) => ({
                field: `query.${err.path.join('.')}`,
                message: err.message,
              }))
            );
          }
        }
      }

      // Validate params if schema provided
      if (validators.params) {
        try {
          req.params = await validators.params.parseAsync(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.details.push(
              ...error.errors.map((err) => ({
                field: `params.${err.path.join('.')}`,
                message: err.message,
              }))
            );
          }
        }
      }

      // If any validation errors, return 400
      if (errors.details.length > 0) {
        res.status(400).json(errors);
        return;
      }

      next();
    } catch (error) {
      console.error('Multiple validation error:', error);
      res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
}

/**
 * Optional validation middleware
 * Only validates if data is present, otherwise passes through
 * Useful for optional fields or PATCH endpoints
 */
export function validateOptional(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dataToValidate = req[target];

    // If no data or empty object, skip validation
    if (!dataToValidate || Object.keys(dataToValidate).length === 0) {
      return next();
    }

    // Otherwise, validate normally
    return validate(schema, target)(req, res, next);
  };
}
