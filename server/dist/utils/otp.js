"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../db"));
/**
 * Generate a 6-digit OTP, store it in otp_verifications, return the code.
 */
const generateOtp = async (phoneNumber) => {
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000);
    await (0, db_1.default)('otp_verifications')
        .where({ phone_number: phoneNumber, verified: false })
        .update({ verified: true });
    await (0, db_1.default)('otp_verifications').insert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false,
    });
    return otp;
};
exports.generateOtp = generateOtp;
/**
 * Verify an OTP. Returns true and marks it verified, or throws if invalid/expired.
 */
const verifyOtp = async (phoneNumber, code) => {
    const record = await (0, db_1.default)('otp_verifications')
        .where({ phone_number: phoneNumber, otp_code: code, verified: false })
        .where('expires_at', '>', new Date())
        .orderBy('created_at', 'desc')
        .first();
    if (!record) {
        const err = Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
        throw err;
    }
    await (0, db_1.default)('otp_verifications').where({ id: record.id }).update({ verified: true });
    return true;
};
exports.verifyOtp = verifyOtp;
