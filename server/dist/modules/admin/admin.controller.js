"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionLogs = exports.getFailedTransactions = exports.setWalletStatus = exports.listUsers = exports.getStats = void 0;
const db_1 = __importDefault(require("../../db"));
const response_1 = require("../../utils/response");
// ── Platform overview stats ────────────────────────────────────────────────
const getStats = async (_req, res, next) => {
    try {
        const [[{ total_users }]] = await db_1.default.raw('SELECT COUNT(*) as total_users FROM users');
        const [[{ active_wallets }]] = await db_1.default.raw("SELECT COUNT(*) as active_wallets FROM wallets WHERE status='active'");
        const [[{ total_balance }]] = await db_1.default.raw('SELECT COALESCE(SUM(balance),0) as total_balance FROM wallets');
        const [[{ tx_today }]] = await db_1.default.raw("SELECT COUNT(*) as tx_today FROM transactions WHERE DATE(created_at)=CURDATE()");
        const [[{ volume_today }]] = await db_1.default.raw("SELECT COALESCE(SUM(amount),0) as volume_today FROM transactions WHERE status='completed' AND DATE(created_at)=CURDATE()");
        const [[{ failed_today }]] = await db_1.default.raw("SELECT COUNT(*) as failed_today FROM transactions WHERE status='failed' AND DATE(created_at)=CURDATE()");
        (0, response_1.success)(res, { total_users, active_wallets, total_balance, tx_today, volume_today, failed_today });
    }
    catch (err) {
        next(err);
    }
};
exports.getStats = getStats;
// ── List all users ─────────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        let q = (0, db_1.default)('users')
            .select('users.id', 'users.full_name', 'users.email', 'users.phone_number', 'users.is_verified', 'users.created_at', 'wallets.balance', 'wallets.status as wallet_status')
            .leftJoin('wallets', 'wallets.user_id', 'users.id')
            .orderBy('users.created_at', 'desc');
        if (search) {
            q = q.where((b) => b
                .where('users.full_name', 'like', `%${search}%`)
                .orWhere('users.phone_number', 'like', `%${search}%`)
                .orWhere('users.email', 'like', `%${search}%`));
        }
        const [{ total }] = await q.clone().count('users.id as total');
        const users = await q.offset(offset).limit(Number(limit));
        (0, response_1.success)(res, {
            users,
            pagination: { page: Number(page), limit: Number(limit), total: Number(total) },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listUsers = listUsers;
// ── Suspend / activate a wallet ────────────────────────────────────────────
const setWalletStatus = async (req, res, next) => {
    const { userId } = req.params;
    const { status } = req.body;
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: userId }).first();
        if (!wallet) {
            (0, response_1.error)(res, 'Wallet not found', 404);
            return;
        }
        await (0, db_1.default)('wallets').where({ user_id: userId }).update({ status });
        (0, response_1.success)(res, { wallet_id: wallet.id, status }, `Wallet ${status}`);
    }
    catch (err) {
        next(err);
    }
};
exports.setWalletStatus = setWalletStatus;
// ── Recent failed transactions ─────────────────────────────────────────────
const getFailedTransactions = async (req, res, next) => {
    const { limit = 50 } = req.query;
    try {
        const txs = await (0, db_1.default)('transactions')
            .join('wallets', 'transactions.wallet_id', 'wallets.id')
            .join('users', 'wallets.user_id', 'users.id')
            .where('transactions.status', 'failed')
            .select('transactions.id', 'transactions.type', 'transactions.amount', 'transactions.created_at', 'transactions.description', 'users.full_name', 'users.phone_number')
            .orderBy('transactions.created_at', 'desc')
            .limit(Number(limit));
        (0, response_1.success)(res, { transactions: txs });
    }
    catch (err) {
        next(err);
    }
};
exports.getFailedTransactions = getFailedTransactions;
// ── All transaction logs ───────────────────────────────────────────────────
const getTransactionLogs = async (req, res, next) => {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        const logs = await (0, db_1.default)('transaction_logs')
            .orderBy('created_at', 'desc')
            .offset(offset)
            .limit(Number(limit));
        (0, response_1.success)(res, { logs });
    }
    catch (err) {
        next(err);
    }
};
exports.getTransactionLogs = getTransactionLogs;
