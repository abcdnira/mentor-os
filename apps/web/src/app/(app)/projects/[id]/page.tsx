"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, AlertCircle, Upload } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";
import { getProject, analyzeProject, uploadProjectCode, type ProjectNode } from "@/lib/api";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProject(params.id as string)
      .then(setProject)
      .catch(() => router.replace("/projects"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function handleAnalyze() {
    if (analyzing || !project) return;
    setAnalyzing(true);
    setError("");
    try {
      const updated = await analyzeProject(project.id);
      setProject(updated);
    } catch (err: any) {
      setError("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !project || uploading) return;
    setUploading(true);
    setError("");
    try {
      const updated = await uploadProjectCode(project.id, file);
      setProject(updated);
    } catch (err: any) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (!project) return null;

  const analyzed = project.status === "analyzed";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="p-1.5 rounded-lg hover:bg-gray-50 transition">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900 flex-1">{project.name}</h2>
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition cursor-pointer">
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
            : <><Upload size={14} /> Upload Code</>}
          <input type="file" accept=".zip" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {!analyzed && (
          <button onClick={handleAnalyze} disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition">
            {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              : <><Sparkles size={14} /> AI Analyze</>}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-xs text-red-400 hover:text-red-600">Dismiss</button>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
        {project.background && (
          <div><div className="text-xs font-medium text-gray-500 mb-1">Background</div>
            <p className="text-sm text-gray-800">{project.background}</p></div>
        )}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div><div className="text-xs font-medium text-gray-500 mb-1">Tech Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((t, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div></div>
        )}
        {project.responsibilities && (
          <div><div className="text-xs font-medium text-gray-500 mb-1">Responsibilities</div>
            <p className="text-sm text-gray-800">{project.responsibilities}</p></div>
        )}
        {project.challenges && (
          <div><div className="text-xs font-medium text-gray-500 mb-1">Challenges</div>
            <p className="text-sm text-gray-800">{project.challenges}</p></div>
        )}
      </div>

      {/* AI Analysis Results */}
      {analyzed && (
        <>
          {project.ai_summary && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">AI Summary</div>
              <p className="text-sm text-gray-800">{project.ai_summary}</p>
            </div>
          )}

          {project.ai_highlights && project.ai_highlights.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">Technical Highlights</div>
              <ul className="text-sm text-gray-800 space-y-1.5 list-disc pl-4">
                {project.ai_highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}

          {project.ai_resume && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
              <div className="text-xs font-medium text-brand-700 mb-2">Resume Description</div>
              <div className="text-sm text-gray-800"><MarkdownMessage content={project.ai_resume} /></div>
            </div>
          )}

          {project.ai_interview_answer && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">Interview Answer</div>
              <div className="text-sm text-gray-800"><MarkdownMessage content={project.ai_interview_answer} /></div>
            </div>
          )}

          {project.ai_followups && project.ai_followups.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">Possible Follow-up Questions</div>
              <ol className="text-sm text-gray-800 space-y-1.5 list-decimal pl-4">
                {project.ai_followups.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </div>
          )}

          {project.ai_mindmap && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">Architecture MindMap</div>
              <MarkdownMessage content={"```mermaid\n" + project.ai_mindmap + "\n```"} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
