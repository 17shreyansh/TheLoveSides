import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
import { isProduction } from '../config/env.js';

/**
 * Global error handler. Must be the last middleware registered.
 * - Catches operational errors (ApiError) and returns structured responses.
 * - Catches unexpected errors and returns a generic 500.
 * - Never leaks stack traces or internal details in production.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error with request context
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({
        err,
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
      }, err.message);
    } else {
      logger.warn({
        code: err.code,
        statusCode: err.statusCode,
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
      }, err.message);
    }

    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    logger.warn({ err, requestId: req.requestId }, 'Mongoose validation error');
    sendError(res, 422, 'VALIDATION_ERROR', err.message);
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as unknown as { code: number }).code === 11000) {
    logger.warn({ err, requestId: req.requestId }, 'Duplicate key error');
    
    // Attempt to extract the conflicting field and value
    const anyErr = err as any;
    let message = 'A record with this value already exists';
    if (anyErr.keyValue) {
      const field = Object.keys(anyErr.keyValue)[0];
      const value = anyErr.keyValue[field];
      message = `The ${field} '${value}' is already in use. Please provide a unique value.`;
    }
    
    sendError(res, 409, 'DUPLICATE_ENTRY', message);
    return;
  }

  // Unexpected errors — log full details but return generic message
  logger.error({
    err,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  }, 'Unhandled error');

  const message = isProduction
    ? 'An unexpected error occurred'
    : err.message;

  sendError(res, 500, 'INTERNAL_ERROR', message);
}
