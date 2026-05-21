// lib/data.ts — shared front-end types and helpers

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer_sent"
  | "transfer_received";

export type ModalType = "fundSuccess" | "sendConfirm" | "sendSuccess" | "withdrawConfirm" | "withdrawSuccess" | "notif" | null;
export type AppPhase  = "splash" | "auth" | "main";
export type Screen    =
  | "dashboard" | "fund" | "send" | "withdraw"
  | "history"   | "wallet" | "profile" | "admin";

export interface Transaction {
  id: number;
  transaction_code?: string;
  type: TransactionType;
  amount: number;
  status?: string;
  description?: string;
  created_at: string;
  balance_before?: number;
  balance_after?: number;
}

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  status: string;
}

export interface User {
  id: number;
  full_name: string;
  email?: string;
  phone_number: string;
  is_verified: boolean;
}

export interface DashboardData {
  user: User;
  wallet: Wallet;
  analytics: {
    monthly_income: number;
    monthly_expenses: number;
    sparkline: number[];
  };
  stats: {
    total_transactions: number;
  };
  recent_transactions: Transaction[];
}

export const TX_FILTERS = [
  "all",
  "deposit",
  "withdrawal",
  "transfer_sent",
  "transfer_received",
] as const;
export type TxFilter = typeof TX_FILTERS[number];

export const transactionLabel = (type: TransactionType): string => {
  switch (type) {
    case "deposit": return "Deposit";
    case "withdrawal": return "Withdrawal";
    case "transfer_sent": return "Sent";
    case "transfer_received": return "Received";
    default: return "Transaction";
  }
};

export const isPositiveTransaction = (type: TransactionType): boolean =>
  type === "deposit" || type === "transfer_received";

export const ksh = (n: number) => `KSh ${n.toLocaleString()}`;
