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
const ctrl = __importStar(require("./wallet.controller"));
const validate_1 = __importDefault(require("../../middleware/validate"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const phoneRule = (0, express_validator_1.body)('phone_number')
    .matches(/^254[0-9]{9}$/)
    .withMessage('Phone must be in format 254XXXXXXXXX');
const amountRule = (0, express_validator_1.body)('amount')
    .isFloat({ min: 1, max: 150000 })
    .withMessage('Amount must be between KES 1 and 150,000');
router.use(auth_1.authenticate, auth_1.requireVerified);
router.get('/', ctrl.getWallet);
router.post('/deposit', [amountRule, phoneRule], validate_1.default, ctrl.initiateDeposit);
router.post('/withdraw', [
    amountRule,
    phoneRule,
    (0, express_validator_1.body)('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is KES 10'),
], validate_1.default, ctrl.initiateWithdrawal);
router.get('/deposit/status/:checkout_request_id', [(0, express_validator_1.param)('checkout_request_id').notEmpty()], validate_1.default, ctrl.queryStkStatus);
exports.default = router;
