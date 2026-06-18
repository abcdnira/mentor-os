"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { listCapabilities, type CapabilityNode } from "@/lib/api";

export default function CapabilitiesPage() {
  const [caps, setCaps] = useState<CapabilityNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCapabilities()
      .then(setCaps)
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const grouped: Record<string, CapabilityNode[]> = {};
  for (const c of caps) {
    const cat = c.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  }

  const categoryLabels: Record<string, string> = {
    backend: "Backend",
    project: "Project",
    ai_backend: "AI Backend",
    interview: "Interview",
    other: "Other",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Capabilities</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Your capability profile updated from reflections.
      </p>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : caps.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            No capabilities tracked yet. Chat with your mentor and generate a
            reflection.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {categoryLabels[cat] || cat}
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-white border border-gray-100 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {c.name}
                      </span>
                      <span className="text-sm font-bold text-brand-600">
                        {c.score}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    {c.evidence && c.evidence.length > 0 && (
                      <div className="mb-1">
                        <span className="text-xs font-medium text-green-700">
                          Evidence:{" "}
                        </span>
                        <span className="text-xs text-gray-600">
                          {c.evidence.join("; ")}
                        </span>
                      </div>
                    )}
                    {c.weakness && c.weakness.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-amber-700">
                          Needs work:{" "}
                        </span>
                        <span className="text-xs text-gray-600">
                          {c.weakness.join("; ")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
