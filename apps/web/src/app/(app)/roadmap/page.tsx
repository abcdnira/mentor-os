"use client";

import { useEffect, useState } from "react";
import {
  Map,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  Circle,
  AlertCircle,
} from "lucide-react";
import {
  listRoadmap,
  generateRoadmap,
  updateRoadmapStatus,
  type RoadmapItem,
} from "@/lib/api";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  in_progress: { icon: Clock, color: "text-brand-600", bg: "bg-brand-50" },
  pending: { icon: Circle, color: "text-gray-400", bg: "bg-gray-50" },
};

const PRIORITY_LABELS = ["", "Critical", "High", "Medium", "Low", "Optional"];

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [confirmRegen, setConfirmRegen] = useState(false);

  useEffect(() => {
    listRoadmap()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    // If roadmap exists and has manual status changes, confirm before regenerating
    if (items.length > 0 && !confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    setConfirmRegen(false);
    if (generating) return;
    setGenerating(true);
    setError("");
    try {
      const result = await generateRoadmap();
      setItems(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const next =
      status === "pending"
        ? "in_progress"
        : status === "in_progress"
          ? "completed"
          : "pending";
    try {
      await updateRoadmapStatus(id, next);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: next } : item
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roadmap</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your career growth path
          </p>
        </div>
        <div className="flex items-center gap-2">
          {confirmRegen && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              This will reset your progress.{" "}
              <button
                onClick={handleGenerate}
                className="font-medium underline"
              >
                Confirm
              </button>{" "}
              /{" "}
              <button
                onClick={() => setConfirmRegen(false)}
                className="font-medium underline"
              >
                Cancel
              </button>
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw size={14} />{" "}
                {items.length > 0 ? "Regenerate" : "Generate Roadmap"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Map size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            No roadmap yet. Click &quot;Generate Roadmap&quot; to create one
            based on your goals.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-1">
            {items.map((item) => {
              const cfg =
                STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="relative flex gap-4 pl-2">
                  <button
                    onClick={() =>
                      handleStatusChange(item.id, item.status)
                    }
                    className={cn(
                      "relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition hover:scale-110",
                      cfg.bg
                    )}
                    title={`Click to change status (${item.status})`}
                  >
                    <Icon size={14} className={cfg.color} />
                  </button>

                  <div className="flex-1 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.title}
                      </span>
                      {item.priority > 0 && item.priority <= 5 && (
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            item.priority <= 2
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                      )}
                    </div>
                    {item.reason && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.reason}
                      </p>
                    )}
                    {item.next_action && (
                      <p className="text-xs text-brand-600 mt-1">
                        Next: {item.next_action}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
