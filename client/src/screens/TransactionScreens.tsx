// screens/TransactionScreens.tsx
import { useState } from "react";
import { Check } from "lucide-react";
import BackHeader from "../components/BackHeader";
import { CONTACTS, ksh, type Screen, type ModalType } from "../lib/data";

interface ScreenProps { dark: boolean; setScreen: (s: Screen) => void; setModal: (m: ModalType) => void }

// ── Shared helpers ─────────────────────────────────────────────────────────

function AmountInput({ dark, value, onChange }: {
  dark: boolean; value: string; onChange: (v: string) => void;
}) {
  const inp = dark
    ? "text-white placeholder:text-slate-600"
    : "text-slate-800 placeholder:text-slate-300";
  const bar = value
    ? `bg-gradient-to-r from-emerald-500 to-emerald-400`
    : dark ? "bg-slate-700" : "bg-slate-200";

  return (
    <div className={`rounded-2xl p-5 ${dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm"}`}>
      <p className={`text-xs font-medium mb-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>Amount (KSh)</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-semibold ${dark ? "text-slate-400" : "text-slate-400"}`}>KSh</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/, ""))}
          placeholder="0"
          inputMode="numeric"
          className={`flex-1 text-4xl font-extrabold bg-transparent outline-none ${inp}`}
        />
      </div>
      <div className={`h-0.5 rounded-full mt-3 transition-all ${bar}`} />
    </div>
  );
}

function QuickAmounts({ dark, value, onChange, amounts }: {
  dark: boolean; value: string; onChange: (v: string) => void; amounts: number[]
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {amounts.map(q => (
        <button
          key={q}
          onClick={() => onChange(String(q))}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
            ${value === String(q)
              ? "bg-emerald-500 text-slate-950"
              : dark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          {q >= 1000 ? `${q / 1000}K` : q}
        </button>
      ))}
    </div>
  );
}

function MethodSelector<T extends string>({ dark, options, value, onChange }: {
  dark: boolean;
  options: { id: T; label: string; emoji: string; sub: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-3.5 p-4 rounded-2xl transition-all text-left w-full
            ${value === o.id
              ? dark ? "bg-emerald-500/12 border border-emerald-500/40" : "bg-emerald-50 border border-emerald-300"
              : dark ? "bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60" : "bg-white border border-slate-100 hover:bg-slate-50 shadow-sm"}`}
        >
          <span className="text-2xl">{o.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{o.label}</p>
            <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{o.sub}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
            ${value === o.id ? "border-emerald-500 bg-emerald-500" : dark ? "border-slate-600" : "border-slate-300"}`}>
            {value === o.id && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
        </button>
      ))}
    </div>
  );
}

