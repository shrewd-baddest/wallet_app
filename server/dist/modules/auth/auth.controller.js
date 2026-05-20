"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.login = exports.resendOtp = exports.verifyPhone = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../../db"));
const jwt_1 = require("../../utils/jwt");
const otp_1 = require("../../utils/otp");
const response_1 = require("../../utils/response");
const logger_1 = __importDefault(require("../../utils/logger"));
// ── Register ──────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    const { full_name, email, phone_number, password } = req.body;
    try {
        const exists = await (0, db_1.default)('users').where({ phone_number }).first();
        if (exists) {
            (0, response_1.error)(res, 'Phone number already registered', 409);
            return;
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const [userId] = await (0, db_1.default)('users').insert({ full_name, email, phone_number, password: hash });
        await (0, db_1.default)('wallets').insert({ user_id: userId, balance: 0.0, currency: 'KES', status: 'active' });
        const otp = await (0, otp_1.generateOtp)(phone_number);
        logger_1.default.info(`OTP for ${phone_number}: ${otp}`); // Remove in production — send via SMS
        (0, response_1.success)(res, { user_id: userId }, 'Registration successful. OTP sent to your phone.', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// ── Verify OTP ────────────────────────────────────────────────────────────
const verifyPhone = async (req, res, next) => {
    const { phone_number, otp_code } = req.body;
    try {
        await (0, otp_1.verifyOtp)(phone_number, otp_code);
        await (0, db_1.default)('users').where({ phone_number }).update({ is_verified: true });
        (0, response_1.success)(res, {}, 'Phone verified successfully');
    }
    catch (err) {
        if (err.statusCode === 400) {
            (0, response_1.error)(res, err.message, 400);
            return;
        }
        next(err);
    }
};
exports.verifyPhone = verifyPhone;
// ── Resend OTP ────────────────────────────────────────────────────────────
const resendOtp = async (req, res, next) => {
    const { phone_number } = req.body;
    try {
        const user = await (0, db_1.default)('users').where({ phone_number }).first();
        if (!user) {
            (0, response_1.error)(res, 'Phone number not found', 404);
            return;
        }
        const otp = await (0, otp_1.generateOtp)(phone_number);
        logger_1.default.info(`Resend OTP for ${phone_number}: ${otp}`); // Replace with SMS in production
        (0, response_1.success)(res, {}, 'OTP resent successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.resendOtp = resendOtp;
// ── Login ─────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    const { phone_number, password } = req.body;
    try {
        const user = await (0, db_1.default)('users').where({ phone_number }).first();
        if (!user) {
            (0, response_1.error)(res, 'Invalid credentials', 401);
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            (0, response_1.error)(res, 'Invalid credentials', 401);
            return;
        }
        const token = (0, jwt_1.sign)({ id: user.id, phone_number: user.phone_number });
        (0, response_1.success)(res, {
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                is_verified: user.is_verified,
            },
        }, 'Login successful');
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// ── Me (current user) ─────────────────────────────────────────────────────
const me = async (req, res, next) => {
    try {
        const wallet = await (0, db_1.default)('wallets')
            .where({ user_id: req.user.id })
            .select('id', 'balance', 'currency', 'status')
            .first();
        (0, response_1.success)(res, { user: req.user, wallet });
    }
    catch (err) {
        next(err);
    }
};
exports.me = me;
// ── Change password ───────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
    const { current_password, new_password } = req.body;
    try {
        const user = await (0, db_1.default)('users').where({ id: req.user.id }).first();
        const match = await bcryptjs_1.default.compare(current_password, user.password);
        if (!match) {
            (0, response_1.error)(res, 'Current password is incorrect', 400);
            return;
        }
        const hash = await bcryptjs_1.default.hash(new_password, 10);
        await (0, db_1.default)('users').where({ id: req.user.id }).update({ password: hash });
        (0, response_1.success)(res, {}, 'Password updated successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.changePassword = changePassword;
