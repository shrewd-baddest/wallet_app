import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db';
import logger from '../../utils/logger';
import { success, error } from '../../utils/response';

// ── Send money to another wallet ──────────────────────────────────────────
export const sendMoney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { recipient_phone, amount, description } = req.body as {
    recipient_phone: string;
    amount: number;
    description?: string;
  };

  try {
    const senderWallet = await db('wallets')
      .where({ user_id: req.user.id, status: 'active' })
      .first();

    if (!senderWallet) { error(res, 'Your wallet is not active', 404); return; }
    if (Number(senderWallet.balance) < Number(amount)) {
      error(res, 'Insufficient balance', 400);
      return;
    }

    const recipient = await db('users').where({ phone_number: recipient_phone }).first();
    if (!recipient) { error(res, 'Recipient not found', 404); return; }
    if (recipient.id === req.user.id) { error(res, 'Cannot transfer to yourself', 400); return; }

    const receiverWallet = await db('wallets')
      .where({ user_id: recipient.id, status: 'active' })
      .first();
    if (!receiverWallet) { error(res, 'Recipient wallet is not active', 404); return; }

    const txCode = uuidv4().replace(/-/g, '').slice(0, 20).toUpperCase();

    const trx = await db.transaction();
    try {
      const senderNewBalance   = Number(senderWallet.balance)  - Number(amount);
      const receiverNewBalance = Number(receiverWallet.balance) + Number(amount);

      await trx('wallets').where({ id: senderWallet.id }).update({ balance: senderNewBalance });
      await trx('wallets').where({ id: receiverWallet.id }).update({ balance: receiverNewBalance });

      const [transferId] = await trx('transfers').insert({
        sender_wallet_id:   senderWallet.id,
        receiver_wallet_id: receiverWallet.id,
        amount,
        status: 'completed',
      });

      const [sentTxId] = await trx('transactions').insert({
        transaction_code: `SENT-${txCode}`,
        wallet_id:        senderWallet.id,
        type:             'transfer_sent',
        amount,
        balance_before:   senderWallet.balance,
        balance_after:    senderNewBalance,
        status:           'completed',
        description:      description || `Transfer to ${recipient.full_name}`,
        reference_id:     String(transferId),
      });

      const [rcvdTxId] = await trx('transactions').insert({
        transaction_code: `RCVD-${txCode}`,
        wallet_id:        receiverWallet.id,
        type:             'transfer_received',
        amount,
        balance_before:   receiverWallet.balance,
        balance_after:    receiverNewBalance,
        status:           'completed',
        description:      description || `Transfer from ${req.user.full_name}`,
        reference_id:     String(transferId),
      });

      await trx('transaction_logs').insert([
        {
          transaction_id: sentTxId,
          action:         'transfer_sent',
          performed_by:   req.user.phone_number,
          log_message:    `Transferred KES ${amount} to ${recipient_phone}`,
        },
        {
          transaction_id: rcvdTxId,
          action:         'transfer_received',
          performed_by:   'system',
          log_message:    `Received KES ${amount} from ${req.user.phone_number}`,
        },
      ]);

      await trx.commit();

      logger.info(`Transfer ${txCode}: KES ${amount} from wallet ${senderWallet.id} → ${receiverWallet.id}`);

      success(res, {
        transfer_id:      transferId,
        transaction_code: `SENT-${txCode}`,
        amount,
        recipient:        { name: recipient.full_name, phone: recipient_phone },
        new_balance:      senderNewBalance,
      }, 'Transfer successful');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    logger.error('Transfer error:', (err as Error).message);
    next(err);
  }
};

// ── Get transfer history ───────────────────────────────────────────────────
export const getTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { page = 1, limit = 20 } = req.query as { page?: string; limit?: string };
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const wallet = await db('wallets').where({ user_id: req.user.id }).first();

    const transfers = await db('transfers')
      .where('sender_wallet_id', wallet.id)
      .orWhere('receiver_wallet_id', wallet.id)
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(Number(limit));

    success(res, { transfers });
  } catch (err) {
    next(err);
  }
};
