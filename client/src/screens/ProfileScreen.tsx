// screens/ProfileScreen.tsx
import { useEffect, useState } from "react";
import {
    Settings, CreditCard, Bell, Shield, Lock,
    Globe, HelpCircle, Flag, ChevronRight, LogOut,
} from "lucide-react";
import { apiGet } from "../lib/api";

interface Props { dark: boolean; onLogout: () => void }

interface ProfilePayload {
    profile: {
        id: number;
        full_name: string;
        email: string;
        phone_number: string;
        is_verified: boolean;
        initials: string;
        joined_at: string;
    };
    wallet: {
        balance: number;
        currency: string;
        status: string;
    };
    referral: {
        code: string;
        total_referrals: number;
        total_earned: number;
    };
    kyc: {
        progress: number;
        next_step: string;
    };
    settings: {
        notifications: boolean;
        two_factor_auth: boolean;
        language: string;
    };
}

export default function ProfileScreen({ dark, onLogout }: Props) {
    const [data, setData] = useState<ProfilePayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            const res = await apiGet<ProfilePayload>("/profile");

            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.message || "Unable to load profile data.");
            }

            setLoading(false);
        };

        loadProfile();
    }, []);

    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const card = dark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white border border-slate-100 shadow-sm";
    const divd = dark ? "border-white/6" : "border-slate-100";
    const iconBg = dark ? "bg-slate-700" : "bg-slate-100";

    const profile = data?.profile;
    const kyc = data?.kyc;
    const referral = data?.referral;
    const settings = data?.settings;

    const menuItems = [
        { Icon: CreditCard, label: "Linked Cards", sub: "2 cards linked" },
        { Icon: Bell, label: "Notifications", sub: settings ? (settings.notifications ? "All enabled" : "Disabled") : "Loading..." },
        { Icon: Shield, label: "Security", sub: settings ? (settings.two_factor_auth ? "2FA enabled" : "2FA disabled") : "Loading..." },
        { Icon: Lock, label: "Privacy", sub: "Settings" },
        { Icon: Globe, label: "Language", sub: settings?.language ?? "English (Kenya)" },
        { Icon: HelpCircle, label: "Help & Support", sub: "Chat, FAQ" },
        { Icon: Flag, label: "Report Issue", sub: "" },
    ];

    const initials = profile?.initials ?? "JW";
    const fullName = profile?.full_name ?? "Jane Wanjiru";
    const email = profile?.email ?? "jane@example.com";
    const isVerified = profile?.is_verified ?? true;
    const referralCode = referral?.code ?? "JANE500";
    const referralMeta = referral ? `${referral.total_referrals} friends referred · KSh ${referral.total_earned.toLocaleString()}` : "3 friends referred · KSh 1,500 earned";
    const kycProgress = kyc?.progress ?? 85;
    const kycNextStep = kyc?.next_step ?? "Upload utility bill to unlock KSh 500K limit";

    return (
        <div className={`min-h-full pb-10 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
            <div className="max-w-2xl px-5 pt-6 mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-bold ${text}`}>Profile</h2>
                    {loading && <span className={`text-xs ${sub}`}>Loading...</span>}
                </div>

                {error && (
                    <div className={`rounded-2xl p-4 mb-4 ${card}`}>
                        <p className={`text-sm font-medium ${text}`}>Unable to load profile</p>
                        <p className={`text-xs mt-2 ${sub}`}>{error}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center justify-center w-16 h-16 text-xl font-extrabold shadow-md rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 shadow-emerald-500/25">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-lg font-bold ${text}`}>{fullName}</h2>
                        <p className={`text-xs ${sub}`}>{email}</p>
                        <div className="flex gap-2 mt-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isVerified ? "bg-emerald-500/12 text-emerald-500" : "bg-slate-500/12 text-slate-400"} font-medium flex items-center gap-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? "bg-emerald-500" : "bg-slate-400"} inline-block`} />
                                {isVerified ? "Verified" : "Unverified"}
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

                <div className={`rounded-2xl p-4 mb-4 ${dark ? "bg-violet-500/8 border border-violet-500/20" : "bg-violet-50 border border-violet-100"}`}>
                    <div className="flex justify-between items-center mb-2.5">
                        <p className={`text-sm font-semibold ${dark ? "text-violet-300" : "text-violet-700"}`}>KYC Verification</p>
                        <span className="text-xs font-semibold text-emerald-500">{kycProgress}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${dark ? "bg-slate-700" : "bg-violet-200"} mb-2.5`}>
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${kycProgress}%` }}
                        />
                    </div>
                    <p className={`text-xs ${dark ? "text-violet-400/70" : "text-violet-500"}`}>
                        📋 {kycNextStep}
                    </p>
                </div>

                <div className={`rounded-2xl p-4 mb-4 ${card}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-xl bg-amber-500/12">🎁</div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${text}`}>Referral Code</p>
                            <p className="font-mono text-base font-bold tracking-widest text-amber-500">{referralCode}</p>
                        </div>
                        <button className="px-3 py-2 text-xs font-bold transition-colors bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl">
                            Share
                        </button>
                    </div>
                    <p className={`text-xs mt-3 ${sub}`}>{referralMeta}</p>
                </div>

                <div className={`rounded-2xl overflow-hidden mb-4 ${card}`}>
                    {menuItems.map(({ Icon, label, sub: msub }, i) => (
                        <button
                            key={label}
                            className={`flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors ${dark ? "hover:bg-white/4" : "hover:bg-slate-50"} ${i < menuItems.length - 1 ? `border-b ${divd}` : ""}`}>
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
