// screens/SplashScreen.tsx
import { useEffect } from "react";
import { Wallet } from "lucide-react";

interface Props { onDone: () => void }

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-950">
      <style>{`
        @keyframes pulse-logo { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes fill-bar   { from{width:0%} to{width:100%} }
        @keyframes fade-up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .logo-pulse { animation: pulse-logo 1.8s ease infinite }
        .bar-fill   { animation: fill-bar 2s cubic-bezier(.4,0,.2,1) forwards }
        .fade-up    { animation: fade-up .5s ease both }
        .delay-1    { animation-delay:.1s }
        .delay-2    { animation-delay:.2s }
        .delay-3    { animation-delay:.35s }
      `}</style>

      <div className="logo-pulse w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
        <Wallet size={40} className="text-slate-950" />
      </div>

      <h1 className="fade-up text-4xl font-extrabold text-white tracking-tight mb-1">
        MVP Wallet
      </h1>
      <p className="fade-up delay-1 text-slate-400 text-sm mb-12">
        Smart money for everyone
      </p>

      <div className="fade-up delay-2 w-44 h-1 rounded-full bg-slate-800 overflow-hidden">
        <div className="bar-fill h-full rounded-full bg-emerald-500" />
      </div>
      <p className="fade-up delay-3 text-slate-600 text-xs mt-3 tracking-widest">
        LOADING…
      </p>
    </div>
  );
}
