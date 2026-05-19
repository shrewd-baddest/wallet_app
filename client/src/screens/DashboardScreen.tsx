// screens/DashboardScreen.tsx
import { useState, useEffect } from "react";
import { Bell, ArrowDownToLine, Send, ArrowUpFromLine, Clock, Eye, EyeOff } from "lucide-react";
import Sparkline from "../components/Sparkline";
import { TRANSACTIONS, SPARK, ksh, type Screen, type ModalType } from "../lib/data";

interface Props { dark: boolean; setScreen: (s: Screen) => void; setModal: (m: ModalType) => void }
interface DashboardData { user: { name: string } }

export default function DashboardScreen({ dark, setScreen, setModal }: Props) {
  const [hidden, setHidden] = useState(false);

  const text = dark ? "text-white" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const card = dark ? "bg-slate-800/60 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm";
  const divd = dark ? "border-slate-700/50" : "border-slate-100";
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);


  async function fetchDashboard() {
    const res = await fetch("/api/dashboard");

    const data = await res.json();

    setDashboard(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-sm ${sub}`}>{greeting} 👋</p>
          <h1 className={`text-2xl font-bold ${text}`}> {dashboard?.user?.name || "Jane Wanjiru"}</h1>
        </div>
        <button onClick={() => setModal("notif")}
          className={`relative p-2.5 rounded-xl transition-colors ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}>
          <Bell size={20} className={sub} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>
      </div>

      {/* Balance card + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Balance card */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-slate-900 border border-slate-700/50 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/8 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-violet-500/8 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-slate-400 text-xs tracking-widest mb-2">TOTAL BALANCE</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-slate-400 text-lg">KSh</span>
                <span className="text-white text-5xl font-extrabold tracking-tight">
                  {hidden ? "••••••" : "234,580"}
                </span>
              </div>
              <p className="text-emerald-400 text-sm">↑ +KSh 22,000 this month</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkline data={SPARK} width={120} height={44} />
              <button onClick={() => setHidden(!hidden)}
                className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                {hidden ? <Eye size={16} className="text-slate-300" /> : <EyeOff size={16} className="text-slate-300" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Savings", val: "48,200", icon: "🏦" },
              { label: "Invested", val: "22,150", icon: "📈" },
              { label: "Locked", val: "10,000", icon: "🔒" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl px-4 py-3 border border-white/6">
                <p className="text-slate-500 text-xs mb-1">{s.icon} {s.label}</p>
                <p className="text-slate-200 text-sm font-semibold tabular-nums">
                  {hidden ? "•••" : `KSh ${s.val}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
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

      {/* Transactions table */}
      <div className={`rounded-2xl overflow-hidden ${card}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${divd}`}>
          <h2 className={`font-bold text-base ${text}`}>Recent Transactions</h2>
          <button onClick={() => setScreen("history")}
            className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors">
            View all →
          </button>
        </div>
        {TRANSACTIONS.slice(0, 6).map((tx, i) => (
          <div key={tx.id}
            className={`flex items-center gap-4 px-5 py-3.5 ${i < 5 ? `border-b ${divd}` : ""}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
              ${tx.type === "credit" ? "bg-emerald-500/12" : "bg-rose-500/10"}`}>
              {tx.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${text}`}>{tx.label}</p>
              <p className={`text-xs ${sub}`}>{tx.sub}</p>
            </div>
            <p className={`text-xs ${sub} hidden sm:block shrink-0`}>{tx.date}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full hidden md:block shrink-0
              ${tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/8 text-rose-400"}`}>
              {tx.cat}
            </span>
            <p className={`text-sm font-semibold tabular-nums shrink-0
              ${tx.type === "credit" ? "text-emerald-500" : dark ? "text-slate-200" : "text-slate-700"}`}>
              {tx.type === "credit" ? "+" : "−"}{ksh(tx.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
