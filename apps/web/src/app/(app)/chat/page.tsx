"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare } from "lucide-react";
import { listSessions, createSession, type Conversation } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function ChatListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  async function handleNew() {
    const session = await createSession();
    router.push(`/chat/${session.id}`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mentor Chat</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            No conversations yet. Start a new chat!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/chat/${s.id}`)}
              className={cn(
                "w-full text-left p-3 rounded-lg hover:bg-gray-50 transition",
                "flex items-center gap-3"
              )}
            >
              <MessageSquare size={16} className="text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {s.title}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(s.updated_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
