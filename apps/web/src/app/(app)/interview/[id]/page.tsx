"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MarkdownMessage } from "@/components/markdown-message";
import {
  getSession,
  sendInterviewAnswer,
  evaluateInterview,
  type Message,
  type EvaluationResult,
} from "@/lib/api";
import { cn } from "@/lib/cn";

export default function InterviewSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const topic = searchParams.get("topic") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");
  const sendingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSession(sessionId)
      .then((conv) => setMessages(conv.messages || []))
      .catch(() => router.replace("/interview"))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, evalResult]);

  async function doSend(text: string) {
    if (!text.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError("");

    const tempId = "temp-" + Date.now();
    const tempMsg: Message = {
      id: tempId, conversation_id: sessionId, role: "user",
      content: text, created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const result = await sendInterviewAnswer(sessionId, text, topic);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        result.user_message, result.ai_message,
      ]);
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || "Failed to send");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  async function handleEvaluate() {
    if (evaluating) return;
    setEvaluating(true);
    setError("");
    try {
      const result = await evaluateInterview(sessionId);
      setEvalResult(result);
    } catch (err: any) {
      setError("Evaluation failed: " + err.message);
    } finally {
      setEvaluating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    doSend(text);
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <Link href="/interview" className="p-1.5 rounded-lg hover:bg-gray-50 transition">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <h3 className="text-sm font-medium text-gray-900 flex-1">Mock Interview</h3>
        <button
          onClick={handleEvaluate}
          disabled={evaluating || messages.length < 3}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition",
            evaluating ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-700 hover:bg-green-100"
          )}
        >
          {evaluating ? (
            <><Loader2 size={14} className="animate-spin" /> Evaluating...</>
          ) : (
            <><Trophy size={14} /> Evaluate</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="max-w-[75%] ml-auto">
              <div className="text-xs text-gray-400 mb-1 text-right">You</div>
              <div className="px-4 py-3 rounded-xl text-sm leading-relaxed bg-brand-600 text-white whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="max-w-[85%] mr-auto">
              <div className="text-xs text-gray-400 mb-1">Interviewer</div>
              <div className="px-5 py-4 rounded-xl bg-white border border-gray-100">
                <MarkdownMessage content={msg.content} />
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="max-w-[85%] mr-auto">
            <div className="text-xs text-gray-400 mb-1">Interviewer</div>
            <div className="px-5 py-4 rounded-xl bg-white border border-gray-100">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-[85%] mx-auto flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-600 flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-xs text-red-400 hover:text-red-600">Dismiss</button>
          </div>
        )}

        {evalResult && (
          <div className="max-w-[90%] mx-auto my-6 p-5 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                <Trophy size={16} /> Interview Evaluation
              </div>
              <div className="text-2xl font-bold text-green-700">{evalResult.overall_score}/100</div>
            </div>
            <p className="text-sm text-gray-800">{evalResult.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-green-700 mb-1">Strengths</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {evalResult.strengths?.map((s, i) => <li key={i}>+ {s}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium text-red-600 mb-1">Weaknesses</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {evalResult.weaknesses?.map((w, i) => <li key={i}>- {w}</li>)}
                </ul>
              </div>
            </div>
            {evalResult.next_actions && evalResult.next_actions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Next Actions</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {evalResult.next_actions.map((a, i) => <li key={i}>{i + 1}. {a}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Link href="/knowledge" className="text-xs text-brand-600 hover:underline">Knowledge Cards</Link>
              <span className="text-gray-300">|</span>
              <Link href="/capabilities" className="text-xs text-brand-600 hover:underline">Capabilities</Link>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..." disabled={sending}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <button type="submit" disabled={sending || !input.trim()}
            className="p-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
