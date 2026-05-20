"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const ctrl = __importStar(require("./auth.controller"));
const validate_1 = __importDefault(require("../../middleware/validate"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const phoneRule = (0, express_validator_1.body)('phone_number')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^254[0-9]{9}$/).withMessage('Phone must be in format 254XXXXXXXXX');
const passwordRule = (0, express_validator_1.body)('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number');
router.post('/register', [
    (0, express_validator_1.body)('full_name').trim().notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email address'),
    phoneRule,
    passwordRule,
], validate_1.default, ctrl.register);
router.post('/verify-phone', [phoneRule, (0, express_validator_1.body)('otp_code').notEmpty().withMessage('OTP code is required')], validate_1.default, ctrl.verifyPhone);
router.post('/resend-otp', [phoneRule], validate_1.default, ctrl.resendOtp);
router.post('/login', [phoneRule, (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')], validate_1.default, ctrl.login);
router.get('/me', auth_1.authenticate, ctrl.me);
router.patch('/change-password', auth_1.authenticate, [
    (0, express_validator_1.body)('current_password').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('new_password')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters'),
], validate_1.default, ctrl.changePassword);
exports.default = router;
