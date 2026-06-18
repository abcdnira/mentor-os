"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { listKnowledge, type KnowledgeNode } from "@/lib/api";
import { PageError } from "@/components/page-error";

export default function KnowledgePage() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listKnowledge()
      .then((data) => setNodes(data || []))
      .catch((err) => setError(err.message || "Failed to load knowledge"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Knowledge</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Your knowledge cards generated from reflections.
      </p>

      <PageError error={error} onDismiss={() => setError("")} />

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            No knowledge cards yet. Chat with your mentor and generate a reflection.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {nodes.map((node) => (
            <Link key={node.id} href={`/knowledge/${node.id}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{node.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{node.summary}</div>
                  {node.category && (
                    <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {node.category}
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded ml-3 shrink-0">
                  {node.mastery_score}/100
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
