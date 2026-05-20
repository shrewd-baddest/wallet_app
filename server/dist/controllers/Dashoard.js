"use strict";
// controllers/dashboardController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const knex_1 = __importDefault(require("../db/knex"));
const getDashboard = async (req, res) => {
    try {
        // authenticated user id
        const userId = req.user.id;
        await knex_1.default.transaction(async (trx) => {
            const userWallet = await trx("users")
                .join("wallets", "users.id", "wallets.user_id")
                .where("users.id", userId)
                .select("users.id", "users.full_name", "users.email", "users.phone_number", "wallets.id as wallet_id", "wallets.balance", "wallets.currency", "wallets.status")
                .first();
            if (!userWallet) {
                return res.status(404).json({
                    success: false,
                    message: "User wallet not found",
                });
            }
            const transactions = await trx("transactions")
                .where("wallet_id", userWallet.wallet_id)
                .orderBy("created_at", "desc")
                .limit(6)
                .select("id", "transaction_code", "type", "amount", "status", "description", "created_at");
            const monthlyIncome = await trx("transactions")
                .where("wallet_id", userWallet.wallet_id)
                .whereIn("type", ["deposit", "transfer_received"])
                .whereRaw("MONTH(created_at) = MONTH(CURRENT_DATE())")
                .sum("amount as total")
                .first();
            const monthlyExpenses = await trx("transactions")
                .where("wallet_id", userWallet.wallet_id)
                .whereIn("type", ["withdrawal", "transfer_sent"])
                .whereRaw("MONTH(created_at) = MONTH(CURRENT_DATE())")
                .sum("amount as total")
                .first();
            const sparkline = await trx("transactions")
                .where("wallet_id", userWallet.wallet_id)
                .orderBy("created_at", "asc")
                .limit(7)
                .pluck("amount");
            const totalTransactions = await trx("transactions")
                .where("wallet_id", userWallet.wallet_id)
                .count("id as count")
                .first();
            return res.status(200).json({
                success: true,
                user: {
                    id: userWallet.id,
                    full_name: userWallet.full_name,
                    email: userWallet.email,
                    phone_number: userWallet.phone_number,
                },
                wallet: {
                    id: userWallet.wallet_id,
                    balance: Number(userWallet.balance),
                    currency: userWallet.currency,
                    status: userWallet.status,
                },
                analytics: {
                    monthly_income: Number(monthlyIncome?.total || 0),
                    monthly_expenses: Number(monthlyExpenses?.total || 0),
                    sparkline,
                },
                stats: {
                    total_transactions: Number(totalTransactions?.count || 0),
                },
                recent_transactions: transactions,
            });
        });
    }
    catch (error) {
        console.error("Dashboard Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};
exports.getDashboard = getDashboard;
