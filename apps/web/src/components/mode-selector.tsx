"use client";

import { Zap, AlignLeft, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export type ResponseMode = "quick" | "standard" | "deep";

const MODES: { value: ResponseMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "quick", label: "Quick", icon: Zap, desc: "30s read" },
  { value: "standard", label: "Standard", icon: AlignLeft, desc: "2-3 min" },
  { value: "deep", label: "Deep", icon: BookOpen, desc: "Deep dive" },
];

interface ModeSelectorProps {
  value: ResponseMode;
  onChange: (mode: ResponseMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition",
            value === mode.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
          title={mode.desc}
        >
          <mode.icon size={12} />
          {mode.label}
        </button>
      ))}
    </div>
  );
}
