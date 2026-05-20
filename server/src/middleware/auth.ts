import { Request, Response, NextFunction } from 'express';
import { verify } from '../utils/jwt';
import { error } from '../utils/response';
import db from '../db';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
}

// Extend the Express Request interface to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

/**
 * Protect routes — requires a valid Bearer JWT.
 * Attaches req.user = { id, phone_number, email, is_verified }
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    error(res, 'Authentication required', 401);
    return;
  }

  try {
    const payload = verify(token);
    const user = await db('users')
      .select('id', 'full_name', 'email', 'phone_number', 'is_verified')
      .where({ id: payload.id })
      .first();

    if (!user) {
      error(res, 'User not found', 401);
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch {
    error(res, 'Invalid or expired token', 401);
  }
};

/**
 * Require phone to be OTP-verified before accessing the route.
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user.is_verified) {
    error(res, 'Please verify your phone number first', 403);
    return;
  }
  next();
};
