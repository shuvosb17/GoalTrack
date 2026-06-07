"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { cn, formatHoursShort } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapDay {
  date: string;
  duration: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [view, setView] = useState<"week" | "month" | "year">("year");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = view === "week" ? data.slice(-7) : view === "month" ? data.slice(-30) : data;

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < filtered.length; i += 7) {
    weeks.push(filtered.slice(i, i + 7));
  }

  const scrollToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);

  useEffect(() => {
    scrollToLatest();
    const id = requestAnimationFrame(scrollToLatest);
    const t = setTimeout(scrollToLatest, 200);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
    };
  }, [view, filtered.length, scrollToLatest]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Learning Activity</h3>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList className="h-8">
            <TabsTrigger value="week" className="text-xs px-2 h-6">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-2 h-6">Month</TabsTrigger>
            <TabsTrigger value="year" className="text-xs px-2 h-6">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TooltipProvider>
        <div ref={scrollRef} className="flex gap-1 overflow-x-auto pb-2 scroll-smooth">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (wi * 7 + di) * 0.005 }}
                      className={cn(
                        "w-3 h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all",
                        `heatmap-${day.level}`
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{format(parseISO(day.date), "MMM d, yyyy")}</p>
                    <p>{day.duration > 0 ? formatHoursShort(day.duration) : "No activity"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={cn("w-3 h-3 rounded-sm", `heatmap-${l}`)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
