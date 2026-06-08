"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, AlertTriangle, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Track, Module, Topic, Subtopic } from "@/lib/types";
import {
  getStatusTimeline, getUrgencyAlerts, getTodaySnapshot, getGlobalStatusCounts,
} from "@/lib/status";
import { STATUS_LABELS, STATUS_BG, STATUS_COLORS } from "@/lib/utils";

interface StatusPanelProps {
  topics: Topic[];
  subtopics: Subtopic[];
  modules: Module[];
  tracks: Track[];
}

export function StatusPanel({ topics, subtopics, modules, tracks }: StatusPanelProps) {
  const timeline = getStatusTimeline(topics, subtopics, modules, tracks);
  const today = getTodaySnapshot(timeline);
  const alerts = getUrgencyAlerts(topics, subtopics, modules, tracks);
  const counts = getGlobalStatusCounts(topics);
  const criticalAlerts = alerts.filter((a) => a.level === "critical").length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="gap-1 text-[10px]">
                <AlertTriangle className="h-3 w-3" /> {criticalAlerts} urgent
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Daily learning status overview</p>
        </div>
        <Link href="/status">
          <Button variant="outline" size="sm" className="gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini status counts */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["in_progress", "completed", "mastered", "not_started"] as const).map((status) => (
            <div key={status} className={`rounded-lg p-2 text-center border ${STATUS_BG[status]}`}>
              <p className="text-lg font-bold" style={{ color: STATUS_COLORS[status] }}>{counts[status]}</p>
              <p className="text-[9px] opacity-70">{STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>

        {/* Today */}
        {today ? (
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["in_progress", "completed", "mastered"] as const).map((s) =>
                today.counts[s] > 0 ? (
                  <Badge key={s} className={`text-[10px] border ${STATUS_BG[s]}`}>
                    {today.counts[s]} {STATUS_LABELS[s]}
                  </Badge>
                ) : null
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No status updates today yet.</p>
        )}

        {/* Top urgency */}
        {alerts.slice(0, 2).map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`text-xs p-2 rounded-lg border flex items-center gap-2 ${
              alert.level === "critical" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate"><strong>{alert.topicName}</strong> — {alert.message}</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
