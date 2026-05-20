import { Response } from 'express';

export const success = (
  res: Response,
  data: object = {},
  message = 'Success',
  statusCode = 200
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const error = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors: unknown[] | null = null
): void => {
  const body: Record<string, unknown> = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
