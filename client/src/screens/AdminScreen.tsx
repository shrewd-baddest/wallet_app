// screens/AdminScreen.tsx
import { Users, TrendingUp, Wallet, X, Flag, Lock, Bell, Download } from "lucide-react";
import BackHeader from "../components/BackHeader";
import type { Screen } from "../lib/data";

interface Props { dark: boolean; setScreen: (s: Screen) => void }

const STATS = [
  { label: "Total Users",     val: "12,847",  change: "+234", Icon: Users,    color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Daily Volume",    val: "KSh 4.2M",change: "+18%", Icon: TrendingUp,color:"text-emerald-400",bg: "bg-emerald-500/10"},
  { label: "Active Wallets",  val: "8,291",   change: "+91",  Icon: Wallet,   color: "text-amber-400",  bg: "bg-amber-500/10"  },
  { label: "Failed Tx (24h)", val: "23",      change: "−12",  Icon: X,        color: "text-rose-400",   bg: "bg-rose-500/10"   },
];

const FLAGGED = [
  { name: "John D.",  amount: "KSh 180,000", reason: "High velocity",   risk: "high"   as const },
  { name: "Alice M.", amount: "KSh 95,000",  reason: "New account",     risk: "medium" as const },
  { name: "Corp XYZ", amount: "KSh 450,000", reason: "Unusual pattern", risk: "high"   as const },
];

const QUICK_ACTIONS = [
  { label: "Freeze Account", Icon: Lock,     color: "text-rose-400",    bg: "bg-rose-500/10"    },
  { label: "Broadcast",      Icon: Bell,     color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { label: "Manage Limits",  Icon: TrendingUp,color:"text-amber-400",   bg: "bg-amber-500/10"   },
  { label: "Export Report",  Icon: Download, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const BAR_HEIGHTS = [40, 55, 38, 70, 65, 80, 58];
const BAR_DAYS    = ["M", "T", "W", "T", "F", "S", "S"];

export default function AdminScreen({ dark, setScreen }: Props) {
  const text = dark ? "text-white"     : "text-slate-800";
  const sub  = dark ? "text-slate-400" : "text-slate-500";
  const card = dark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white border border-slate-100 shadow-sm";
  const divd = dark ? "border-white/6" : "border-slate-100";

  return (
    <div className={`min-h-full pb-6 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <BackHeader
        title="Admin"
        subtitle="Control Panel"
        dark={dark}
        onBack={() => setScreen("dashboard")}
        right={
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/12 text-rose-400 font-bold border border-rose-500/20">
            🔴 ADMIN
          </span>
        }
      />

      <div className="px-5 flex flex-col gap-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 ${card}`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.Icon size={17} className={s.color} />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.bg} ${s.color}`}>
                  {s.change}
                </span>
              </div>
              <p className={`text-base font-bold tabular-nums ${text}`}>{s.val}</p>
              <p className={`text-xs ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Volume chart */}
        <div className={`rounded-2xl p-5 ${card}`}>
          <div className="flex justify-between items-center mb-4">
            <p className={`text-sm font-bold ${text}`}>Transaction Volume</p>
            <div className="flex gap-1.5">
              {["7D", "30D", "90D"].map((p, i) => (
                <button key={p}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors
                    ${i === 0
                      ? "bg-emerald-500 text-slate-950"
                      : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-20">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80"
                  style={{ height: `${h}%` }}
                />
                <span className={`text-[9px] ${sub}`}>{BAR_DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-bold ${text}`}>🚨 Flagged</p>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-semibold">
              {FLAGGED.length} alerts
            </span>
          </div>
          <div className={`rounded-2xl overflow-hidden ${card}`}>
            {FLAGGED.map((f, i) => (
              <div key={i}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < FLAGGED.length - 1 ? `border-b ${divd}` : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${f.risk === "high" ? "bg-rose-500/10" : "bg-amber-500/10"}`}>
                  <Flag size={16} className={f.risk === "high" ? "text-rose-400" : "text-amber-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${text}`}>{f.name}</p>
                  <p className={`text-xs ${sub}`}>{f.reason}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold tabular-nums mb-1 ${text}`}>{f.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                    ${f.risk === "high"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-amber-500/10 text-amber-400"}`}>
                    {f.risk.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick admin actions */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a.label}
              className={`rounded-2xl p-4 flex items-center gap-3 text-left transition-opacity hover:opacity-80 ${card}`}>
              <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                <a.Icon size={17} className={a.color} />
              </div>
              <span className={`text-sm font-medium ${a.color}`}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
