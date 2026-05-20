"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const db_1 = __importDefault(require("../db"));
/**
 * Protect routes — requires a valid Bearer JWT.
 * Attaches req.user = { id, phone_number, email, is_verified }
 */
const authenticate = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        (0, response_1.error)(res, 'Authentication required', 401);
        return;
    }
    try {
        const payload = (0, jwt_1.verify)(token);
        const user = await (0, db_1.default)('users')
            .select('id', 'full_name', 'email', 'phone_number', 'is_verified')
            .where({ id: payload.id })
            .first();
        if (!user) {
            (0, response_1.error)(res, 'User not found', 401);
            return;
        }
        req.user = user;
        next();
    }
    catch {
        (0, response_1.error)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
/**
 * Require phone to be OTP-verified before accessing the route.
 */
const requireVerified = (req, res, next) => {
    if (!req.user.is_verified) {
        (0, response_1.error)(res, 'Please verify your phone number first', 403);
        return;
    }
    next();
};
exports.requireVerified = requireVerified;
