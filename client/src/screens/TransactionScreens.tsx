// screens/TransactionScreens.tsx
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import BackHeader from "../components/BackHeader";
import { apiPost, apiGet } from "../lib/api";
import { ksh, type Screen, type ModalType } from "../lib/data";

interface ScreenProps { dark: boolean; setScreen: (s: Screen) => void; setModal: (m: ModalType) => void }

const CONTACTS = [
  { name: "Jane Wanjiru", initials: "JW", color: "bg-emerald-500", phone: "254712345678" },
  { name: "Samuel Njoroge", initials: "SN", color: "bg-sky-500", phone: "254723456789" },
  { name: "Aisha Omar", initials: "AO", color: "bg-violet-500", phone: "254734567890" },
] as const;

const normalizeKenyanPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return digits.slice(1);
  if (digits.startsWith("254") && digits.length === 12) return digits.slice(3);
  return digits;
};

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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [depositMessage, setDepositMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const card = dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm";
  const inp = dark
    ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
    : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500";

  const handleFund = async () => {
    const normalized = normalizeKenyanPhone(phone);
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount to fund your wallet.");
      return;
    }
    if (normalized.length !== 9) {
      setError("Enter a valid 9-digit Kenyan phone number.");
      return;
    }

    setLoading(true);
    setError(null);
    setDepositMessage('Enter your M-Pesa PIN on your phone and wait for confirmation.');

    const res = await apiPost<{ checkout_request_id: string }>("/wallet/deposit", {
      amount: Number(amount),
      phone_number: `254${normalized}`,
    });

    if (!res.success) {
      setLoading(false);
      setDepositMessage(null);
      setError(res.message || "Unable to initiate deposit.");
      return;
    }

    const checkoutId = res.data?.checkout_request_id;
    if (!checkoutId) {
      setLoading(false);
      setDepositMessage(null);
      setError("Deposit started but no checkout reference was returned.");
      return;
    }

    setCheckoutRequestId(checkoutId);
    pollDepositStatus(checkoutId);
  };

  const pollDepositStatus = async (checkoutId: string, attempt = 0): Promise<void> => {
    if (attempt >= 30 || !mountedRef.current) {
      setLoading(false);
      setDepositMessage('Still waiting for M-Pesa confirmation. Please keep the app open and try again if needed.');
      return;
    }

    const statusRes = await apiGet<{ status: string }>(`/wallet/deposit/status/${checkoutId}`);
    if (!mountedRef.current) return;

    if (!statusRes.success) {
      setLoading(false);
      setDepositMessage(null);
      setError(statusRes.message || 'Unable to verify deposit status.');
      return;
    }

    const status = statusRes.data?.status;
    if (status === 'pending') {
      setDepositMessage('Waiting for M-Pesa confirmation...');
      setTimeout(() => pollDepositStatus(checkoutId, attempt + 1), 2000);
      return;
    }

    setCheckoutRequestId(null);
    setDepositMessage(null);
    setLoading(false);

    if (status === 'completed') {
      setModal('fundSuccess');
      setAmount('');
      setPhone('');
      return;
    }

    setError('Deposit failed or M-Pesa PIN entry was canceled. Please try again.');
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

          <div className={`rounded-2xl p-4 ${card}`}>
            <p className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Phone Number</p>
            <div className="flex gap-2">
              <span className={`flex items-center px-3 rounded-xl text-sm font-medium
                ${dark ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                🇰🇪 +254
              </span>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="712345678"
                inputMode="numeric"
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${inp}`}
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
          {depositMessage && !error && <p className="text-sm text-slate-400">{depositMessage}</p>}
          {checkoutRequestId && !error && (
            <p className="text-xs text-slate-500">Reference: {checkoutRequestId}</p>
          )}

          <PrimaryBtn
            label={loading ? "Processing..." : amount ? `Fund ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={handleFund}
            disabled={!amount || loading}
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
  const [contact, setContact] = useState<(typeof CONTACTS)[number] | null>(null);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm";
  const inp = dark
    ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
    : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none";
  const sub = dark ? "text-slate-400" : "text-slate-500";

  const handleSend = async () => {
    const normalized = normalizeKenyanPhone(contact?.phone ?? recipientPhone);
    if (normalized.length !== 9) {
      setError("Enter a valid 9-digit Kenyan recipient number.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount to send.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiPost("/transfers/send", {
      recipient_phone: `254${normalized}`,
      amount: Number(amount),
      description: note || undefined,
    });

    setLoading(false);

    if (res.success) {
      setModal("sendSuccess");
      setContact(null);
      setRecipientPhone("");
      setAmount("");
      setNote("");
    } else {
      setError(res.message || "Unable to send funds.");
    }
  };

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
                  onClick={() => {
                    const next = contact?.name === c.name ? null : c;
                    setContact(next);
                    setRecipientPhone(next ? next.phone : "");
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className={`w-13 h-13 rounded-2xl ${c.color} flex items-center justify-center font-bold text-sm text-white
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
                  <p className={`text-xs ${sub}`}>{`+${contact.phone}`}</p>
                </div>
                <button onClick={() => { setContact(null); setRecipientPhone(""); }} className={`text-xs px-2 py-1 rounded-lg ${dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <span className={`flex items-center px-3 rounded-xl text-sm font-medium
                  ${dark ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                  🇰🇪 +254
                </span>
                <input
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="712345678"
                  inputMode="numeric"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${inp}`}
                />
              </div>
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

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <PrimaryBtn
            label={loading ? "Sending..." : amount ? `Send ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={handleSend}
            disabled={!amount || loading}
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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [withdrawalId, setWithdrawalId] = useState<number | null>(null);
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const sub = dark ? "text-slate-400" : "text-slate-500";

  const handleWithdraw = async () => {
    const normalized = normalizeKenyanPhone(phone);
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount to withdraw.");
      return;
    }

    if (normalized.length !== 9) {
      setError("Enter a valid 9-digit Kenyan phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiPost<{ withdrawal_id: number }>("/wallet/withdraw", {
      amount: Number(amount),
      phone_number: `254${normalized}`,
    });

    if (!res.success) {
      setLoading(false);
      setError(res.message || "Unable to initiate withdrawal.");
      return;
    }

    const wid = res.data?.withdrawal_id;
    if (!wid) {
      setLoading(false);
      setError('Withdrawal started but no withdrawal id returned.');
      return;
    }

    setWithdrawalId(wid);
    setWithdrawMessage('Processing withdrawal. This may take a moment.');
    pollWithdrawStatus(wid);
  };

  const pollWithdrawStatus = async (wid: number, attempt = 0): Promise<void> => {
    if (attempt >= 30 || !mountedRef.current) {
      setLoading(false);
      setWithdrawMessage('Still waiting for withdrawal confirmation. Please check later.');
      return;
    }

    const statusRes = await apiGet<{ status: string }>(`/wallet/withdraw/status/${wid}`);
    if (!mountedRef.current) return;

    if (!statusRes.success) {
      setLoading(false);
      setWithdrawMessage(null);
      setError(statusRes.message || 'Unable to verify withdrawal status.');
      return;
    }

    const status = statusRes.data?.status;
    if (status === 'pending' || status === 'processing') {
      setWithdrawMessage('Waiting for payout confirmation...');
      setTimeout(() => pollWithdrawStatus(wid, attempt + 1), 2000);
      return;
    }

    setWithdrawalId(null);
    setWithdrawMessage(null);
    setLoading(false);

    if (status === 'completed') {
      setModal('withdrawSuccess');
      setAmount('');
      setPhone('');
      return;
    }

    setError('Withdrawal failed. Please contact support or try again.');
  };

  // Fetch wallet balance when the component mounts
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await apiGet<{ wallet: { balance: number } }>("/wallet");
      if (!mounted) return;
      if (res.success && res.data?.wallet) {
        setBalance(Number(res.data.wallet.balance));
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-lg mx-auto">
        <BackHeader title="Withdraw" dark={dark} onBack={() => setScreen("dashboard")} />
        <div className="flex flex-col gap-5 px-5">
          {/* Balance pill */}
          <div className={`rounded-2xl p-4 ${dark ? "bg-emerald-500/8 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"}`}>
            <p className={`text-xs mb-1 ${sub}`}>Available Balance</p>
            <p className={`text-2xl font-extrabold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
              {balance !== null ? ksh(balance) : "Loading..."}
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

          <div className={`rounded-2xl p-4 ${dark ? "bg-slate-800/70 border border-slate-700/60" : "bg-white border border-slate-100 shadow-sm"}`}>
            <p className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Phone Number</p>
            <div className="flex gap-2">
              <span className={`flex items-center px-3 rounded-xl text-sm font-medium
                ${dark ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                🇰🇪 +254
              </span>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="712345678"
                inputMode="numeric"
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${dark ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500" : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500"}`}
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
          {withdrawMessage && !error && <p className="text-sm text-slate-400">{withdrawMessage}</p>}
          {withdrawalId && !error && (
            <p className="text-xs text-slate-500">Reference: {withdrawalId}</p>
          )}

          <PrimaryBtn
            label={loading ? "Processing..." : amount ? `Withdraw ${ksh(Number(amount))} →` : "Enter amount"}
            onClick={handleWithdraw}
            disabled={!amount || loading}
            danger
          />
        </div>
      </div>
    </div>
  );
}
