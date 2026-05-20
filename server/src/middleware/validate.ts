import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { error } from '../utils/response';

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const errors = result.array().map((e) => ({ field: (e as any).path, message: e.msg }));
  error(res, 'Validation failed', 422, errors);
};

export default validate;
