// screens/AuthScreen.tsx
import { useState, useRef } from "react";
import { Wallet, Eye, EyeOff, Fingerprint } from "lucide-react";

interface Props { dark: boolean; onLogin: () => void }

type AuthTab = "login" | "register";
type AuthStep = "form" | "pin";

export default function AuthScreen({ dark, onLogin }: Props) {
    const [tab, setTab] = useState<AuthTab>("login");
    const [step, setStep] = useState<AuthStep>("form");
    const [showPwd, setShowPwd] = useState(false);
    const [pin, setPin] = useState(["", "", "", "", ""]);
    const refs = Array.from({ length: 5 }, () => useRef<HTMLInputElement>(null));

    const bg = dark ? "bg-slate-950" : "bg-slate-50";
    const card = dark ? "bg-slate-800/60 border border-slate-700/60" : "bg-white border border-slate-200";
    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const inp = dark
        ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
        : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500";

    const handlePin = (i: number, v: string) => {
        if (!/^[0-9]?$/.test(v)) return;
        const next = [...pin]; next[i] = v; setPin(next);
        if (v && i < 4) refs[i + 1].current?.focus();
        if (next.filter(Boolean).length === 5) setTimeout(onLogin, 350);
    };

    // ── PIN step ─────────────────────────────────────────────────────────────
    if (step === "pin") return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-8 py-12 ${bg}`}>
            <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-emerald-500/15">
                <Fingerprint size={32} className="text-emerald-500" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${text}`}>Create PIN</h2>
            <p className={`text-sm text-center mb-10 ${sub}`}>
                Set a 5-digit PIN to secure your wallet
            </p>

            <div className="flex gap-3 mb-10">
                {pin.map((d, i) => (
                    <input
                        key={i}
                        ref={refs[i]}
                        value={d}
                        onChange={e => handlePin(i, e.target.value)}
                        onKeyDown={e => e.key === "Backspace" && !d && i > 0 && refs[i - 1].current?.focus()}
                        maxLength={1}
                        type="password"
                        inputMode="numeric"
                        className={`w-12 h-14 rounded-xl text-center text-2xl font-bold outline-none transition-all
              ${inp} ${d ? "border-emerald-500" : ""}`}
                    />
                ))}
            </div>

            <p className={`text-xs ${sub}`}>🔒 Encrypted and stored securely</p>
        </div>
    );

    // ── Form step ─────────────────────────────────────────────────────────────
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-12 ${bg}`}>
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center mb-3 shadow-md w-14 h-14 rounded-2xl bg-emerald-500 shadow-emerald-500/25">
                    <Wallet size={28} className="text-slate-950" />
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${text}`}>MVP Wallet</h1>
                <p className={`text-sm mt-1 ${sub}`}>Kenya's smart wallet</p>
            </div>

            {/* Tab toggle */}
            <div className={`flex rounded-xl p-1 mb-6 w-full max-w-sm ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                {(["login", "register"] as AuthTab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${tab === t
                                ? "bg-emerald-500 text-slate-950 shadow-sm"
                                : dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                        {t === "login" ? "Sign In" : "Register"}
                    </button>
                ))}
            </div>

            {/* Card */}
            <div className={`w-full max-w-sm rounded-2xl p-6 ${card}`}>
                {tab === "register" && (
                    <div className="mb-4">
                        <label className={`text-xs font-medium block mb-1.5 ${sub}`}>Full Name</label>
                        <input className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inp}`}
                            placeholder="Jane Wanjiru" defaultValue="Jane Wanjiru" />
                    </div>
                )}

                <div className="mb-4">
                    <label className={`text-xs font-medium block mb-1.5 ${sub}`}>
                        {tab === "login" ? "Email / Phone" : "Phone Number"}
                    </label>
                    <input className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inp}`}
                        placeholder={tab === "login" ? "jane@example.com" : "+254 712 345 678"}
                        defaultValue={tab === "login" ? "jane@example.com" : ""} />
                </div>

                <div className="mb-6">
                    <label className={`text-xs font-medium block mb-1.5 ${sub}`}>Password</label>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            defaultValue="mypassword123"
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors ${inp}`}
                        />
                        <button onClick={() => setShowPwd(!showPwd)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${sub}`}>
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => tab === "register" ? setStep("pin") : onLogin()}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors"
                >
                    {tab === "login" ? "Sign In →" : "Continue →"}
                </button>

                {tab === "login" && (
                    <p className={`text-center text-xs mt-4 ${sub}`}>
                        Forgot password?{" "}
                        <span className="font-medium cursor-pointer text-emerald-500">Reset</span>
                    </p>
                )}
            </div>

            {/* Social */}
            <div className="flex items-center w-full max-w-sm gap-3 mt-5">
                <div className={`h-px flex-1 ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
                <span className={`text-xs ${sub}`}>or continue with</span>
                <div className={`h-px flex-1 ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
            </div>
            <div className="flex gap-3 mt-4">
                {["🇬 Google", "🍎 Apple"].map(s => (
                    <button key={s}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${dark ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"}`}>
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
