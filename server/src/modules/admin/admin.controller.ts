import { Request, Response, NextFunction } from 'express';
import db from '../../db';
import { success, error } from '../../utils/response';

// ── Platform overview stats ────────────────────────────────────────────────
export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [[{ total_users }]]    = await db.raw('SELECT COUNT(*) as total_users FROM users');
    const [[{ active_wallets }]] = await db.raw("SELECT COUNT(*) as active_wallets FROM wallets WHERE status='active'");
    const [[{ total_balance }]]  = await db.raw('SELECT COALESCE(SUM(balance),0) as total_balance FROM wallets');
    const [[{ tx_today }]]       = await db.raw("SELECT COUNT(*) as tx_today FROM transactions WHERE DATE(created_at)=CURDATE()");
    const [[{ volume_today }]]   = await db.raw("SELECT COALESCE(SUM(amount),0) as volume_today FROM transactions WHERE status='completed' AND DATE(created_at)=CURDATE()");
    const [[{ failed_today }]]   = await db.raw("SELECT COUNT(*) as failed_today FROM transactions WHERE status='failed' AND DATE(created_at)=CURDATE()");

    success(res, { total_users, active_wallets, total_balance, tx_today, volume_today, failed_today });
  } catch (err) {
    next(err);
  }
};

// ── List all users ─────────────────────────────────────────────────────────
export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { page = 1, limit = 20, search } = req.query as { page?: string; limit?: string; search?: string };
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let q = db('users')
      .select(
        'users.id', 'users.full_name', 'users.email', 'users.phone_number',
        'users.is_verified', 'users.created_at',
        'wallets.balance', 'wallets.status as wallet_status'
      )
      .leftJoin('wallets', 'wallets.user_id', 'users.id')
      .orderBy('users.created_at', 'desc');

    if (search) {
      q = q.where((b) =>
        b
          .where('users.full_name', 'like', `%${search}%`)
          .orWhere('users.phone_number', 'like', `%${search}%`)
          .orWhere('users.email', 'like', `%${search}%`)
      );
    }

    const [{ total }] = await q.clone().count('users.id as total');
    const users       = await q.offset(offset).limit(Number(limit));

    success(res, {
      users,
      pagination: { page: Number(page), limit: Number(limit), total: Number(total) },
    });
  } catch (err) {
    next(err);
  }
};

// ── Suspend / activate a wallet ────────────────────────────────────────────
export const setWalletStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  const { status } = req.body as { status: 'active' | 'suspended' };

  try {
    const wallet = await db('wallets').where({ user_id: userId }).first();
    if (!wallet) { error(res, 'Wallet not found', 404); return; }

    await db('wallets').where({ user_id: userId }).update({ status });
    success(res, { wallet_id: wallet.id, status }, `Wallet ${status}`);
  } catch (err) {
    next(err);
  }
};

// ── Recent failed transactions ─────────────────────────────────────────────
export const getFailedTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { limit = 50 } = req.query as { limit?: string };

  try {
    const txs = await db('transactions')
      .join('wallets', 'transactions.wallet_id', 'wallets.id')
      .join('users', 'wallets.user_id', 'users.id')
      .where('transactions.status', 'failed')
      .select(
        'transactions.id', 'transactions.type', 'transactions.amount',
        'transactions.created_at', 'transactions.description',
        'users.full_name', 'users.phone_number'
      )
      .orderBy('transactions.created_at', 'desc')
      .limit(Number(limit));

    success(res, { transactions: txs });
  } catch (err) {
    next(err);
  }
};

// ── All transaction logs ───────────────────────────────────────────────────
export const getTransactionLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { page = 1, limit = 50 } = req.query as { page?: string; limit?: string };
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const logs = await db('transaction_logs')
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(Number(limit));

    success(res, { logs });
  } catch (err) {
    next(err);
  }
};
