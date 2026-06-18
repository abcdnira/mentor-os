"use client";

import { useState } from "react";
import { FileText, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";
import { generateResume } from "@/lib/api";
import { cn } from "@/lib/cn";

const VERSIONS = [
  { value: "backend", label: "Backend Engineer", desc: "System design, performance, reliability" },
  { value: "ai_backend", label: "AI Backend Engineer", desc: "LLM, RAG, Agent, Tool Calling" },
];

export default function ResumePage() {
  const [version, setVersion] = useState("backend");
  const [markdown, setMarkdown] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError("");
    setMarkdown("");
    try {
      const result = await generateResume(version);
      setMarkdown(result.markdown);
    } catch (err: any) {
      setError(err.message || "Failed to generate resume");
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Resume Generator</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Generate resume content from your projects and capabilities.
      </p>

      {/* Version selector */}
      <div className="flex gap-3 mb-6">
        {VERSIONS.map((v) => (
          <button
            key={v.value}
            onClick={() => setVersion(v.value)}
            className={cn(
              "flex-1 p-4 rounded-xl border text-left transition",
              version === v.value
                ? "border-brand-500 bg-brand-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            <div className="text-sm font-medium text-gray-900">{v.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{v.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50 mb-6"
      >
        {generating ? (
          <><Loader2 size={16} className="animate-spin" /> Generating...</>
        ) : (
          <><FileText size={16} /> Generate Resume</>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-xs text-red-400 hover:text-red-600">Dismiss</button>
        </div>
      )}

      {markdown && (
        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">Generated Resume</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition"
            >
              {copied ? (
                <><Check size={12} className="text-green-500" /> Copied</>
              ) : (
                <><Copy size={12} /> Copy Markdown</>
              )}
            </button>
          </div>
          <div className="p-5">
            <MarkdownMessage content={markdown} />
          </div>
        </div>
      )}

      {!markdown && !generating && (
        <div className="text-center py-12">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            Add projects and complete reflections first for better results.
          </p>
        </div>
      )}
    </div>
  );
}
