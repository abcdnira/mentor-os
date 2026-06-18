"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your growth overview. Start a conversation to build your knowledge.
        </p>
      </div>

      {/* Quick action */}
      <Link
        href="/chat"
        className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition group"
      >
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            Start a Mentor Chat
          </div>
          <div className="text-xs text-gray-500">
            Ask questions, learn, and grow with your AI mentor
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-300 group-hover:text-brand-500 transition"
        />
      </Link>

      {/* Placeholder cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Capabilities
          </h3>
          <p className="text-xs text-gray-400">
            Complete a reflection to see your capability profile.
          </p>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Knowledge Cards
          </h3>
          <p className="text-xs text-gray-400">
            Your knowledge cards will appear here after reflections.
          </p>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Recent Reflections
          </h3>
          <p className="text-xs text-gray-400">
            No reflections yet. Chat with your mentor first.
          </p>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Next Actions
          </h3>
          <p className="text-xs text-gray-400">
            Your action items will be generated from reflections.
          </p>
        </div>
      </div>
    </div>
  );
}
