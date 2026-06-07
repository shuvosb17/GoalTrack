"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  NotebookPen,
  Trophy,
  FileText,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useAppStore } from "@/stores/app-store";
import { useAllTopics, useAllModules, useAllSubtopics, useTracks } from "@/hooks/use-data";
import { getUrgencyAlerts } from "@/lib/status";
import { useMemo } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracks", label: "Tracks", icon: BookOpen },
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
  const tracks = useTracks();
  const topics = useAllTopics();
  const modules = useAllModules();
  const subtopics = useAllSubtopics();
  const urgentCount = useMemo(
    () => getUrgencyAlerts(topics, subtopics, modules, tracks).filter((a) => a.level !== "info").length,
    [topics, subtopics, modules, tracks]
  );

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 glass flex flex-col">
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary")} />
                <span className="relative z-10 flex-1">{item.label}</span>
                {"badge" in item && item.badge && urgentCount > 0 && (
                  <span className="relative z-10 text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                    {urgentCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Your Year of Growth</p>
          <p className="text-sm font-semibold mt-1 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Learn. Track. Master.
          </p>
        </div>
      </div>
    </aside>
  );
}
