// App.tsx — MVP Wallet
// Fully responsive website layout (no phone shell).

import { useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Wallet } from "lucide-react";

import BottomNav from "./components/BottomNav";
import SplashScreen from "./screens/SplashScreen";
import AuthScreen from "./screens/AuthScreen";
import DashboardScreen from "./screens/DashboardScreen";
import HistoryScreen from "./screens/HistoryScreen";
import WalletScreen from "./screens/WalletScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import { FundScreen, SendScreen, WithdrawScreen } from "./screens/TransactionScreens";
import Modal from "./modals/Modals";

import type { AppPhase, Screen, ModalType } from "./lib/data";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("splash");
  const [dark, setDark] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const SCREEN_PATHS: Record<Screen, string> = {
    dashboard: "/dashboard",
    fund: "/fund",
    send: "/send",
    withdraw: "/withdraw",
    history: "/history",
    wallet: "/wallet",
    profile: "/profile",
    admin: "/admin",
  };

  const goTo = (screen: Screen) => {
    navigate(SCREEN_PATHS[screen]);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const screenProps = { dark, setScreen: goTo, setModal };

  const activeTab = (() => {
    switch (location.pathname) {
      case "/history": return "history";
      case "/wallet": return "wallet";
      case "/profile": return "profile";
      default: return "dashboard";
    }
  })();

  // ── Splash ──────────────────────────────────────────────────────────────
  if (phase === "splash") {
    return (
      <div className={`min-h-screen ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
        <SplashScreen onDone={() => setPhase("auth")} />
      </div>
    );
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  if (phase === "auth") {
    return (
      <div className={`min-h-screen ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
        <AuthScreen dark={dark} onLogin={() => { goTo("dashboard"); setPhase("main"); }} />
        {modal && <Modal type={modal} dark={dark} onClose={() => setModal(null)} />}
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col ${dark ? "bg-slate-950" : "bg-slate-50"}`}>

      {/* Top navigation bar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md
        ${dark
          ? "bg-slate-950/90 border-white/10"
          : "bg-white/90 border-slate-200"}`}>
        <div className="flex items-center justify-between h-16 max-w-6xl px-4 mx-auto sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 shadow-sm rounded-xl bg-emerald-500 shadow-emerald-500/30">
              <Wallet size={17} className="text-slate-950" />
            </div>
            <span className={`text-base font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
              MVP Wallet
            </span>
          </div>

          {/* Dark/light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors
              ${dark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"}`}
          >
            {dark
              ? <Sun size={14} className="text-amber-400" />
              : <Moon size={14} className="text-violet-500" />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* Scrollable page content */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-x-hidden overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="w-full max-w-6xl min-h-full mx-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardScreen {...screenProps} />} />
            <Route path="/fund" element={<FundScreen {...screenProps} />} />
            <Route path="/send" element={<SendScreen {...screenProps} />} />
            <Route path="/withdraw" element={<WithdrawScreen {...screenProps} />} />
            <Route path="/history" element={<HistoryScreen dark={dark} />} />
            <Route path="/wallet" element={<WalletScreen dark={dark} setScreen={goTo} />} />
            <Route path="/profile" element={<ProfileScreen dark={dark} onLogout={() => { setPhase("auth"); navigate("/auth"); }} />} />
            <Route path="/admin" element={<AdminScreen dark={dark} setScreen={goTo} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Sticky bottom nav */}
      <BottomNav screen={activeTab} setScreen={goTo} dark={dark} />

      {/* Modals */}
      {modal && <Modal type={modal} dark={dark} onClose={() => setModal(null)} />}
    </div>
  );
}
