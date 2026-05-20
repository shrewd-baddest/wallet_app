// screens/DashboardScreen.tsx
import { useState, useEffect } from "react";
import { Bell, ArrowDownToLine, Send, ArrowUpFromLine, Clock, Eye, EyeOff } from "lucide-react";
import Sparkline from "../components/Sparkline";
import { apiGet } from "../lib/api";
import { isPositiveTransaction, ksh, transactionLabel, type DashboardData, type Screen, type ModalType } from "../lib/data";

interface Props { dark: boolean; setScreen: (s: Screen) => void; setModal: (m: ModalType) => void }

const transactionMeta: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  deposit: { emoji: "💰", label: "Deposit", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  withdrawal: { emoji: "💸", label: "Withdrawal", color: "text-rose-500", bg: "bg-rose-500/10" },
  transfer_sent: { emoji: "📤", label: "Sent", color: "text-amber-400", bg: "bg-amber-500/10" },
  transfer_received: { emoji: "📥", label: "Received", color: "text-sky-400", bg: "bg-sky-500/10" },
};

export default function DashboardScreen({ dark, setScreen, setModal }: Props) {
  const [hidden, setHidden] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const text = dark ? "text-white" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const card = dark ? "bg-slate-800/60 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm";
  const divd = dark ? "border-slate-700/50" : "border-slate-100";

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      const res = await apiGet<DashboardData>("/dashboard");

      if (!res.success || !res.data) {
        setError(res.message || "Unable to load dashboard data.");
      } else {
        setDashboard(res.data);
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const actions = [
    { label: "Fund", Icon: ArrowDownToLine, color: "text-emerald-400", bg: "bg-emerald-500/10", screen: "fund" },
    { label: "Send", Icon: Send, color: "text-violet-400", bg: "bg-violet-500/10", screen: "send" },
    { label: "Withdraw", Icon: ArrowUpFromLine, color: "text-rose-400", bg: "bg-rose-500/10", screen: "withdraw" },
    { label: "History", Icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", screen: "history" },
  ] as const;

  const time = new Date().getHours();
  const greeting = time < 12 ? "Good morning" : time < 18 ? "Good afternoon" : "Good evening";

  const walletBalance = dashboard?.wallet.balance ?? 0;
  const walletCurrency = dashboard?.wallet.currency ?? "KES";
  const recentTransactions = dashboard?.recent_transactions ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-sm ${sub}`}>{greeting} 👋</p>
          <h1 className={`text-2xl font-bold ${text}`}>{dashboard?.user.full_name ?? "Loading..."}</h1>
        </div>
        <button onClick={() => setModal("notif")}
          className={`relative p-2.5 rounded-xl transition-colors ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}>
          <Bell size={20} className={sub} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl p-6 bg-slate-900 border border-slate-700/50 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/8 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-violet-500/8 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-slate-400 text-xs tracking-widest mb-2">TOTAL BALANCE</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-slate-400 text-lg">{walletCurrency}</span>
                <span className="text-white text-5xl font-extrabold tracking-tight">
                  {hidden ? "••••••" : walletBalance.toLocaleString()}
                </span>
              </div>
              <p className="text-emerald-400 text-sm">{dashboard ? `↑ ${ksh(dashboard.analytics.monthly_income)} this month` : "Loading analytics..."}</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkline data={dashboard?.analytics.sparkline ?? []} width={120} height={44} />
              <button onClick={() => setHidden(!hidden)}
                className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                {hidden ? <Eye size={16} className="text-slate-300" /> : <EyeOff size={16} className="text-slate-300" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/6">
              <p className="text-slate-500 text-xs mb-1">💰 Monthly Income</p>
              <p className="text-slate-200 text-sm font-semibold tabular-nums">
                {dashboard ? ksh(dashboard.analytics.monthly_income) : "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/6">
              <p className="text-slate-500 text-xs mb-1">📉 Monthly Expenses</p>
              <p className="text-slate-200 text-sm font-semibold tabular-nums">
                {dashboard ? ksh(dashboard.analytics.monthly_expenses) : "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/6">
              <p className="text-slate-500 text-xs mb-1">📊 Transactions</p>
              <p className="text-slate-200 text-sm font-semibold tabular-nums">
                {dashboard ? dashboard.stats.total_transactions : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${card}`}>
          <p className={`text-sm font-semibold mb-4 ${text}`}>Quick Actions</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {actions.map(({ label, Icon, color, bg, screen }) => (
              <button key={label} onClick={() => setScreen(screen as Screen)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 ${bg}`}>
                <Icon size={22} className={color} />
                <span className={`text-xs font-medium ${color}`}>{label}</span>
              </button>
            ))}
          </div>

          <div className={`rounded-xl p-3 ${dark ? "bg-violet-500/8 border border-violet-500/15" : "bg-violet-50 border border-violet-100"}`}>
            <p className={`font-semibold text-sm mb-0.5 ${dark ? "text-violet-300" : "text-violet-700"}`}>🎁 Refer &amp; Earn</p>
            <p className={`text-xs mb-2 ${dark ? "text-violet-400/70" : "text-violet-500"}`}>Earn KSh 500 per friend</p>
            <button className="w-full py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold transition-colors">
              Invite Now
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden ${card}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${divd}`}>
          <h2 className={`font-bold text-base ${text}`}>Recent Transactions</h2>
          <button onClick={() => setScreen("history")}
            className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors">
            View all →
          </button>
        </div>
        {loading && (
          <div className="px-5 py-7 text-sm text-slate-400">Loading recent transactions…</div>
        )}
        {error && (
          <div className="px-5 py-7 text-sm text-rose-400">{error}</div>
        )}
        {!loading && !error && recentTransactions.length === 0 && (
          <div className="px-5 py-7 text-sm text-slate-400">No recent transactions found.</div>
        )}
        {!loading && !error && recentTransactions.map((tx, i) => {
          const meta = transactionMeta[tx.type] ?? { emoji: "💼", label: transactionLabel(tx.type), color: "text-slate-400", bg: "bg-slate-700/10" };
          const amountLabel = isPositiveTransaction(tx.type) ? "+" : "−";
          const dateLabel = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "";
          return (
            <div key={tx.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < recentTransactions.length - 1 ? `border-b ${divd}` : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${tx.type === "deposit" || tx.type === "transfer_received" ? "bg-emerald-500/12" : "bg-rose-500/10"}`}>
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${text}`}>{tx.description ?? meta.label}</p>
                <p className={`text-xs ${sub}`}>{meta.label}</p>
              </div>
              <p className={`text-xs ${sub} hidden sm:block shrink-0`}>{dateLabel}</p>
              <p className={`text-sm font-semibold tabular-nums shrink-0 ${isPositiveTransaction(tx.type) ? "text-emerald-500" : dark ? "text-slate-200" : "text-slate-700"}`}>
                {amountLabel}{ksh(tx.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
