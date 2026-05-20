import { Request, Response, NextFunction } from 'express';
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

    const mpesaResponse = await mpesa.stkPush(phone_number, amount);

    if (mpesaResponse.ResponseCode !== '0') {
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
      wallet_id:      wallet.id,
      type:           'deposit',
      amount,
      balance_before: wallet.balance,
      status:         'pending',
      description:    'M-Pesa deposit via STK push',
      reference_id:   CheckoutRequestID,
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

      const [txId] = await trx('transactions').insert({
        wallet_id:      wallet.id,
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
