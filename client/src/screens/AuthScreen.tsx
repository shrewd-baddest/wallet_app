import { useState } from "react";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { apiPost } from "../lib/api";

interface Props { dark: boolean; onLogin: (token: string) => void }

type AuthTab = "login" | "register";

const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("254") && digits.length === 12) return digits;
    if (digits.startsWith("+254") && digits.length === 12) return digits.slice(1);
    if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
    if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
    return digits;
};

export default function AuthScreen({ dark, onLogin }: Props) {
    const [tab, setTab] = useState<AuthTab>("login");
    const [showPwd, setShowPwd] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const bg = dark ? "bg-slate-950" : "bg-slate-50";
    const card = dark ? "bg-slate-800/60 border border-slate-700/60" : "bg-white border border-slate-200";
    const text = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const inp = dark
        ? "bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
        : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500";

    const handleLogin = async () => {
        setError(null);
        setNotice(null);
        setLoading(true);

        const phone_number = normalizePhone(phone);
        if (!phone_number || !password) {
            setError("Please enter a valid phone number and password.");
            setLoading(false);
            return;
        }

        const result = await apiPost<{ token: string }>("/auth/login", {
            phone_number,
            password,
        });

        setLoading(false);

        if (!result.success || !result.data?.token) {
            setError(result.message || "Invalid login credentials.");
            return;
        }

        onLogin(result.data.token);
    };

    const handleRegister = async () => {
        setError(null);
        setNotice(null);
        setLoading(true);

        const phone_number = normalizePhone(phone);
        if (!fullName || !phone_number || !password) {
            setError("Please fill in your name, phone and password.");
            setLoading(false);
            return;
        }

        const result = await apiPost("/auth/register", {
            full_name: fullName,
            email: email || undefined,
            phone_number,
            password,
        });

        setLoading(false);

        if (!result.success) {
            setError(result.message || "Unable to register.");
            return;
        }

        setNotice("Registration successful. Verify your phone with OTP from the backend logs, then sign in.");
        setTab("login");
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-12 ${bg}`}>
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center mb-3 shadow-md w-14 h-14 rounded-2xl bg-emerald-500 shadow-emerald-500/25">
                    <Wallet size={28} className="text-slate-950" />
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${text}`}>MVP Wallet</h1>
                <p className={`text-sm mt-1 ${sub}`}>Kenya's smart wallet</p>
            </div>

            <div className={`flex rounded-2xl p-1 mb-6 w-full max-w-sm ${dark ? "bg-slate-800/80" : "bg-slate-100"}`}>
                {(["login", "register"] as AuthTab[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        disabled={loading}
                        aria-pressed={tab === t}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed ${tab === t ? "bg-emerald-500 text-slate-950 shadow-sm" : dark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:bg-slate-200"}`}
                    >
                        {t === "login" ? "Sign In" : "Register"}
                    </button>
                ))}
            </div>

            <div className={`w-full max-w-sm rounded-2xl p-6 ${card}`}>
                {tab === "register" && (
                    <div className="mb-4">
                        <label className={`text-xs font-medium block mb-1.5 ${sub}`}>Full Name</label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inp}`}
                            placeholder="Jane Wanjiru"
                        />
                    </div>
                )}
                {tab === "register" && (
                    <div className="mb-4">
                        <label className={`text-xs font-medium block mb-1.5 ${sub}`}>Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inp}`}
                            placeholder="jane@example.com"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label className={`text-xs font-medium block mb-1.5 ${sub}`}>{tab === "login" ? "Phone" : "Phone Number"}</label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inp}`}
                        placeholder="+254 712 345 678"
                    />
                </div>

                <div className="mb-6">
                    <label className={`text-xs font-medium block mb-1.5 ${sub}`}>Password</label>
                    <div className="relative">
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPwd ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors ${inp}`}
                        />
                        <button
                            type="button"
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${sub}`}
                            onClick={() => setShowPwd((value) => !value)}
                        >
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}
                {notice && <p className="text-xs text-emerald-400 mb-3">{notice}</p>}

                <button
                    type="button"
                    onClick={tab === "login" ? handleLogin : handleRegister}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${loading ? "opacity-50 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"}`}
                >
                    {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create account"}
                </button>

                <p className={`text-center text-xs mt-4 ${sub}`}>
                    {tab === "login"
                        ? "Need an account? "
                        : "Already have one? "}
                    <button
                        type="button"
                        onClick={() => setTab(tab === "login" ? "register" : "login")}
                        disabled={loading}
                        className="font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                        {tab === "login" ? "Register" : "Sign in"}
                    </button>
                </p>

                {tab === "login" && (
                    <p className={`text-center text-xs mt-2 ${sub}`}>
                        Forgot password?{' '}
                        <button type="button" className="font-medium text-emerald-500 hover:text-emerald-400">Reset</button>
                    </p>
                )}
            </div>

            <div className="flex items-center w-full max-w-sm gap-3 mt-5">
                <div className={`h-px flex-1 ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
                <span className={`text-xs ${sub}`}>or continue with</span>
                <div className={`h-px flex-1 ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
            </div>
            <div className="flex gap-3 mt-4">
                {["🇬 Google", "🍎 Apple"].map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${dark ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"}`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
