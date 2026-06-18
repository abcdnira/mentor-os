"use client";

import { BookOpen } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Knowledge</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Your knowledge cards will appear here after reflections.
      </p>
      <div className="text-center py-16">
        <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">No knowledge cards yet.</p>
      </div>
    </div>
  );
}
