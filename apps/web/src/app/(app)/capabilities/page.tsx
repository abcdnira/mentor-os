"use client";

import { BarChart3 } from "lucide-react";

export default function CapabilitiesPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Capabilities</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Your capability profile will be updated after reflections.
      </p>
      <div className="text-center py-16">
        <BarChart3 size={40} className="mx-auto text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">No capabilities tracked yet.</p>
      </div>
    </div>
  );
}
