"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransfers = exports.sendMoney = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../../db"));
const logger_1 = __importDefault(require("../../utils/logger"));
const response_1 = require("../../utils/response");
// ── Send money to another wallet ──────────────────────────────────────────
const sendMoney = async (req, res, next) => {
    const { recipient_phone, amount, description } = req.body;
    try {
        const senderWallet = await (0, db_1.default)('wallets')
            .where({ user_id: req.user.id, status: 'active' })
            .first();
        if (!senderWallet) {
            (0, response_1.error)(res, 'Your wallet is not active', 404);
            return;
        }
        if (Number(senderWallet.balance) < Number(amount)) {
            (0, response_1.error)(res, 'Insufficient balance', 400);
            return;
        }
        const recipient = await (0, db_1.default)('users').where({ phone_number: recipient_phone }).first();
        if (!recipient) {
            (0, response_1.error)(res, 'Recipient not found', 404);
            return;
        }
        if (recipient.id === req.user.id) {
            (0, response_1.error)(res, 'Cannot transfer to yourself', 400);
            return;
        }
        const receiverWallet = await (0, db_1.default)('wallets')
            .where({ user_id: recipient.id, status: 'active' })
            .first();
        if (!receiverWallet) {
            (0, response_1.error)(res, 'Recipient wallet is not active', 404);
            return;
        }
        const txCode = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 20).toUpperCase();
        const trx = await db_1.default.transaction();
        try {
            const senderNewBalance = Number(senderWallet.balance) - Number(amount);
            const receiverNewBalance = Number(receiverWallet.balance) + Number(amount);
            await trx('wallets').where({ id: senderWallet.id }).update({ balance: senderNewBalance });
            await trx('wallets').where({ id: receiverWallet.id }).update({ balance: receiverNewBalance });
            const [transferId] = await trx('transfers').insert({
                sender_wallet_id: senderWallet.id,
                receiver_wallet_id: receiverWallet.id,
                amount,
                status: 'completed',
            });
            const [sentTxId] = await trx('transactions').insert({
                transaction_code: `SENT-${txCode}`,
                wallet_id: senderWallet.id,
                type: 'transfer_sent',
                amount,
                balance_before: senderWallet.balance,
                balance_after: senderNewBalance,
                status: 'completed',
                description: description || `Transfer to ${recipient.full_name}`,
                reference_id: String(transferId),
            });
            const [rcvdTxId] = await trx('transactions').insert({
                transaction_code: `RCVD-${txCode}`,
                wallet_id: receiverWallet.id,
                type: 'transfer_received',
                amount,
                balance_before: receiverWallet.balance,
                balance_after: receiverNewBalance,
                status: 'completed',
                description: description || `Transfer from ${req.user.full_name}`,
                reference_id: String(transferId),
            });
            await trx('transaction_logs').insert([
                {
                    transaction_id: sentTxId,
                    action: 'transfer_sent',
                    performed_by: req.user.phone_number,
                    log_message: `Transferred KES ${amount} to ${recipient_phone}`,
                },
                {
                    transaction_id: rcvdTxId,
                    action: 'transfer_received',
                    performed_by: 'system',
                    log_message: `Received KES ${amount} from ${req.user.phone_number}`,
                },
            ]);
            await trx.commit();
            logger_1.default.info(`Transfer ${txCode}: KES ${amount} from wallet ${senderWallet.id} → ${receiverWallet.id}`);
            (0, response_1.success)(res, {
                transfer_id: transferId,
                transaction_code: `SENT-${txCode}`,
                amount,
                recipient: { name: recipient.full_name, phone: recipient_phone },
                new_balance: senderNewBalance,
            }, 'Transfer successful');
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    }
    catch (err) {
        logger_1.default.error('Transfer error:', err.message);
        next(err);
    }
};
exports.sendMoney = sendMoney;
// ── Get transfer history ───────────────────────────────────────────────────
const getTransfers = async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: req.user.id }).first();
        const transfers = await (0, db_1.default)('transfers')
            .where('sender_wallet_id', wallet.id)
            .orWhere('receiver_wallet_id', wallet.id)
            .orderBy('created_at', 'desc')
            .offset(offset)
            .limit(Number(limit));
        (0, response_1.success)(res, { transfers });
    }
    catch (err) {
        next(err);
    }
};
exports.getTransfers = getTransfers;
