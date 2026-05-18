// components/BackHeader.tsx
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  dark: boolean;
  right?: ReactNode;
}

export default function BackHeader({ title, subtitle, onBack, dark, right }: Props) {
  return (
    <div className="flex items-center gap-3 px-5 pt-4 pb-4">
      <button
        onClick={onBack}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
          ${dark ? "bg-white/8 hover:bg-white/12 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className={`text-xl font-bold truncate ${dark ? "text-white" : "text-slate-800"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
        )}
      </div>

      {right}
    </div>
  );
}
