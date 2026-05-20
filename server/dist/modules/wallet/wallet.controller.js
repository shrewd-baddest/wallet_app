"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStkStatus = exports.initiateWithdrawal = exports.initiateDeposit = exports.getWallet = void 0;
const db_1 = __importDefault(require("../../db"));
const mpesa_service_1 = __importDefault(require("../mpesa/mpesa.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
const response_1 = require("../../utils/response");
// ── Get wallet ────────────────────────────────────────────────────────────
const getWallet = async (req, res, next) => {
    try {
        const wallet = await (0, db_1.default)('wallets').where({ user_id: req.user.id }).first();
        if (!wallet) {
            (0, response_1.error)(res, 'Wallet not found', 404);
            return;
        }
        (0, response_1.success)(res, { wallet });
    }
    catch (err) {
        next(err);
    }
};
exports.getWallet = getWallet;
// ── Initiate deposit via STK Push ─────────────────────────────────────────
const initiateDeposit = async (req, res, next) => {
    const { amount, phone_number } = req.body;
    try {
        const wallet = await (0, db_1.default)('wallets')
            .where({ user_id: req.user.id, status: 'active' })
            .first();
        if (!wallet) {
            (0, response_1.error)(res, 'Wallet not found or suspended', 404);
            return;
        }
        const mpesaResponse = await mpesa_service_1.default.stkPush(phone_number, amount);
        if (mpesaResponse.ResponseCode !== '0') {
            (0, response_1.error)(res, mpesaResponse.errorMessage || 'STK push failed', 502);
            return;
        }
        const { MerchantRequestID, CheckoutRequestID } = mpesaResponse;
        const [mpesaTxId] = await (0, db_1.default)('mpesa_transactions').insert({
            merchant_request_id: MerchantRequestID,
            checkout_request_id: CheckoutRequestID,
            phone_number,
            amount,
            transaction_type: 'deposit',
            status: 'pending',
        });
        await (0, db_1.default)('transactions').insert({
            wallet_id: wallet.id,
            type: 'deposit',
            amount,
            balance_before: wallet.balance,
            status: 'pending',
            description: 'M-Pesa deposit via STK push',
            reference_id: CheckoutRequestID,
        });
        logger_1.default.info(`STK push initiated for wallet ${wallet.id}, CheckoutRequestID: ${CheckoutRequestID}`);
        (0, response_1.success)(res, {
            checkout_request_id: CheckoutRequestID,
            message: 'STK push sent. Enter your M-Pesa PIN on your phone.',
        }, 'Deposit initiated');
    }
    catch (err) {
        logger_1.default.error('Deposit error:', err.message);
        next(err);
    }
};
exports.initiateDeposit = initiateDeposit;
// ── Initiate withdrawal via B2C ───────────────────────────────────────────
const initiateWithdrawal = async (req, res, next) => {
    const { amount, phone_number } = req.body;
    try {
        const wallet = await (0, db_1.default)('wallets')
            .where({ user_id: req.user.id, status: 'active' })
            .first();
        if (!wallet) {
            (0, response_1.error)(res, 'Wallet not found or suspended', 404);
            return;
        }
        if (Number(wallet.balance) < Number(amount)) {
            (0, response_1.error)(res, 'Insufficient wallet balance', 400);
            return;
        }
        const trx = await db_1.default.transaction();
        try {
            const newBalance = Number(wallet.balance) - Number(amount);
            await trx('wallets').where({ id: wallet.id }).update({ balance: newBalance });
            const [mpesaTxId] = await trx('mpesa_transactions').insert({
                phone_number,
                amount,
                transaction_type: 'withdrawal',
                status: 'pending',
            });
            const [withdrawalId] = await trx('withdrawals').insert({
                wallet_id: wallet.id,
                amount,
                phone_number,
                status: 'processing',
                mpesa_transaction_id: mpesaTxId,
            });
            const [txId] = await trx('transactions').insert({
                wallet_id: wallet.id,
                type: 'withdrawal',
                amount,
                balance_before: wallet.balance,
                balance_after: newBalance,
                status: 'pending',
                description: `Withdrawal to ${phone_number}`,
            });
            await trx('transaction_logs').insert({
                transaction_id: txId,
                action: 'withdrawal_initiated',
                performed_by: req.user.phone_number,
                log_message: `Withdrawal of KES ${amount} to ${phone_number} initiated`,
            });
            await trx.commit();
            const b2cResponse = await mpesa_service_1.default.b2cPayment(phone_number, amount);
            if (b2cResponse.ResponseCode !== '0') {
                await (0, db_1.default)('wallets').where({ id: wallet.id }).increment('balance', amount);
                await (0, db_1.default)('withdrawals').where({ id: withdrawalId }).update({ status: 'failed' });
                (0, response_1.error)(res, 'B2C payment failed. Funds have been refunded.', 502);
                return;
            }
            await (0, db_1.default)('mpesa_transactions')
                .where({ id: mpesaTxId })
                .update({ merchant_request_id: b2cResponse.ConversationID });
            logger_1.default.info(`Withdrawal initiated for wallet ${wallet.id}, ConversationID: ${b2cResponse.ConversationID}`);
            (0, response_1.success)(res, { withdrawal_id: withdrawalId }, 'Withdrawal initiated. Funds will arrive shortly.');
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    }
    catch (err) {
        logger_1.default.error('Withdrawal error:', err.message);
        next(err);
    }
};
exports.initiateWithdrawal = initiateWithdrawal;
// ── STK query (client polling) ────────────────────────────────────────────
const queryStkStatus = async (req, res, next) => {
    const { checkout_request_id } = req.params;
    try {
        const mpesaTx = await (0, db_1.default)('mpesa_transactions').where({ checkout_request_id }).first();
        if (!mpesaTx) {
            (0, response_1.error)(res, 'Transaction not found', 404);
            return;
        }
        (0, response_1.success)(res, {
            status: mpesaTx.status,
            mpesa_receipt_number: mpesaTx.mpesa_receipt_number,
            amount: mpesaTx.amount,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.queryStkStatus = queryStkStatus;
