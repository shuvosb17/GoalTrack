"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconRoad,
  IconFlag,
  IconActivity,
  IconChartBar,
  IconNotebook,
  IconTrophy,
  IconCalendarStats,
  IconSettings,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";
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
  icon: TablerIcon;
  badge?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: [
      { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
      { href: "/tracks", label: "Tracks", icon: IconRoad },
      { href: "/milestones", label: "Milestones", icon: IconFlag },
      { href: "/status", label: "Status", icon: IconActivity, badge: true },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: IconChartBar },
      { href: "/journal", label: "Journal", icon: IconNotebook },
      { href: "/achievements", label: "Achievements", icon: IconTrophy },
      { href: "/review", label: "Annual Review", icon: IconCalendarStats },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: IconSettings },
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
              <IconX className="h-4 w-4" stroke={1.5} />
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
                          "group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "bg-white/[0.08] text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                          )}
                          stroke={1.5}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && urgentCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/90 px-1.5 text-[10px] font-medium text-white">
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
          <div className="gradient-border relative overflow-hidden">
            <div className="relative px-3 py-2.5">
              <DayCountdown />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
