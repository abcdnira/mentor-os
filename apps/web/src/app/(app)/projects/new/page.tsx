"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProject } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [background, setBackground] = useState("");
  const [techStack, setTechStack] = useState("");
  const [modules, setModules] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [challenges, setChallenges] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const p = await createProject({
        name: name.trim(),
        background,
        tech_stack: techStack.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        modules: modules.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        responsibilities,
        challenges,
      });
      router.push(`/projects/${p.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="p-1.5 rounded-lg hover:bg-gray-50 transition">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Add Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. IM Messaging System" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
          <textarea value={background} onChange={(e) => setBackground(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Brief project background and purpose" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack (comma separated)</label>
          <input value={techStack} onChange={(e) => setTechStack(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Go, Redis, MySQL, Kafka, Docker" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modules (comma separated)</label>
          <input value={modules} onChange={(e) => setModules(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Message Service, Push Service, User Service" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Responsibilities</label>
          <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="What you built, designed, or optimized" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technical Challenges</label>
          <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Difficult problems you solved" />
        </div>

        <button type="submit" disabled={loading || !name.trim()}
          className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50">
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
