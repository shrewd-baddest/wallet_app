import { Request, Response } from 'express';
import db from '../../db';
import logger from '../../utils/logger';

/**
 * POST /api/mpesa/stk-callback
 * Daraja calls this after a customer completes (or cancels) the STK prompt.
 */
export const stkCallback = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  const body = req.body?.Body?.stkCallback;
  if (!body) return;

  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body;

  logger.info(`STK callback received — CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

  const trx = await db.transaction();
  try {
    const mpesaTx = await trx('mpesa_transactions')
      .where({ checkout_request_id: CheckoutRequestID, status: 'pending' })
      .first();

    if (!mpesaTx) {
      logger.warn(`No pending mpesa_transaction for CheckoutRequestID: ${CheckoutRequestID}`);
      await trx.rollback();
      return;
    }

    const isSuccess = String(ResultCode) === '0';
    const metaItems: Array<{ Name: string; Value: unknown }> = CallbackMetadata?.Item || [];
    const getMeta   = (name: string) => metaItems.find((i) => i.Name === name)?.Value;

    const receiptNumber = getMeta('MpesaReceiptNumber') as string | undefined;
    const amount        = getMeta('Amount');

    await trx('mpesa_transactions').where({ id: mpesaTx.id }).update({
      mpesa_receipt_number: receiptNumber || null,
      result_code:          String(ResultCode),
      result_description:   ResultDesc,
      raw_callback:         JSON.stringify(req.body),
      status:               isSuccess ? 'completed' : 'failed',
    });

    if (!isSuccess) {
      await trx('transactions')
        .where({ reference_id: CheckoutRequestID, status: 'pending' })
        .update({ status: 'failed' });
      await trx.commit();
      return;
    }

    const walletTx = await trx('transactions')
      .where({ reference_id: CheckoutRequestID, status: 'pending' })
      .first();

    if (!walletTx) {
      logger.warn(`No pending transaction found for CheckoutRequestID: ${CheckoutRequestID}`);
      await trx.commit();
      return;
    }

    const wallet = await trx('wallets').where({ id: walletTx.wallet_id }).first();
    const newBalance = Number(wallet.balance) + Number(amount || mpesaTx.amount);

    await trx('wallets').where({ id: wallet.id }).update({ balance: newBalance });
    await trx('transactions').where({ id: walletTx.id }).update({
      status:           'completed',
      transaction_code: receiptNumber,
      balance_after:    newBalance,
    });

    await trx.commit();
    logger.info(`Wallet ${wallet.id} credited KES ${amount}. New balance: ${newBalance}`);
  } catch (err) {
    await trx.rollback();
    logger.error('STK callback processing error', err);
  }
};

/**
 * POST /api/mpesa/b2c-callback
 * Result from B2C payout (withdrawal).
 */
export const b2cCallback = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  const result = req.body?.Result;
  if (!result) return;

  const { ResultCode, ResultDesc, TransactionID, ResultParameters } = result;
  const isSuccess = String(ResultCode) === '0';

  logger.info(`B2C callback — TransactionID: ${TransactionID}, ResultCode: ${ResultCode}`);

  const trx = await db.transaction();
  try {
    const params: Array<{ Key: string; Value: unknown }> = ResultParameters?.ResultParameter || [];
    const getParam = (key: string) => params.find((p) => p.Key === key)?.Value;

    const receiptNumber = (getParam('TransactionReceipt') as string) || TransactionID;
    const amount        = getParam('TransactionAmount');

    await trx('mpesa_transactions')
      .where({ merchant_request_id: result.ConversationID })
      .update({
        mpesa_receipt_number: receiptNumber,
        result_code:          String(ResultCode),
        result_description:   ResultDesc,
        raw_callback:         JSON.stringify(req.body),
        status:               isSuccess ? 'completed' : 'failed',
      });

    const withdrawal = await trx('withdrawals')
      .join('mpesa_transactions', 'withdrawals.mpesa_transaction_id', 'mpesa_transactions.id')
      .where('mpesa_transactions.merchant_request_id', result.ConversationID)
      .select('withdrawals.*')
      .first();

    if (withdrawal) {
      const newStatus = isSuccess ? 'completed' : 'failed';
      await trx('withdrawals').where({ id: withdrawal.id }).update({ status: newStatus });

      if (!isSuccess) {
        await trx('wallets')
          .where({ id: withdrawal.wallet_id })
          .increment('balance', Number(amount || withdrawal.amount));
      }

      await trx('transactions')
        .where({ wallet_id: withdrawal.wallet_id, type: 'withdrawal', status: 'pending' })
        .orderBy('created_at', 'desc')
        .limit(1)
        .update({ status: isSuccess ? 'completed' : 'failed', transaction_code: receiptNumber });
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    logger.error('B2C callback error', err);
  }
};

/**
 * POST /api/mpesa/b2c-timeout
 * Daraja fires this when B2C times out — treat as failure.
 */
export const b2cTimeout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  logger.warn('B2C timeout received', req.body);
};
