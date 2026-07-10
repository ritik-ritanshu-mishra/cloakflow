import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Express error-handling middleware.
 * Intercepts validation errors and general server exceptions.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof ZodError) {
    logger.warn(
      `[Validator] Validation failed on ${req.method} ${req.url}: ${JSON.stringify(error.issues)}`
    );

    return res.status(400).json({
      error: 'Validation Error',
      issues: error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // General server exception logging
  logger.error(`[Server Exception] Unhandled error on ${req.method} ${req.url}:`, error);

  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
}
