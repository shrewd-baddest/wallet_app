import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db';
import mpesa from '../mpesa/mpesa.service';
import logger from '../../utils/logger';
import { success, error } from '../../utils/response';

// ── Get wallet ────────────────────────────────────────────────────────────
export const getWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallet = await db('wallets').where({ user_id: req.user.id }).first();
    if (!wallet) { error(res, 'Wallet not found', 404); return; }
    success(res, { wallet });
  } catch (err) {
    next(err);
  }
};

// ── Initiate deposit via STK Push ─────────────────────────────────────────
export const initiateDeposit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { amount, phone_number } = req.body as { amount: number; phone_number: string };

  try {
    const wallet = await db('wallets')
      .where({ user_id: req.user.id, status: 'active' })
      .first();
    if (!wallet) { error(res, 'Wallet not found or suspended', 404); return; }

    let mpesaResponse: any;
    try {
      mpesaResponse = await mpesa.stkPush(phone_number, amount);
    } catch (e: any) {
      logger.error('STK push exception:', e?.message || e);
      error(res, 'STK push failed (external provider error)', 502);
      return;
    }

    if (mpesaResponse.ResponseCode !== '0') {
      logger.error('STK push returned non-success ResponseCode:', mpesaResponse.ResponseCode, mpesaResponse.errorMessage ?? mpesaResponse);
      error(res, mpesaResponse.errorMessage || 'STK push failed', 502);
      return;
    }

    const { MerchantRequestID, CheckoutRequestID } = mpesaResponse;

    const [mpesaTxId] = await db('mpesa_transactions').insert({
      merchant_request_id: MerchantRequestID,
      checkout_request_id: CheckoutRequestID,
      phone_number,
      amount,
      transaction_type: 'deposit',
      status: 'pending',
    });

    await db('transactions').insert({
      wallet_id:       wallet.id,
      transaction_code: CheckoutRequestID,
      type:            'deposit',
      amount,
      balance_before:  wallet.balance,
      status:          'pending',
      description:     'M-Pesa deposit via STK push',
      reference_id:    CheckoutRequestID,
    });

    logger.info(`STK push initiated for wallet ${wallet.id}, CheckoutRequestID: ${CheckoutRequestID}`);

    success(res, {
      checkout_request_id: CheckoutRequestID,
      message:             'STK push sent. Enter your M-Pesa PIN on your phone.',
    }, 'Deposit initiated');
  } catch (err) {
    logger.error('Deposit error:', (err as Error).message);
    next(err);
  }
};

// ── Initiate withdrawal via B2C ───────────────────────────────────────────
export const initiateWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { amount, phone_number } = req.body as { amount: number; phone_number: string };

  try {
    const wallet = await db('wallets')
      .where({ user_id: req.user.id, status: 'active' })
      .first();

    if (!wallet) { error(res, 'Wallet not found or suspended', 404); return; }
    if (Number(wallet.balance) < Number(amount)) {
      error(res, 'Insufficient wallet balance', 400);
      return;
    }

    const trx = await db.transaction();
    try {
      const newBalance = Number(wallet.balance) - Number(amount);
      await trx('wallets').where({ id: wallet.id }).update({ balance: newBalance });

      const [mpesaTxId] = await trx('mpesa_transactions').insert({
        phone_number,
        amount,
        transaction_type: 'withdrawal',
        status:           'pending',
      });

      const [withdrawalId] = await trx('withdrawals').insert({
        wallet_id:            wallet.id,
        amount,
        phone_number,
        status:               'processing',
        mpesa_transaction_id: mpesaTxId,
      });

      const txCode = `WDL-${uuidv4().replace(/-/g, '').slice(0, 20).toUpperCase()}`;

      const [txId] = await trx('transactions').insert({
        wallet_id:      wallet.id,
        transaction_code: txCode,
        type:           'withdrawal',
        amount,
        balance_before: wallet.balance,
        balance_after:  newBalance,
        status:         'pending',
        description:    `Withdrawal to ${phone_number}`,
      });

      await trx('transaction_logs').insert({
        transaction_id: txId,
        action:         'withdrawal_initiated',
        performed_by:   req.user.phone_number,
        log_message:    `Withdrawal of KES ${amount} to ${phone_number} initiated`,
      });

      await trx.commit();

      const b2cResponse = await mpesa.b2cPayment(phone_number, amount);

      if (b2cResponse.ResponseCode !== '0') {
        await db('wallets').where({ id: wallet.id }).increment('balance', amount);
        await db('withdrawals').where({ id: withdrawalId }).update({ status: 'failed' });
        error(res, 'B2C payment failed. Funds have been refunded.', 502);
        return;
      }

      await db('mpesa_transactions')
        .where({ id: mpesaTxId })
        .update({ merchant_request_id: b2cResponse.ConversationID });

      logger.info(`Withdrawal initiated for wallet ${wallet.id}, ConversationID: ${b2cResponse.ConversationID}`);

      success(res, { withdrawal_id: withdrawalId }, 'Withdrawal initiated. Funds will arrive shortly.');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    logger.error('Withdrawal error:', (err as Error).message);
    next(err);
  }
};

// ── STK query (client polling) ────────────────────────────────────────────
export const queryStkStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { checkout_request_id } = req.params;

  try {
    const mpesaTx = await db('mpesa_transactions').where({ checkout_request_id }).first();
    if (!mpesaTx) { error(res, 'Transaction not found', 404); return; }

    success(res, {
      status:               mpesaTx.status,
      mpesa_receipt_number: mpesaTx.mpesa_receipt_number,
      amount:               mpesaTx.amount,
    });
  } catch (err) {
    next(err);
  }
};

// ── Query withdrawal status (client polling) ───────────────────────────────
export const queryWithdrawStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { withdrawal_id } = req.params as { withdrawal_id: string };

  try {
    const withdrawal = await db('withdrawals').where({ id: Number(withdrawal_id) }).first();
    if (!withdrawal) { error(res, 'Withdrawal not found', 404); return; }

    const tx = await db('transactions')
      .where({ wallet_id: withdrawal.wallet_id, type: 'withdrawal' })
      .whereIn('status', ['pending', 'processing', 'completed', 'failed'])
      .orderBy('created_at', 'desc')
      .first();

    const status = withdrawal.status ?? tx?.status ?? 'pending';

    success(res, { status, withdrawal_id: Number(withdrawal_id), transaction_code: tx?.transaction_code ?? null });
  } catch (err) {
    next(err);
  }
};
