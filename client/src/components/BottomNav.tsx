// components/BottomNav.tsx
import { Home, Clock, Wallet, User } from "lucide-react";
import type { Screen } from "../lib/data";

interface Props {
  screen: Screen;
  setScreen: (s: Screen) => void;
  dark: boolean;
}

const TABS = [
  { id: "dashboard" as Screen, Icon: Home,   label: "Home"    },
  { id: "history"   as Screen, Icon: Clock,  label: "History" },
  { id: "wallet"    as Screen, Icon: Wallet, label: "Wallet"  },
  { id: "profile"   as Screen, Icon: User,   label: "Profile" },
];

export default function BottomNav({ screen, setScreen, dark }: Props) {
  return (
    <nav className={`flex justify-around items-center px-2 pt-2 pb-6 border-t
      ${dark ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-slate-200"}
      backdrop-blur-md`}>
      {TABS.map(({ id, Icon, label }) => {
        const active = screen === id;
        return (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
              ${active
                ? "text-emerald-500"
                : dark ? "text-slate-500" : "text-slate-400"
              }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
          </button>
        );
      })}
    </nav>
  );
}
