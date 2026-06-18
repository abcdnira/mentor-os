"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { getSession, sendMessage, type Message } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("Chat");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSession(sessionId)
      .then((conv) => {
        setTitle(conv.title);
        setMessages(conv.messages || []);
      })
      .catch(() => router.replace("/chat"))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    // Optimistic: show user message immediately
    const tempUserMsg: Message = {
      id: "temp-" + Date.now(),
      conversation_id: sessionId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await sendMessage(sessionId, text);
      // Replace temp message with real ones
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        result.user_message,
        result.ai_message,
      ]);
    } catch (err: any) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      alert("Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <Link
          href="/chat"
          className="p-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">
              Send a message to start chatting with your mentor.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[75%]",
              msg.role === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            <div className="text-xs text-gray-400 mb-1">
              {msg.role === "user" ? "You" : "Mentor"}
            </div>
            <div
              className={cn(
                "px-4 py-3 rounded-xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-100 text-gray-800"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="max-w-[75%] mr-auto">
            <div className="text-xs text-gray-400 mb-1">Mentor</div>
            <div className="px-4 py-3 rounded-xl bg-white border border-gray-100">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-100 bg-white"
      >
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor anything..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="p-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
