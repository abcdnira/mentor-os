"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  BarChart3,
  GraduationCap,
  Briefcase,
  Map,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { getMe, logout, type User } from "@/lib/api";
import { cn } from "@/lib/cn";
import { ErrorBoundary } from "@/components/error-boundary";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Mentor Chat", icon: MessageSquare },
  { href: "/interview", label: "Interview", icon: GraduationCap },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/capabilities", label: "Capabilities", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try { await logout(); } catch {}
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Mentor OS</h1>
          <p className="text-xs text-gray-400 mt-0.5">{user?.name}</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition",
                  active
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <ErrorBoundary
          fallback={
            <div className="p-8 max-w-lg mx-auto mt-20 text-center">
              <div className="text-4xl mb-4">Something went wrong</div>
              <p className="text-sm text-gray-500 mb-4">
                This page encountered an error. Try refreshing or going back.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
              >
                Go to Dashboard
              </a>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
