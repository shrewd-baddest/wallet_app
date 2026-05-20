// screens/WalletScreen.tsx
import { useState, useEffect } from "react";
import { Copy, Check, Zap, Send, ArrowDownToLine, TrendingUp, Clock } from "lucide-react";
import { type Screen, type Wallet, type Transaction, ksh } from "../lib/data";
import { apiGet } from "../lib/api";

interface Props { dark: boolean; setScreen: (s: Screen) => void }

export default function WalletScreen({ dark, setScreen }: Props) {
    const [copied, setCopied] = useState(false);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const card = dark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white border border-slate-100 shadow-sm";

    useEffect(() => {
        const loadWallet = async () => {
            const meRes = await apiGet<{ user: unknown; wallet: Wallet }>("/auth/me");
            const txRes = await apiGet<{ transactions: Transaction[] }>("/transactions?limit=100");

            if (meRes.success && meRes.data?.wallet) {
                setWallet(meRes.data.wallet);
            }

            if (txRes.success && txRes.data) {
                setTransactions(txRes.data.transactions);
            }
        };

        loadWallet();
    }, []);

    const handleCopy = () => {
        setCopied(true);
        navigator.clipboard.writeText(wallet ? String(wallet.id) : "");
        setTimeout(() => setCopied(false), 2000);
    };

    const totalSent = transactions
        .filter((t) => t.type === "transfer_sent" || t.type === "withdrawal")
        .reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = transactions
        .filter((t) => t.type === "deposit" || t.type === "transfer_received")
        .reduce((sum, tx) => sum + tx.amount, 0);
    const savingsRate = totalReceived === 0 ? 0 : Math.round(((totalReceived - totalSent) / totalReceived) * 100);
    const txCount = transactions.length;

    return (
        <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
            <div className="max-w-3xl px-5 pt-6 mx-auto">
                <h2 className={`text-xl font-bold mb-5 ${text}`}>My Wallet</h2>

                <div className="relative p-6 mb-4 overflow-hidden border rounded-2xl bg-slate-900 border-slate-700/50">
                    <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-10 -right-10 bg-violet-500/10" />
                    <div className="absolute w-32 h-32 rounded-full pointer-events-none -bottom-8 -left-4 bg-emerald-500/8" />

                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-slate-400 text-[10px] tracking-widest mb-2">MVP WALLET</p>
                            <div className="flex items-center justify-center rounded w-9 h-7 bg-gradient-to-br from-amber-400 to-amber-600">
                                <div className="w-5 h-4 border rounded-sm bg-amber-300/40 border-amber-200/30" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-emerald-500/20 border-emerald-500/40">
                            <Zap size={18} className="text-emerald-400" />
                        </div>
                    </div>

                    <p className="text-slate-300 tracking-[0.2em] text-base font-mono mb-6">
                        •••• •••• •••• {wallet ? String(wallet.id).slice(-4) : "4829"}
                    </p>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-slate-500 text-[9px] tracking-widest mb-1">CARD HOLDER</p>
                            <p className="text-sm font-semibold tracking-wide text-slate-200">{wallet ? "MVP User" : "Loading..."}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[9px] tracking-widest mb-1">EXPIRES</p>
                            <p className="text-sm font-semibold text-slate-200">05/29</p>
                        </div>
                        <div className="flex">
                            <div className="w-8 h-8 -mr-3 rounded-full bg-rose-500/70" />
                            <div className="w-8 h-8 rounded-full bg-amber-500/70" />
                        </div>
                    </div>
                </div>

                <div className={`rounded-2xl p-4 flex items-center gap-3 mb-4 ${card}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-violet-500/12" : "bg-violet-50"}`}>
                        <span className="text-lg">🔷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs ${sub}`}>Wallet ID</p>
                        <p className={`text-sm font-mono font-semibold tracking-wider ${text}`}>{wallet ? wallet.id : "Loading..."}</p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${copied
                                ? "bg-emerald-500/12 text-emerald-500 border border-emerald-500/30"
                                : dark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
                    {[
                        { label: "Total Sent", val: totalSent ? ksh(totalSent) : "—", Icon: Send, color: "text-violet-400", bg: "bg-violet-500/10" },
                        { label: "Total Received", val: totalReceived ? ksh(totalReceived) : "—", Icon: ArrowDownToLine, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Transactions", val: txCount ? String(txCount) : "—", Icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Savings Rate", val: `${savingsRate}%`, Icon: TrendingUp, color: "text-sky-400", bg: "bg-sky-500/10" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-2xl p-4 ${card}`}>
                            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                                <s.Icon size={16} className={s.color} />
                            </div>
                            <p className={`text-lg font-bold tabular-nums ${text}`}>{s.val}</p>
                            <p className={`text-xs ${sub}`}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setScreen("fund")}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors"
                    >
                        + Add Money
                    </button>
                    <button
                        onClick={() => setScreen("withdraw")}
                        className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-colors
              ${dark ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
}
