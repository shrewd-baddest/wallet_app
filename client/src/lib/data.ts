// lib/data.ts — shared types, mock data, and helpers

export type TxType = "credit" | "debit";
export type TxCat  = "income" | "transfer" | "bills" | "food" | "transport";
export type ModalType = "fundSuccess" | "sendConfirm" | "withdrawConfirm" | "notif" | null;
export type AppPhase  = "splash" | "auth" | "main";
export type Screen    =
  | "dashboard" | "fund" | "send" | "withdraw"
  | "history"   | "wallet" | "profile" | "admin";

export interface Transaction {
  id:     number;
  type:   TxType;
  label:  string;
  sub:    string;
  amount: number;
  date:   string;
  emoji:  string;
  cat:    TxCat;
}

export interface Contact {
  name:     string;
  initials: string;
  color:    string; // tailwind bg class
}

export const TRANSACTIONS: Transaction[] = [
  { id:1,  type:"credit", label:"Salary Deposit",    sub:"EcoBank Ltd",    amount:85000, date:"Today, 09:14", emoji:"🏢", cat:"income"    },
  { id:2,  type:"debit",  label:"Netflix",            sub:"Entertainment",  amount:1500,  date:"Today, 08:00", emoji:"🎬", cat:"bills"     },
  { id:3,  type:"debit",  label:"Sent to Grace M.",   sub:"P2P Transfer",   amount:12000, date:"Yesterday",    emoji:"👩", cat:"transfer"  },
  { id:4,  type:"credit", label:"Received from Roy",  sub:"P2P Transfer",   amount:5000,  date:"Yesterday",    emoji:"👨", cat:"transfer"  },
  { id:5,  type:"debit",  label:"Zuku Fibre",         sub:"Internet Bill",  amount:4200,  date:"May 15",       emoji:"📡", cat:"bills"     },
  { id:6,  type:"debit",  label:"Java House",         sub:"Food & Drink",   amount:1850,  date:"May 15",       emoji:"☕", cat:"food"      },
  { id:7,  type:"credit", label:"Freelance Payment",  sub:"Upwork",         amount:22000, date:"May 14",       emoji:"💼", cat:"income"    },
  { id:8,  type:"debit",  label:"Uber",               sub:"Transport",      amount:680,   date:"May 14",       emoji:"🚗", cat:"transport" },
  { id:9,  type:"debit",  label:"Naivas Supermarket", sub:"Groceries",      amount:3200,  date:"May 13",       emoji:"🛒", cat:"food"      },
  { id:10, type:"debit",  label:"Airtel Money",       sub:"Mobile Top-Up",  amount:500,   date:"May 12",       emoji:"📱", cat:"bills"     },
];

export const CONTACTS: Contact[] = [
  { name:"Grace M.", initials:"GM", color:"bg-rose-500"   },
  { name:"Roy K.",   initials:"RK", color:"bg-violet-500" },
  { name:"Amina W.", initials:"AW", color:"bg-amber-500"  },
  { name:"Brian O.", initials:"BO", color:"bg-emerald-500"},
  { name:"Diana N.", initials:"DN", color:"bg-orange-500" },
];

export const SPARK: number[] = [44, 58, 52, 67, 72, 55, 80, 68, 90, 75, 88, 95];

/** Format a number as KSh string */
export const ksh = (n: number) => `KSh ${n.toLocaleString()}`;

export const MAIN_SCREENS: Screen[] = ["dashboard", "history", "wallet", "profile"];

export const TX_FILTERS = ["all", "income", "transfer", "bills", "food", "transport"] as const;
export type TxFilter = typeof TX_FILTERS[number];
