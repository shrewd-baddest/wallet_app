import { Request, Response, NextFunction } from 'express';
import db from '../../db';
import { success, error } from '../../utils/response';

// ── List transactions (paginated, filterable) ──────────────────────────────
export const listTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { type, status, from, to, page = 1, limit = 20 } = req.query as Record<string, string | undefined>;

  try {
    const wallet = await db('wallets').where({ user_id: req.user.id }).first();
    if (!wallet) { error(res, 'Wallet not found', 404); return; }

    let query = db('transactions')
      .where({ wallet_id: wallet.id })
      .orderBy('created_at', 'desc');

    if (type)   query = query.where({ type });
    if (status) query = query.where({ status });
    if (from)   query = query.where('created_at', '>=', new Date(from));
    if (to)     query = query.where('created_at', '<=', new Date(to));

    const offset = (Number(page) - 1) * Number(limit);
    const [{ total }] = await query.clone().count('id as total');
    const transactions = await query.offset(offset).limit(Number(limit));

    success(res, {
      transactions,
      pagination: {
        page:        Number(page),
        limit:       Number(limit),
        total:       Number(total),
        total_pages: Math.ceil(Number(total) / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get single transaction ─────────────────────────────────────────────────
export const getTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const wallet = await db('wallets').where({ user_id: req.user.id }).first();
    const tx = await db('transactions').where({ id, wallet_id: wallet.id }).first();

    if (!tx) { error(res, 'Transaction not found', 404); return; }

    const logs = await db('transaction_logs')
      .where({ transaction_id: tx.id })
      .orderBy('created_at', 'asc');

    success(res, { transaction: tx, logs });
  } catch (err) {
    next(err);
  }
};

// ── Mini statement (last 10 for a given period) ───────────────────────────
export const getStatement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { from, to } = req.query as { from?: string; to?: string };

  try {
    const wallet = await db('wallets').where({ user_id: req.user.id }).first();

    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate   = to   ? new Date(to)   : new Date();

    const transactions = await db('transactions')
      .where({ wallet_id: wallet.id, status: 'completed' })
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc');

    const totalIn  = transactions
      .filter((t: any) => ['deposit', 'transfer_received'].includes(t.type))
      .reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalOut = transactions
      .filter((t: any) => ['withdrawal', 'transfer_sent'].includes(t.type))
      .reduce((s: number, t: any) => s + Number(t.amount), 0);

    success(res, {
      period:       { from: startDate, to: endDate },
      summary:      { total_in: totalIn, total_out: totalOut, net: totalIn - totalOut },
      transactions,
    });
  } catch (err) {
    next(err);
  }
};
