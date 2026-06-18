"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  BookOpen,
  BarChart3,
  Sparkles,
  ChevronRight,
  Target,
  AlertTriangle,
} from "lucide-react";
import { getDashboard, type DashboardData } from "@/lib/api";
import { PageError } from "@/components/page-error";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-sm text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const caps = data?.capabilities || [];
  const knowledge = data?.recent_knowledge || [];
  const reflections = data?.recent_reflections || [];
  const actions = data?.next_actions || [];
  const tasks = data?.today_tasks || [];
  const weakAreas = data?.weak_areas || [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Your growth overview</p>
      </div>

      <PageError error={error} onDismiss={() => setError("")} />

      {/* Quick action */}
      <Link
        href="/chat"
        className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition group"
      >
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">Start a Mentor Chat</div>
          <div className="text-xs text-gray-500">Ask questions, learn, and grow with your AI mentor</div>
        </div>
        <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition" />
      </Link>

      <div className="grid grid-cols-2 gap-4">
        {/* Capabilities */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-gray-400" /> Capabilities
            </h3>
            {caps.length > 0 && (
              <Link href="/capabilities" className="text-xs text-brand-600 hover:underline">View all</Link>
            )}
          </div>
          {caps.length > 0 ? (
            <div className="space-y-2">
              {caps.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 truncate flex-1">{c.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.score}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-7 text-right">{c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Complete a reflection to see your capability profile.</p>
          )}
        </div>

        {/* Knowledge Cards */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
              <BookOpen size={14} className="text-gray-400" /> Knowledge Cards
            </h3>
            {knowledge.length > 0 && (
              <Link href="/knowledge" className="text-xs text-brand-600 hover:underline">View all</Link>
            )}
          </div>
          {knowledge.length > 0 ? (
            <div className="space-y-2">
              {knowledge.map((k) => (
                <Link key={k.id} href={`/knowledge/${k.id}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 transition">
                  <span className="text-xs text-gray-700 truncate flex-1">{k.title}</span>
                  <span className="text-xs text-brand-600 font-medium ml-2">{k.mastery_score}/100</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Your knowledge cards will appear here after reflections.</p>
          )}
        </div>

        {/* Recent Reflections */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mb-3">
            <Sparkles size={14} className="text-gray-400" /> Recent Reflections
          </h3>
          {reflections.length > 0 ? (
            <div className="space-y-2">
              {reflections.map((r) => (
                <div key={r.id} className="text-xs text-gray-600 leading-relaxed">
                  <div className="text-gray-400 mb-0.5">{new Date(r.created_at).toLocaleDateString()}</div>
                  <div className="line-clamp-2">{r.summary}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No reflections yet. Chat with your mentor first.</p>
          )}
        </div>

        {/* Next Actions */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mb-3">
            <ChevronRight size={14} className="text-gray-400" /> Next Actions
          </h3>
          {actions.length > 0 ? (
            <ul className="space-y-1.5">
              {actions.map((action, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-brand-500 font-bold shrink-0">{i + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Your action items will be generated from reflections.</p>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mb-3">
            <Target size={14} className="text-gray-400" /> Today&apos;s Focus
          </h3>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    {task.source}
                  </span>
                  <span className="text-xs text-gray-700">{task.action || task.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Set roadmap items to &quot;in progress&quot; to see tasks.</p>
          )}
        </div>

        {/* Weak Areas */}
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mb-3">
            <AlertTriangle size={14} className="text-amber-500" /> Weak Areas
          </h3>
          {weakAreas.length > 0 ? (
            <div className="space-y-2">
              {weakAreas.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 truncate flex-1">{c.name}</span>
                  <span className="text-xs font-medium text-amber-600 ml-2">{c.score}/100</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Complete reflections to identify weak areas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
