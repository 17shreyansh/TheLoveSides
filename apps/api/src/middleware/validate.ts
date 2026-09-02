import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/ApiResponse.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Express middleware that validates request body, query, and params
 * against Zod schemas. Returns 422 with structured error details on failure.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          errors.push(path ? `${path}: ${issue.message}` : issue.message);
        }

        console.error('VALIDATION FAILED:', errors);
        sendError(res, 422, 'VALIDATION_ERROR', errors.join('; '));
        return;
      }

      next(error);
    }
  };
}
