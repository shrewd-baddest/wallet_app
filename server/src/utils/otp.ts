import crypto from 'crypto';
import db from '../db';

/**
 * Generate a 6-digit OTP, store it in otp_verifications, return the code.
 */
export const generateOtp = async (phoneNumber: string): Promise<string> => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  );

  await db('otp_verifications')
    .where({ phone_number: phoneNumber, verified: false })
    .update({ verified: true });

  await db('otp_verifications').insert({
    phone_number: phoneNumber,
    otp_code: otp,
    expires_at: expiresAt,
    verified: false,
  });

  return otp;
};

/**
 * Verify an OTP. Returns true and marks it verified, or throws if invalid/expired.
 */
export const verifyOtp = async (phoneNumber: string, code: string): Promise<true> => {
  const record = await db('otp_verifications')
    .where({ phone_number: phoneNumber, otp_code: code, verified: false })
    .where('expires_at', '>', new Date())
    .orderBy('created_at', 'desc')
    .first();

  if (!record) {
    const err = Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
    throw err;
  }

  await db('otp_verifications').where({ id: record.id }).update({ verified: true });
  return true;
};
