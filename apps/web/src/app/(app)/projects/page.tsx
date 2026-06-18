"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, CheckCircle, FileText } from "lucide-react";
import { listProjects, type ProjectNode } from "@/lib/api";
import { PageError } from "@/components/page-error";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listProjects()
      .then((data) => setProjects(data || []))
      .catch((err) => setError(err.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add your projects for AI analysis, resume writing, and interview prep.
          </p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition">
          <Plus size={16} /> Add Project
        </Link>
      </div>

      <PageError error={error} onDismiss={() => setError("")} />

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No projects yet. Add a project to get AI-powered analysis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  {p.ai_summary && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{p.ai_summary}</div>}
                </div>
                {p.status === "analyzed" ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle size={12} /> Analyzed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    <FileText size={12} /> Draft
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
