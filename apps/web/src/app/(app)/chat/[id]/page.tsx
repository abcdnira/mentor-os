"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { MarkdownMessage } from "@/components/markdown-message";
import { MessageActions, getActionChips } from "@/components/message-actions";
import { ModeSelector, type ResponseMode } from "@/components/mode-selector";
import {
  getSession,
  sendMessage,
  generateReflection,
  type Message,
  type ReflectionResult,
} from "@/lib/api";
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
  const [reflecting, setReflecting] = useState(false);
  const [reflectionResult, setReflectionResult] =
    useState<ReflectionResult | null>(null);
  const [mode, setMode] = useState<ResponseMode>("standard");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false); // ref guard prevents stale closure issues

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
  }, [messages, reflectionResult]);

  async function doSend(text: string) {
    if (!text.trim() || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError("");

    const tempId = "temp-" + Date.now();
    const tempUserMsg: Message = {
      id: tempId,
      conversation_id: sessionId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await sendMessage(sessionId, text, mode);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        result.user_message,
        result.ai_message,
      ]);
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || "Failed to send message");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    doSend(text);
  }

  function handleChipAction(prompt: string) {
    doSend(prompt);
  }

  async function handleReflection() {
    if (reflecting || messages.length === 0) return;
    setReflecting(true);
    setReflectionResult(null);
    setError("");

    try {
      const result = await generateReflection(sessionId);
      setReflectionResult(result);
    } catch (err: any) {
      setError("Reflection failed: " + err.message);
    } finally {
      setReflecting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading conversation...</div>
      </div>
    );
  }

  const actionChips = getActionChips();
  let lastAssistantIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantIdx = i;
      break;
    }
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
        <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
          {title}
        </h3>
        <ModeSelector value={mode} onChange={setMode} />
        <button
          onClick={handleReflection}
          disabled={reflecting || messages.length === 0}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ml-1",
            reflecting
              ? "bg-amber-50 text-amber-600"
              : "bg-brand-50 text-brand-600 hover:bg-brand-100"
          )}
        >
          {reflecting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Reflecting...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Reflect
            </>
          )}
        </button>
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
        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            <div key={msg.id} className="max-w-[75%] ml-auto">
              <div className="text-xs text-gray-400 mb-1 text-right">You</div>
              <div className="px-4 py-3 rounded-xl text-sm leading-relaxed bg-brand-600 text-white whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="max-w-[85%] mr-auto">
              <div className="text-xs text-gray-400 mb-1">Mentor</div>
              <div className="px-5 py-4 rounded-xl bg-white border border-gray-100">
                <MarkdownMessage content={msg.content} />
                {idx === lastAssistantIdx && !sending && (
                  <MessageActions
                    chips={actionChips}
                    onAction={handleChipAction}
                    disabled={sending}
                  />
                )}
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="max-w-[85%] mr-auto">
            <div className="text-xs text-gray-400 mb-1">Mentor</div>
            <div className="px-5 py-4 rounded-xl bg-white border border-gray-100">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="max-w-[85%] mx-auto flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
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

        {/* Reflection Result */}
        {reflectionResult && (
          <div className="max-w-[90%] mx-auto my-6 p-5 bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-brand-700 font-medium text-sm">
              <CheckCircle size={16} />
              Reflection Complete
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">
                Summary
              </div>
              <p className="text-sm text-gray-800">
                {reflectionResult.reflection.summary}
              </p>
            </div>
            {reflectionResult.knowledge_nodes.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Knowledge Cards Generated
                </div>
                <div className="space-y-2">
                  {reflectionResult.knowledge_nodes.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {k.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {k.summary}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded">
                        {k.mastery_score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reflectionResult.capability_nodes.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Capability Updates
                </div>
                <div className="space-y-2">
                  {reflectionResult.capability_nodes.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.category}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        {c.score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Link
                href="/knowledge"
                className="text-xs text-brand-600 hover:underline"
              >
                Knowledge Cards
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/capabilities"
                className="text-xs text-brand-600 hover:underline"
              >
                Capabilities
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/dashboard"
                className="text-xs text-brand-600 hover:underline"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="p-4">
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
    </div>
  );
}
