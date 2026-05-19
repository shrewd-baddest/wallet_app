// controllers/historyController.ts

import { Request, Response } from "express";
import db from "../db/knex";

export const getTransactionHistory = async (
  req: Request,
  res: Response
) => {
  try {

  
    const userId = (req as any).user.id;

    
    const wallet = await db("wallets")
      .where("user_id", userId)
      .first();

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    
    const filter = req.query.filter as string;

 
    let query = db("transactions")
      .where("wallet_id", wallet.id);
    if (filter && filter !== "all") {

      // money in
      if (filter === "income") {
        query = query.whereIn("type", [
          "deposit",
          "transfer_received",
        ]);
      }

      // money out
      else if (filter === "expense") {
        query = query.whereIn("type", [
          "withdrawal",
          "transfer_sent",
        ]);
      }

      // direct transaction type filter
      else {
        query = query.where("type", filter);
      }
    }

    const transactions = await query
      .orderBy("created_at", "desc")
      .select(
        "id",
        "transaction_code",
        "type",
        "amount",
        "status",
        "description",
        "reference_id",
        "created_at"
      );

  
    const formattedTransactions = transactions.map((tx) => {

      const isCredit =
        tx.type === "deposit" ||
        tx.type === "transfer_received";

      return {
        id: tx.id,

        type: isCredit ? "credit" : "debit",

        amount: Number(tx.amount),

        label:
          tx.type === "deposit"
            ? "Wallet Deposit"
            : tx.type === "withdrawal"
            ? "Withdrawal"
            : tx.type === "transfer_sent"
            ? "Transfer Sent"
            : "Transfer Received",

        sub: tx.description,

        cat:
          tx.type === "deposit"
            ? "income"
            : tx.type === "withdrawal"
            ? "withdrawal"
            : tx.type === "transfer_sent"
            ? "transfer"
            : "transfer",

        date: tx.created_at,

        status: tx.status,

        transaction_code: tx.transaction_code,
      };
    });

  
    const totalIn = await db("transactions")
      .where("wallet_id", wallet.id)
      .whereIn("type", [
        "deposit",
        "transfer_received",
      ])
      .sum("amount as total")
      .first();

  
    const totalOut = await db("transactions")
      .where("wallet_id", wallet.id)
      .whereIn("type", [
        "withdrawal",
        "transfer_sent",
      ])
      .sum("amount as total")
      .first();

   
    return res.status(200).json({
      success: true,

      summary: {
        total_in: Number(totalIn?.total || 0),
        total_out: Number(totalOut?.total || 0),
      },

      transactions: formattedTransactions,
    });

  } catch (error: any) {

    console.error("History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
      error: error.message,
    });
  }
};