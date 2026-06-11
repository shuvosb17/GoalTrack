"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Flag,
  BarChart3,
  NotebookPen,
  Trophy,
  FileText,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { DayCountdown } from "./day-countdown";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { useAllTopics, useAllModules, useAllSubtopics, useTracks } from "@/hooks/use-data";
import { getUrgencyAlerts } from "@/lib/status";
import { useEffect, useMemo } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: boolean;
  accent: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "from-violet-500 to-indigo-500" },
      { href: "/tracks", label: "Tracks", icon: BookOpen, accent: "from-blue-500 to-cyan-500" },
      { href: "/milestones", label: "Milestones", icon: Flag, accent: "from-fuchsia-500 to-pink-500" },
      { href: "/status", label: "Status", icon: Activity, badge: true, accent: "from-emerald-500 to-teal-500" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "from-amber-500 to-orange-500" },
      { href: "/journal", label: "Journal", icon: NotebookPen, accent: "from-sky-500 to-blue-500" },
      { href: "/achievements", label: "Achievements", icon: Trophy, accent: "from-yellow-500 to-amber-500" },
      { href: "/review", label: "Annual Review", icon: FileText, accent: "from-rose-500 to-red-500" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings, accent: "from-zinc-400 to-zinc-600" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const tracks = useTracks();
  const topics = useAllTopics();
  const modules = useAllModules();
  const subtopics = useAllSubtopics();
  const urgentCount = useMemo(
    () => getUrgencyAlerts(topics, subtopics, modules, tracks).filter((a) => a.level !== "info").length,
    [topics, subtopics, modules, tracks]
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[17.5rem] flex-col overflow-hidden border-r border-white/[0.06] transition-transform duration-300 ease-out",
          "bg-[#0a0a0c]",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative border-b border-white/[0.06] px-5 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex min-w-0 items-center group">
              <Logo size="md" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg lg:hidden hover:bg-white/5"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="sidebar-scroll relative flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <div
                        className={cn(
                          "group/item relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />
                        )}
                        {isActive && (
                          <div
                            className={cn(
                              "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b",
                              item.accent
                            )}
                          />
                        )}

                        <div
                          className={cn(
                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                            isActive
                              ? cn("bg-gradient-to-br shadow-lg", item.accent, "shadow-black/30")
                              : "bg-white/[0.04] group-hover/item:bg-white/[0.07]"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-white" : "text-muted-foreground group-hover/item:text-foreground"
                            )}
                          />
                        </div>

                        <span className="relative z-10 flex-1">{item.label}</span>

                        {item.badge && urgentCount > 0 && (
                          <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                            {urgentCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative border-t border-white/[0.06] p-3">
          <div className="gradient-border relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/5 to-blue-600/10" />
            <div className="relative px-3 py-2.5">
              <DayCountdown />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
