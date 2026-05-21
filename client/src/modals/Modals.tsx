// modals/Modals.tsx
import type { ModalType } from "../lib/data";

interface Props { type: ModalType; dark: boolean; onClose: () => void }

const NOTIFICATIONS = [
  { emoji: "✅", title: "Salary received", body: "KSh 85,000 from EcoBank Ltd", time: "09:14" },
  { emoji: "🎁", title: "Referral bonus!", body: "Your friend joined · KSh 500 credited", time: "Yesterday" },
  { emoji: "⚠️", title: "Unusual login attempt", body: "Tap to review device", time: "May 15" },
  { emoji: "📊", title: "Monthly statement ready", body: "Tap to view April 2025 statement", time: "May 1" },
];

// ── Drag handle ─────────────────────────────────────────────────────────────
function Handle() {
  return <div className="w-10 h-1 mx-auto mb-5 rounded-full bg-slate-600" />;
}

function SuccessSheet({ emoji, title, body, ref: txRef, onClose }: {
  emoji: string; title: string; body: string; ref: string; onClose: () => void
}) {
  return (
    <>
      <Handle />
      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-4xl rounded-full bg-emerald-500/12">
        {emoji}
      </div>
      <h3 className="mb-1 text-xl font-bold text-center text-white">{title}</h3>
      <p className="mb-1 text-sm text-center text-slate-400">{body}</p>
      <p className="font-mono text-xs text-center text-emerald-400 mb-7">{txRef}</p>
      <button onClick={onClose}
        className="w-full py-4 mb-3 text-sm font-bold transition-colors rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950">
        Done
      </button>
      <button onClick={onClose}
        className="w-full py-3 text-sm transition-colors rounded-2xl text-slate-400 hover:text-slate-300">
        Close
      </button>
    </>
  );
}

// ── Confirm sheet ────────────────────────────────────────────────────────────
function ConfirmSheet({ emoji, title, detail, amount, cta, danger, onClose }: {
  emoji: string; title: string; detail: string; amount?: string;
  cta: string; danger?: boolean; onClose: () => void
}) {
  return (
    <>
      <Handle />
      <div className="mb-6 text-center">
        <span className="text-5xl">{emoji}</span>
        <h3 className="mt-3 mb-1 text-xl font-bold text-white">{title}</h3>
        <p className="mb-4 text-sm text-slate-400">{detail}</p>
        {amount && <p className="text-3xl font-extrabold text-white">{amount}</p>}
      </div>
      <button onClick={onClose}
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-colors mb-3
          ${danger
            ? "bg-rose-500 hover:bg-rose-400 text-white"
            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"}`}>
        {cta}
      </button>
      <button onClick={onClose}
        className="w-full py-3 text-sm transition-colors rounded-2xl text-slate-400 hover:text-slate-300">
        Cancel
      </button>
    </>
  );
}

// ── Notifications sheet ──────────────────────────────────────────────────────
function NotifSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Handle />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Notifications</h3>
        <button className="text-xs font-medium text-emerald-500">Mark all read</button>
      </div>
      {NOTIFICATIONS.map((n, i) => (
        <div key={i} className={`flex gap-3 py-3.5 ${i < NOTIFICATIONS.length - 1 ? "border-b border-white/6" : ""}`}>
          <div className="flex items-center justify-center text-xl w-11 h-11 rounded-xl bg-emerald-500/8 shrink-0">
            {n.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{n.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{n.body}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{n.time}</p>
          </div>
        </div>
      ))}
      <button onClick={onClose}
        className="w-full py-3 mt-3 text-sm transition-colors rounded-2xl text-slate-400 hover:text-slate-300">
        Close
      </button>
    </>
  );
}

// ── Root Modal router ────────────────────────────────────────────────────────
export default function Modal({ type, onClose }: Props) {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-t-3xl px-6 pt-5 pb-10
        max-h-[85vh] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}>
        {type === "fundSuccess" && (
          <SuccessSheet
            emoji="🎉" title="Money Added!"
            body="Your wallet has been funded successfully."
            ref="Ref: MVP-TXN-8291K"
            onClose={onClose}
          />
        )}
        {type === "sendConfirm" && (
          <ConfirmSheet
            emoji="📤" title="Confirm Transfer"
            detail="Sending to Grace M."
            amount="KSh 12,000"
            cta="Confirm & Send"
            onClose={onClose}
          />
        )}
        {type === "sendSuccess" && (
          <SuccessSheet
            emoji="✅" title="Transfer Sent!"
            body="Your money has been sent successfully."
            ref="Ref: MVP-TXN-8422A"
            onClose={onClose}
          />
        )}
        {type === "withdrawConfirm" && (
          <ConfirmSheet
            emoji="⬆️" title="Confirm Withdrawal"
            detail="To your M-Pesa (712 •••)"
            amount="KSh 5,000"
            cta="Withdraw Now"
            danger
            onClose={onClose}
          />
        )}
        {type === "withdrawSuccess" && (
          <SuccessSheet
            emoji="💸" title="Withdrawal Initiated"
            body="Your withdrawal request has been sent."
            ref="Ref: MVP-TXN-9947W"
            onClose={onClose}
          />
        )}
        {type === "notif" && <NotifSheet onClose={onClose} />}
      </div>
    </div>
  );
}
