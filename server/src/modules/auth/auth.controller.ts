import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../../db';
import { sign } from '../../utils/jwt';
import { generateOtp, verifyOtp } from '../../utils/otp';
import { success, error } from '../../utils/response';
import logger from '../../utils/logger';

// ── Register ──────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { full_name, email, phone_number, password } = req.body as {
    full_name: string;
    email?: string;
    phone_number: string;
    password: string;
  };

  try {
    const exists = await db('users').where({ phone_number }).first();
    if (exists) {
      error(res, 'Phone number already registered', 409);
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const [userId] = await db('users').insert({ full_name, email, phone_number, password: hash });

    await db('wallets').insert({ user_id: userId, balance: 0.0, currency: 'KES', status: 'active' });

    const otp = await generateOtp(phone_number);
    logger.info(`OTP for ${phone_number}: ${otp}`); // Remove in production — send via SMS

    success(res, { user_id: userId }, 'Registration successful. OTP sent to your phone.', 201);
  } catch (err) {
    next(err);
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────
export const verifyPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { phone_number, otp_code } = req.body as { phone_number: string; otp_code: string };

  try {
    await verifyOtp(phone_number, otp_code);
    await db('users').where({ phone_number }).update({ is_verified: true });
    success(res, {}, 'Phone verified successfully');
  } catch (err: any) {
    if (err.statusCode === 400) {
      error(res, err.message, 400);
      return;
    }
    next(err);
  }
};

// ── Resend OTP ────────────────────────────────────────────────────────────
export const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { phone_number } = req.body as { phone_number: string };

  try {
    const user = await db('users').where({ phone_number }).first();
    if (!user) {
      error(res, 'Phone number not found', 404);
      return;
    }

    const otp = await generateOtp(phone_number);
    logger.info(`Resend OTP for ${phone_number}: ${otp}`); // Replace with SMS in production

    success(res, {}, 'OTP resent successfully');
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { phone_number, password } = req.body as { phone_number: string; password: string };

  try {
    const user = await db('users').where({ phone_number }).first();
    if (!user) {
      error(res, 'Invalid credentials', 401);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordMatch) {
      error(res, 'Invalid credentials', 401);
      return;
    }

    const token = sign({ id: user.id as number, phone_number: user.phone_number as string });

    success(res, {
      token,
      user: {
        id:           user.id,
        full_name:    user.full_name,
        email:        user.email,
        phone_number: user.phone_number,
        is_verified:  user.is_verified,
      },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ── Me (current user) ─────────────────────────────────────────────────────
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallet = await db('wallets')
      .where({ user_id: req.user.id })
      .select('id', 'balance', 'currency', 'status')
      .first();

    success(res, { user: req.user, wallet });
  } catch (err) {
    next(err);
  }
};

// ── Change password ───────────────────────────────────────────────────────
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { current_password, new_password } = req.body as {
    current_password: string;
    new_password: string;
  };

  try {
    const user = await db('users').where({ id: req.user.id }).first();
    const match = await bcrypt.compare(current_password, user.password as string);
    if (!match) {
      error(res, 'Current password is incorrect', 400);
      return;
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db('users').where({ id: req.user.id }).update({ password: hash });

    success(res, {}, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
