export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly retryAfter?: number;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    isOperational = true,
    retryAfter?: number
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.retryAfter = retryAfter;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(resource = 'Resource', code = 'NOT_FOUND') {
    return new ApiError(404, code, `${resource} not found`);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED', retryAfter?: number) {
    return new ApiError(429, code, message, true, retryAfter);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message, false);
  }

  static validationError(message: string, code = 'VALIDATION_ERROR') {
    return new ApiError(422, code, message);
  }
}
