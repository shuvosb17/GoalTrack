"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { useAllTopics, useAllModules, useAllSubtopics, useTracks } from "@/hooks/use-data";
import { getUrgencyAlerts } from "@/lib/status";
import { useEffect, useMemo } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracks", label: "Tracks", icon: BookOpen },
  { href: "/milestones", label: "Milestones", icon: Flag },
  { href: "/status", label: "Status", icon: Activity, badge: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/review", label: "Annual Review", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border/50 glass transition-transform duration-200 ease-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 p-4 lg:p-6">
          <Link href="/" className="flex items-center min-w-0">
            <Logo size="md" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={cn("relative z-10 h-4 w-4", isActive && "text-primary")} />
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {"badge" in item && item.badge && urgentCount > 0 && (
                    <span className="relative z-10 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                      {urgentCount}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-4">
          <div className="glass-card rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Your Year of Growth</p>
            <p className="mt-1 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-sm font-semibold text-transparent">
              Learn. Track. Master.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
