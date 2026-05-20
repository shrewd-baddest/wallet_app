"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatement = exports.getTransaction = exports.listTransactions = void 0;
const db_1 = __importDefault(require("../../db"));
const response_1 = require("../../utils/response");
// ── List transactions (paginated, filterable) ──────────────────────────────
const listTransactions = async (req, res, next) => {
    const { type, status, from, to, page = 1, limit = 20 } = req.query;
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: req.user.id }).first();
        if (!wallet) {
            (0, response_1.error)(res, 'Wallet not found', 404);
            return;
        }
        let query = (0, db_1.default)('transactions')
            .where({ wallet_id: wallet.id })
            .orderBy('created_at', 'desc');
        if (type)
            query = query.where({ type });
        if (status)
            query = query.where({ status });
        if (from)
            query = query.where('created_at', '>=', new Date(from));
        if (to)
            query = query.where('created_at', '<=', new Date(to));
        const offset = (Number(page) - 1) * Number(limit);
        const [{ total }] = await query.clone().count('id as total');
        const transactions = await query.offset(offset).limit(Number(limit));
        (0, response_1.success)(res, {
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: Number(total),
                total_pages: Math.ceil(Number(total) / Number(limit)),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listTransactions = listTransactions;
// ── Get single transaction ─────────────────────────────────────────────────
const getTransaction = async (req, res, next) => {
    const { id } = req.params;
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: req.user.id }).first();
        const tx = await (0, db_1.default)('transactions').where({ id, wallet_id: wallet.id }).first();
        if (!tx) {
            (0, response_1.error)(res, 'Transaction not found', 404);
            return;
        }
        const logs = await (0, db_1.default)('transaction_logs')
            .where({ transaction_id: tx.id })
            .orderBy('created_at', 'asc');
        (0, response_1.success)(res, { transaction: tx, logs });
    }
    catch (err) {
        next(err);
    }
};
exports.getTransaction = getTransaction;
// ── Mini statement (last 10 for a given period) ───────────────────────────
const getStatement = async (req, res, next) => {
    const { from, to } = req.query;
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: req.user.id }).first();
        const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = to ? new Date(to) : new Date();
        const transactions = await (0, db_1.default)('transactions')
            .where({ wallet_id: wallet.id, status: 'completed' })
            .whereBetween('created_at', [startDate, endDate])
            .orderBy('created_at', 'desc');
        const totalIn = transactions
            .filter((t) => ['deposit', 'transfer_received'].includes(t.type))
            .reduce((s, t) => s + Number(t.amount), 0);
        const totalOut = transactions
            .filter((t) => ['withdrawal', 'transfer_sent'].includes(t.type))
            .reduce((s, t) => s + Number(t.amount), 0);
        (0, response_1.success)(res, {
            period: { from: startDate, to: endDate },
            summary: { total_in: totalIn, total_out: totalOut, net: totalIn - totalOut },
            transactions,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getStatement = getStatement;
