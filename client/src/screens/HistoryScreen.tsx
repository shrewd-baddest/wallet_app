// screens/HistoryScreen.tsx
import { useState } from "react";
import { TRANSACTIONS, TX_FILTERS, ksh, type TxFilter } from "../lib/data";

interface Props { dark: boolean }

export default function HistoryScreen({ dark }: Props) {
    const [filter, setFilter] = useState<TxFilter>("all");

    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const card = dark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white border border-slate-100 shadow-sm";
    const divd = dark ? "border-white/6" : "border-slate-100";

    const filtered = filter === "all"
        ? TRANSACTIONS
        : TRANSACTIONS.filter(t => t.cat === filter);

    const totalIn = TRANSACTIONS.filter(t => t.type === "credit").reduce((a, t) => a + t.amount, 0);
    const totalOut = TRANSACTIONS.filter(t => t.type === "debit").reduce((a, t) => a + t.amount, 0);

    return (
        <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
            <div className="max-w-3xl px-5 pt-6 mx-auto">
                <h2 className={`text-xl font-bold mb-5 ${text}`}>History</h2>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className={`rounded-2xl p-4 ${card}`}>
                        <p className={`text-xs mb-1 ${sub}`}>💚 Money In</p>
                        <p className="text-base font-bold text-emerald-500 tabular-nums">+{ksh(totalIn)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 ${card}`}>
                        <p className={`text-xs mb-1 ${sub}`}>🔴 Money Out</p>
                        <p className="text-base font-bold text-rose-500 tabular-nums">−{ksh(totalOut)}</p>
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 pb-3 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {TX_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors
                ${filter === f
                                    ? "bg-emerald-500 text-slate-950"
                                    : dark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className={`rounded-2xl overflow-hidden ${card}`}>
                    {filtered.length === 0 && (
                        <p className={`text-center text-sm py-10 ${sub}`}>No transactions found</p>
                    )}
                    {filtered.map((tx, i) => (
                        <div key={tx.id}
                            className={`flex items-center gap-3 px-4 py-3.5 ${i < filtered.length - 1 ? `border-b ${divd}` : ""}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
                ${tx.type === "credit" ? "bg-emerald-500/12" : "bg-rose-500/10"}`}>
                                {tx.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${text}`}>{tx.label}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${tx.type === "credit"
                                            ? "bg-emerald-500/12 text-emerald-500"
                                            : "bg-rose-500/10 text-rose-400"}`}>
                                        {tx.cat}
                                    </span>
                                    <span className={`text-xs ${sub}`}>{tx.date}</span>
                                </div>
                            </div>
                            <p className={`text-sm font-semibold tabular-nums shrink-0
                ${tx.type === "credit" ? "text-emerald-500" : dark ? "text-slate-200" : "text-slate-700"}`}>
                                {tx.type === "credit" ? "+" : "−"}{ksh(tx.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
