"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getKnowledge, type KnowledgeNode } from "@/lib/api";

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [node, setNode] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKnowledge(params.id as string)
      .then(setNode)
      .catch(() => router.replace("/knowledge"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!node) return null;

  const card = node.card;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/knowledge"
          className="p-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">{node.title}</h2>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded">
          {node.mastery_score}/100
        </span>
      </div>

      {node.category && (
        <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {node.category}
        </span>
      )}

      {/* One Sentence */}
      {card?.one_sentence && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 mb-1">
            One Sentence
          </div>
          <p className="text-sm text-gray-800">{card.one_sentence}</p>
        </div>
      )}

      {/* Core Principle */}
      {card?.core_principle && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 mb-1">
            Core Principle
          </div>
          <p className="text-sm text-gray-800">{card.core_principle}</p>
        </div>
      )}

      {/* Interview Answer */}
      {card?.interview_answer && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
          <div className="text-xs font-medium text-brand-700 mb-1">
            Interview Answer
          </div>
          <p className="text-sm text-gray-800">{card.interview_answer}</p>
        </div>
      )}

      {/* Common Follow-ups */}
      {card?.common_followups && card.common_followups.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 mb-2">
            Common Follow-up Questions
          </div>
          <ul className="space-y-1.5">
            {card.common_followups.map((q, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-gray-400 shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
