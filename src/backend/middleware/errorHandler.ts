import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    // Log operational errors at appropriate level
    if (err.statusCode >= 500) {
      logger.error('Operational error', {
        error: err.message,
        stack: err.stack,
        errorCode: err.errorCode,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.warn('Client error', {
        error: err.message,
        errorCode: err.errorCode,
        path: req.path,
        method: req.method,
      });
    }

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorCode: err.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else {
    // Log unexpected errors
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
      errorCode: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack
      }),
    });
  }
};