function PrimaryBtn({ label, onClick, disabled, danger }: {
  label: string; onClick: () => void; disabled?: boolean; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all
        ${danger ? "bg-rose-500 hover:bg-rose-400 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}

// ── Fund Screen ────────────────────────────────────────────────────────────

const FUND_METHODS = [
  { id: "mpesa", label: "M-Pesa", emoji: "📱", sub: "Safaricom · Instant" },
  { id: "card", label: "Debit Card", emoji: "💳", sub: "Visa / Mastercard" },
  { id: "bank", label: "Bank", emoji: "🏦", sub: "RTGS / EFT" },
] as const;
type FundMethod = typeof FUND_METHODS[number]["id"];

export function FundScreen({ dark, setScreen, setModal }: ScreenProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<FundMethod>("mpesa");

  const card = dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm";
  const inp = dark
    ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
    : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500";

  return (
    <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-lg mx-auto">
        <BackHeader title="Add Money" dark={dark} onBack={() => setScreen("dashboard")} />
        <div className="flex flex-col gap-5 px-5">
          <div>
            <AmountInput dark={dark} value={amount} onChange={setAmount} />
            <QuickAmounts dark={dark} value={amount} onChange={setAmount} amounts={[500, 1000, 2000, 5000, 10000, 20000]} />
          </div>

          <div>
            <p className={`text-sm font-semibold mb-3 ${dark ? "text-white" : "text-slate-700"}`}>Payment Method</p>
            <MethodSelector dark={dark} options={[...FUND_METHODS]} value={method} onChange={setMethod} />
          </div>

          {method === "mpesa" && (
            <div className={`rounded-2xl p-4 ${card}`}>
              <p className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>M-Pesa Number</p>
              <div className="flex gap-2">
                <span className={`flex items-center px-3 rounded-xl text-sm font-medium
                  ${dark ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                  🇰🇪 +254
                </span>
                <input className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${inp}`}
                  placeholder="712 345 678" />
              </div>
            </div>
          )}

          <PrimaryBtn
            label={amount ? `Fund ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={() => setModal("fundSuccess")}
            disabled={!amount}
          />
          <p className={`text-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            🔒 Secured by 256-bit SSL
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Send Screen ────────────────────────────────────────────────────────────

export function SendScreen({ dark, setScreen, setModal }: ScreenProps) {
  const [contact, setContact] = useState<typeof CONTACTS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const card = dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm";
  const inp = dark
    ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
    : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none";
  const sub = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-lg mx-auto">
        <BackHeader title="Send Money" dark={dark} onBack={() => setScreen("dashboard")} />
        <div className="flex flex-col gap-5 px-5">
          {/* Contacts carousel */}
          <div>
            <p className={`text-sm font-semibold mb-3 ${dark ? "text-white" : "text-slate-700"}`}>Recent Contacts</p>
            <div className="flex gap-3 pb-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {CONTACTS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setContact(contact?.name === c.name ? null : c)}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className={`w-[52px] h-[52px] rounded-2xl ${c.color} flex items-center justify-center font-bold text-sm text-white
                    transition-all ${contact?.name === c.name ? "ring-2 ring-offset-2 ring-emerald-500" : "opacity-80"}`}>
                    {c.initials}
                  </div>
                  <span className={`text-[10px] font-medium ${sub}`}>{c.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div className={`rounded-2xl p-4 ${card}`}>
            <p className={`text-xs font-medium mb-2 ${sub}`}>
              {contact ? `Sending to ${contact.name}` : "Recipient"}
            </p>
            {contact ? (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${contact.color} flex items-center justify-center text-sm font-bold text-white`}>
                  {contact.initials}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{contact.name}</p>
                  <p className={`text-xs ${sub}`}>+254 7•• ••• •••</p>
                </div>
                <button onClick={() => setContact(null)} className={`text-xs px-2 py-1 rounded-lg ${dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>✕</button>
              </div>
            ) : (
              <input className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${inp}`}
                placeholder="+254 700 000 000" />
            )}
          </div>

          {/* Amount */}
          <div>
            <AmountInput dark={dark} value={amount} onChange={setAmount} />
            <QuickAmounts dark={dark} value={amount} onChange={setAmount} amounts={[500, 1000, 2000, 5000]} />
          </div>

          {/* Note */}
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="💬 Add a note (optional)"
            className={`w-full px-4 py-3 rounded-2xl text-sm transition-colors ${inp}`}
          />

          {/* Fee summary */}
          {amount && (
            <div className={`rounded-2xl p-4 ${card}`}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className={sub}>Transfer fee</span>
                <span className="font-medium text-emerald-500">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={sub}>Recipient gets</span>
                <span className={`font-semibold tabular-nums ${dark ? "text-white" : "text-slate-800"}`}>
                  {ksh(Number(amount))}
                </span>
              </div>
            </div>
          )}

          <PrimaryBtn
            label={amount ? `Send ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={() => setModal("sendConfirm")}
            disabled={!amount}
          />
        </div>
      </div>
    </div>
  );
}

// ── Withdraw Screen ────────────────────────────────────────────────────────

const WITHDRAW_OPTS = [
  { id: "mpesa", label: "M-Pesa", emoji: "📱", sub: "Instant · No fee" },
  { id: "bank", label: "Bank Account", emoji: "🏦", sub: "1-2 business days" },
  { id: "atm", label: "ATM Code", emoji: "🏧", sub: "Available 24/7" },
] as const;
type WithdrawDest = typeof WITHDRAW_OPTS[number]["id"];

export function WithdrawScreen({ dark, setScreen, setModal }: ScreenProps) {
  const [amount, setAmount] = useState("");
  const [dest, setDest] = useState<WithdrawDest>("mpesa");

  const sub = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-lg mx-auto">
        <BackHeader title="Withdraw" dark={dark} onBack={() => setScreen("dashboard")} />
        <div className="flex flex-col gap-5 px-5">
          {/* Balance pill */}
          <div className={`rounded-2xl p-4 ${dark ? "bg-emerald-500/8 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"}`}>
            <p className={`text-xs mb-1 ${sub}`}>Available Balance</p>
            <p className={`text-2xl font-extrabold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
              KSh 234,580
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className={sub}>Daily limit used</span>
                <span className={sub}>KSh 0 / 200,000</span>
              </div>
              <div className={`h-1 rounded-full ${dark ? "bg-slate-700" : "bg-emerald-100"}`}>
                <div className="w-0 h-full transition-all rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <AmountInput dark={dark} value={amount} onChange={setAmount} />
            <QuickAmounts dark={dark} value={amount} onChange={setAmount} amounts={[1000, 2500, 5000, 10000, 25000]} />
          </div>

          {/* Destination */}
          <div>
            <p className={`text-sm font-semibold mb-3 ${dark ? "text-white" : "text-slate-700"}`}>Withdraw To</p>
            <MethodSelector dark={dark} options={[...WITHDRAW_OPTS]} value={dest} onChange={setDest} />
          </div>

          <PrimaryBtn
            label={amount ? `Withdraw ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={() => setModal("withdrawConfirm")}
            disabled={!amount}
            danger
          />
        </div>
      </div>
    </div>
  );
}
