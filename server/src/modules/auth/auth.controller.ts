import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import db from "../../db";

import { sign } from "../../utils/jwt";
import { generateOtp, verifyOtp } from "../../utils/otp";

import { success, error } from "../../utils/response";
import logger from "../../utils/logger";

import { sendEmail } from "../../utils/email";

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const {
        full_name,
        email,
        phone_number,
        password,
    } = req.body as {
        full_name: string;
        email?: string;
        phone_number: string;
        password: string;
    };

    try {
        // Check existing user
        const exists = await db("users")
            .where({ phone_number })
            .first();

        // Already verified
        if (exists?.is_verified) {
            error(res, "Phone number already registered", 409);
            return;
        }

        // Delete unverified duplicate account
        if (exists && !exists.is_verified) {
            await db("wallets")
                .where({ user_id: exists.id })
                .delete();

            await db("users")
                .where({ id: exists.id })
                .delete();
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Insert user
        const [userId] = await db("users").insert({
            full_name,
            email,
            phone_number,
            password: hash,
            is_verified: false,
        });

        // Create wallet
        await db("wallets").insert({
            user_id: userId,
            balance: 0,
            currency: "KES",
            status: "active",
        });

        // Generate OTP
        const otp = await generateOtp(phone_number);

        logger.info(`OTP for ${phone_number}: ${otp}`);

        // Send OTP Email
        if (email) {
            await sendEmail({
                to: email,
                subject: "Verify Your Account",
                text: `Your OTP is ${otp}. It expires in 10 minutes.`,
            });
        }

        success(
            res,
            { user_id: userId },
            "Registration successful. OTP sent.",
            201
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// VERIFY PHONE
// ─────────────────────────────────────────────────────────────

export const verifyPhone = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { phone_number, otp_code } = req.body as {
        phone_number: string;
        otp_code: string;
    };

    try {
        // Verify OTP
        await verifyOtp(phone_number, otp_code);

        // Update verification status
        await db("users")
            .where({ phone_number })
            .update({
                is_verified: true,
            });

        success(res, {}, "Phone verified successfully");
    } catch (err: any) {
        if (err?.statusCode === 400) {
            error(res, err.message, 400);
            return;
        }

        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────────────────────

export const resendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { phone_number } = req.body as {
        phone_number: string;
    };

    try {
        const user = await db("users")
            .where({ phone_number })
            .first();

        if (!user) {
            error(res, "Phone number not found", 404);
            return;
        }

        // Generate new OTP
        const otp = await generateOtp(phone_number);

        logger.info(`Resend OTP for ${phone_number}: ${otp}`);

        // Send email only if email exists
        if (user.email) {
            await sendEmail({
                to: user.email,
                subject: "OTP Verification",
                text: `Your OTP is ${otp}. It expires in 10 minutes.`,
            });
        }

        success(res, {}, "OTP resent successfully");
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const {
        phone_number,
        password,
    } = req.body as {
        phone_number: string;
        password: string;
    };

    try {
        const user = await db("users")
            .where({ phone_number })
            .first();

        if (!user) {
            error(res, "Invalid credentials", 401);
            return;
        }

        // Prevent login before verification
        if (!user.is_verified) {
            error(
                res,
                "Please verify your phone number first",
                403
            );
            return;
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password as string
        );

        if (!passwordMatch) {
            error(res, "Invalid credentials", 401);
            return;
        }

        // Generate JWT
        const token = sign({
            id: user.id as number,
            phone_number: user.phone_number as string,
        });

        success(
            res,
            {
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    is_verified: user.is_verified,
                },
            },
            "Login successful"
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// CURRENT USER
// ─────────────────────────────────────────────────────────────

export const me = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const wallet = await db("wallets")
            .where({ user_id: req.user.id })
            .select(
                "id",
                "balance",
                "currency",
                "status"
            )
            .first();

        success(res, {
            user: req.user,
            wallet,
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const {
        current_password,
        new_password,
    } = req.body as {
        current_password: string;
        new_password: string;
    };

    try {
        const user = await db("users")
            .where({ id: req.user.id })
            .first();

        if (!user) {
            error(res, "User not found", 404);
            return;
        }

        // Verify old password
        const match = await bcrypt.compare(
            current_password,
            user.password as string
        );

        if (!match) {
            error(
                res,
                "Current password is incorrect",
                400
            );
            return;
        }

        // Hash new password
        const hash = await bcrypt.hash(new_password, 10);

        // Update password
        await db("users")
            .where({ id: req.user.id })
            .update({
                password: hash,
            });

        success(
            res,
            {},
            "Password updated successfully"
        );
    } catch (err) {
        next(err);
    }
};