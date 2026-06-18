"use client";

import { useEffect, useState } from "react";
import { getMe, type User } from "@/lib/api";
import { PageError } from "@/components/page-error";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch((err) => setError(err.message || "Failed to load settings"));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <PageError error={error} onDismiss={() => setError("")} />

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Account</h3>
        {user ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-900">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Loading user info...</p>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">AI Provider</h3>
        <p className="text-xs text-gray-400">
          AI provider is configured on the server side. Contact your admin to change settings.
        </p>
      </div>
    </div>
  );
}
