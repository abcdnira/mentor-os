"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { getInterviewTopics, startInterview } from "@/lib/api";
import { PageError } from "@/components/page-error";

const TOPIC_ICONS: Record<string, string> = {
  golang: "Go", redis: "Re", mysql: "My", mq: "MQ",
  im: "IM", wallet: "Pay", agent: "AI", system_design: "SD",
};

export default function InterviewPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getInterviewTopics()
      .then((data) => setTopics(data || {}))
      .catch((err) => setError(err.message || "Failed to load topics"))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(topic: string) {
    if (starting) return;
    setStarting(topic);
    setError("");
    try {
      const result = await startInterview(topic);
      router.push(`/interview/${result.conversation.id}?topic=${topic}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview");
    } finally {
      setStarting("");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Mock Interview</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Select a topic to start a simulated technical interview.
      </p>

      <PageError error={error} onDismiss={() => setError("")} />

      {loading ? (
        <div className="text-sm text-gray-400 mt-4">Loading topics...</div>
      ) : Object.keys(topics).length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No interview topics available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {Object.entries(topics).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleStart(key)}
              disabled={!!starting}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-xs font-bold text-brand-600">
                {TOPIC_ICONS[key] || key.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{label}</div>
              </div>
              {starting === key && (
                <Loader2 size={16} className="animate-spin text-brand-500" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <GraduationCap size={16} /> How it works
        </div>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal pl-4">
          <li>Mentor asks you a technical question</li>
          <li>You answer as if in a real interview</li>
          <li>Mentor follows up with deeper questions (3-5 rounds)</li>
          <li>Click &quot;Evaluate&quot; to get your score and gap analysis</li>
          <li>Knowledge cards and capability updates are generated automatically</li>
        </ol>
      </div>
    </div>
  );
}
