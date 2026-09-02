import type { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function sendSuccess<T>({
  res,
  statusCode = 200,
  data,
  message,
  meta,
}: ApiResponseOptions<T>): void {
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
): void {
  res.status(200).json({
    success: true,
    data,
    meta: { pagination },
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
