"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seed = async (knex) => {
    // Clean tables in reverse FK order
    await knex('transaction_logs').del();
    await knex('otp_verifications').del();
    await knex('transfers').del();
    await knex('withdrawals').del();
    await knex('transactions').del();
    await knex('mpesa_transactions').del();
    await knex('wallets').del();
    await knex('users').del();
    const hash = await bcryptjs_1.default.hash('Password1!', 10);
    const [userId] = await knex('users').insert({
        full_name: 'Jane Wanjiru',
        email: 'jane@example.com',
        phone_number: '254712345678',
        password: hash,
        is_verified: true,
    });
    await knex('wallets').insert({
        user_id: userId,
        balance: 234580.00,
        currency: 'KES',
        status: 'active',
    });
};
exports.seed = seed;
