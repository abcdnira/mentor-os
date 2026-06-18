"use client";

import { AlertCircle } from "lucide-react";

export function PageError({
  error,
  onDismiss,
}: {
  error: string;
  onDismiss: () => void;
}) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
      <AlertCircle size={14} className="text-red-500 shrink-0" />
      <span className="text-xs text-red-600 flex-1">{error}</span>
      <button
        onClick={onDismiss}
        className="text-xs text-red-400 hover:text-red-600 shrink-0"
      >
        Dismiss
      </button>
    </div>
  );
}
