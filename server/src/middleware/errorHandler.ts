import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { error as sendError } from '../utils/response';

interface HttpError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: HttpError, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Something went wrong. Please try again.';

  sendError(res, message, statusCode);
};

export default errorHandler;
