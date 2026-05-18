// screens/ProfileScreen.tsx
import {
    Settings, CreditCard, Bell, Shield, Lock,
    Globe, HelpCircle, Flag, ChevronRight, LogOut,
} from "lucide-react";

interface Props { dark: boolean; onLogout: () => void }

const MENU = [
    { Icon: CreditCard, label: "Linked Cards", sub: "2 cards linked" },
    { Icon: Bell, label: "Notifications", sub: "All enabled" },
    { Icon: Shield, label: "Security", sub: "2FA enabled" },
    { Icon: Lock, label: "Privacy", sub: "Settings" },
    { Icon: Globe, label: "Language", sub: "English (Kenya)" },
    { Icon: HelpCircle, label: "Help & Support", sub: "Chat, FAQ" },
    { Icon: Flag, label: "Report Issue", sub: "" },
];

export default function ProfileScreen({ dark, onLogout }: Props) {
    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const card = dark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white border border-slate-100 shadow-sm";
    const divd = dark ? "border-white/6" : "border-slate-100";
    const iconBg = dark ? "bg-slate-700" : "bg-slate-100";

    return (
        <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
            <div className="max-w-2xl px-5 pt-6 mx-auto">

                {/* Profile header */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center justify-center w-16 h-16 text-xl font-extrabold shadow-md rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 shadow-emerald-500/25">
                        JW
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-lg font-bold ${text}`}>Jane Wanjiru</h2>
                        <p className={`text-xs ${sub}`}>jane@example.com</p>
                        <div className="flex gap-2 mt-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                Verified
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-500 font-medium">
                                ⭐ Premium
                            </span>
                        </div>
                    </div>
                    <button className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <Settings size={17} className={sub} />
                    </button>
                </div>

                {/* KYC progress */}
                <div className={`rounded-2xl p-4 mb-4 ${dark ? "bg-violet-500/8 border border-violet-500/20" : "bg-violet-50 border border-violet-100"}`}>
                    <div className="flex justify-between items-center mb-2.5">
                        <p className={`text-sm font-semibold ${dark ? "text-violet-300" : "text-violet-700"}`}>KYC Verification</p>
                        <span className="text-xs font-semibold text-emerald-500">85%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${dark ? "bg-slate-700" : "bg-violet-200"} mb-2.5`}>
                        <div className="h-full w-[85%] rounded-full bg-emerald-500 transition-all" />
                    </div>
                    <p className={`text-xs ${dark ? "text-violet-400/70" : "text-violet-500"}`}>
                        📋 Upload utility bill to unlock KSh 500K limit
                    </p>
                </div>

                {/* Referral */}
                <div className={`rounded-2xl p-4 mb-4 ${card}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-xl bg-amber-500/12">🎁</div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${text}`}>Referral Code</p>
                            <p className="font-mono text-base font-bold tracking-widest text-amber-500">JANE500</p>
                        </div>
                        <button className="px-3 py-2 text-xs font-bold transition-colors bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl">
                            Share
                        </button>
                    </div>
                    <p className={`text-xs mt-3 ${sub}`}>3 friends referred · KSh 1,500 earned</p>
                </div>

                {/* Menu */}
                <div className={`rounded-2xl overflow-hidden mb-4 ${card}`}>
                    {MENU.map(({ Icon, label, sub: msub }, i) => (
                        <button key={label}
                            className={`flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors hover:${dark ? "bg-white/4" : "bg-slate-50"}
                ${i < MENU.length - 1 ? `border-b ${divd}` : ""}`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                <Icon size={17} className={sub} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${text}`}>{label}</p>
                                {msub && <p className={`text-xs ${sub}`}>{msub}</p>}
                            </div>
                            <ChevronRight size={16} className={sub} />
                        </button>
                    ))}
                </div>

                {/* Sign out */}
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center w-full gap-2 py-4 text-sm font-semibold transition-colors border rounded-2xl border-rose-500/30 bg-rose-500/8 text-rose-500 hover:bg-rose-500/12"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
