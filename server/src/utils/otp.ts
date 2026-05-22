import crypto from "crypto";
import db from "../db";

 // Generate OTP
 
export const generateOtp = async (
    phoneNumber: string
): Promise<string> => {
    // Generate 6-digit OTP
    const otp = crypto
        .randomInt(100000, 999999)
        .toString();

    // OTP expiration
    const expiresMinutes = Number(
        process.env.OTP_EXPIRES_MINUTES || 5
    );

    const expiresAt = new Date(
        Date.now() + expiresMinutes * 60 * 1000
    );

    // Invalidate old OTPs
    await db("otp_verifications")
        .where({
            phone_number: phoneNumber,
            verified: false,
        })
        .update({
            verified: true,
        });

    // Store new OTP
    await db("otp_verifications").insert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false,
    });

    return otp;
};

 // Verify OTP
 
export const verifyOtp = async (
    phoneNumber: string,
    code: string
): Promise<true> => {
    // Find latest valid OTP
    const record = await db("otp_verifications")
        .where({
            phone_number: phoneNumber,
            otp_code: code,
            verified: false,
        })
        .where("expires_at", ">", new Date())
        .orderBy("created_at", "desc")
        .first();

    // Invalid or expired
    if (!record) {
        const err = new Error(
            "Invalid or expired OTP"
        ) as Error & {
            statusCode?: number;
        };

        err.statusCode = 400;

        throw err;
    }

    // Mark OTP as used
    await db("otp_verifications")
        .where({
            id: record.id,
        })
        .update({
            verified: true,
        });

    return true;
};

 // Optional Cleanup Utility
 
export const deleteExpiredOtps = async (): Promise<void> => {
    await db("otp_verifications")
        .where("expires_at", "<", new Date())
        .delete();
};