"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Clock, CalendarDays, CheckCircle2,
  Loader2, Sparkles, Circle, Bell, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerControls } from "@/components/timer/timer-controls";
import {
  useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import {
  getStatusTimeline, getGlobalStatusCounts, getUrgencyAlerts,
  getTodaySnapshot, ALL_STATUSES, formatDeadline,
} from "@/lib/status";
import { cn, STATUS_LABELS, STATUS_COLORS, STATUS_BG } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateTopicStatus } from "@/lib/crud";

const STATUS_ICONS: Record<ProgressStatus, typeof Circle> = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
  mastered: Sparkles,
};

type Filter = ProgressStatus | "all";

export default function StatusPage() {
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [trackFilter, setTrackFilter] = useState("all");

  const globalCounts = useMemo(() => getGlobalStatusCounts(topics), [topics]);
  const alerts = useMemo(
    () => getUrgencyAlerts(topics, subtopics, modules, tracks),
    [topics, subtopics, modules, tracks]
  );

  const timeline = useMemo(() => {
    let days = getStatusTimeline(topics, subtopics, modules, tracks, statusFilter);
    if (trackFilter !== "all") {
      days = days
        .map((day) => ({
          ...day,
          topics: day.topics.filter((t) => t.trackId === trackFilter),
          counts: (() => {
            const c = { not_started: 0, in_progress: 0, completed: 0, mastered: 0 };
            day.topics.filter((t) => t.trackId === trackFilter).forEach((e) => c[e.topic.status]++);
            return c;
          })(),
        }))
        .filter((day) => day.topics.length > 0);
    }
    return days;
  }, [topics, subtopics, modules, tracks, statusFilter, trackFilter]);

  const todaySnap = useMemo(
    () => getTodaySnapshot(getStatusTimeline(topics, subtopics, modules, tracks, "all")),
    [topics, subtopics, modules, tracks]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" /> Status
          </h1>
          <p className="text-muted-foreground mt-1">
            Your learning status organized by date — track every milestone
          </p>
        </div>
        <Link href="/tracks"><Button variant="outline">Update in Tracks</Button></Link>
      </div>

      {/* Urgency Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell className="h-4 w-4 text-amber-400" /> Urgency Alerts
              <Badge variant="destructive" className="text-[10px]">{alerts.filter((a) => a.level === "critical").length} critical</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {alerts.slice(0, 6).map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-sm",
                    alert.level === "critical" && "bg-red-500/10 border-red-500/30 text-red-300",
                    alert.level === "warning" && "bg-amber-500/10 border-amber-500/30 text-amber-300",
                    alert.level === "info" && "bg-blue-500/10 border-blue-500/30 text-blue-300"
                  )}
                >
                  <AlertTriangle className={cn(
                    "h-4 w-4 shrink-0",
                    alert.level === "critical" && "text-red-400",
                    alert.level === "warning" && "text-amber-400",
                    alert.level === "info" && "text-blue-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{alert.topicName}</p>
                    <p className="text-xs opacity-80">{alert.trackName} · {alert.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global status overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ALL_STATUSES.map((status) => {
          const Icon = STATUS_ICONS[status];
          const count = globalCounts[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              className={cn(
                "glass-card rounded-xl p-4 text-left transition-all hover:scale-[1.02] border",
                statusFilter === status ? "ring-2 ring-primary/50" : "border-transparent",
                STATUS_BG[status]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" style={{ color: STATUS_COLORS[status] }} />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-xs font-medium">{STATUS_LABELS[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Today highlight */}
      {todaySnap && (
        <Card className="gradient-border border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Today&apos;s Activity</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.filter((s) => todaySnap.counts[s] > 0).map((status) => (
                <Badge key={status} className={cn("border", STATUS_BG[status])}>
                  {todaySnap.counts[status]} {STATUS_LABELS[status]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All Statuses</TabsTrigger>
            {ALL_STATUSES.filter((s) => s !== "not_started").map((s) => (
              <TabsTrigger key={s} value={s}>{STATUS_LABELS[s]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="All Tracks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Date timeline */}
      {timeline.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No status activity yet</h3>
            <p className="text-sm text-muted-foreground mt-2">Update topic statuses in Tracks to build your timeline.</p>
            <Link href="/tracks"><Button className="mt-6">Go to Tracks</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-8 pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />

          {timeline.map((day, di) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.06 }}
              className="relative"
            >
              {/* Date node */}
              <div className="absolute -left-5 top-6 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/30" />

              <div className="glass-card rounded-2xl overflow-hidden">
                {/* Date header */}
                <div className="p-5 border-b border-border/50 bg-secondary/20">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{day.label}</h3>
                      <p className="text-xs text-muted-foreground">{day.date}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ALL_STATUSES.map((status) =>
                        day.counts[status] > 0 ? (
                          <div
                            key={status}
                            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium", STATUS_BG[status])}
                          >
                            {(() => { const I = STATUS_ICONS[status]; return <I className="h-3 w-3" />; })()}
                            <span>{day.counts[status]}</span>
                            <span className="opacity-70">{STATUS_LABELS[status]}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>

                {/* Topic cards */}
                <div className="p-4 space-y-3">
                  {day.topics.map((entry, ti) => {
                    const status = entry.topic.status;
                    const StatusIcon = STATUS_ICONS[status];
                    return (
                      <motion.div
                        key={entry.topic.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ti * 0.04 }}
                        className={cn(
                          "rounded-xl border p-4 flex gap-4 items-start",
                          STATUS_BG[status],
                          entry.isOverdue && "ring-1 ring-red-500/40"
                        )}
                        style={{ borderLeftWidth: 3, borderLeftColor: STATUS_COLORS[status] }}
                      >
                        <span className="text-xl shrink-0">{entry.trackIcon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{entry.topic.name}</h4>
                            <Badge className={cn("border gap-1 text-[10px]", STATUS_BG[status])}>
                              <StatusIcon className="h-3 w-3" />
                              {STATUS_LABELS[status]}
                            </Badge>
                            {entry.isOverdue && (
                              <Badge variant="destructive" className="text-[10px] gap-1">
                                <AlertTriangle className="h-3 w-3" /> Overdue
                              </Badge>
                            )}
                            {entry.isDueSoon && !entry.isOverdue && status === "in_progress" && (
                              <Badge variant="warning" className="text-[10px]">Due Soon</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {entry.trackName} → {entry.moduleName}
                          </p>
                          <Progress value={entry.progress} className="h-1 mt-2 mb-2" />
                          <div className="flex items-center gap-3 flex-wrap">
                            {status === "in_progress" && (
                              <span className={cn(
                                "text-xs flex items-center gap-1",
                                entry.isOverdue ? "text-red-400" : "text-muted-foreground"
                              )}>
                                <Clock className="h-3 w-3" />
                                {formatDeadline(entry.daysRemaining, entry.dueDate)}
                              </span>
                            )}
                            <TimerControls
                              path={{ trackId: entry.trackId, moduleId: entry.moduleId, topicId: entry.topic.id }}
                              label={`${entry.moduleName} → ${entry.topic.name}`}
                              compact
                            />
                            <Select
                              value={status}
                              onValueChange={(v) => updateTopicStatus(entry.topic.id, v as ProgressStatus)}
                            >
                              <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {ALL_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold" style={{ color: entry.trackColor }}>{entry.progress}%</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
