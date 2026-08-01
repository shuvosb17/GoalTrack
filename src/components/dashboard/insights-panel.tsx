"use client";

import { motion } from "framer-motion";
import {
  IconBulb,
  IconAlertTriangle,
  IconTrendingUp,
  IconInfoCircle,
  IconChartPie,
  IconClock,
  IconFlame,
} from "@tabler/icons-react";
import { renderInsightMessage } from "@/lib/insight-format";
import type { Insight } from "@/lib/types";
import type { TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const iconById: Record<string, TablerIcon> = {
  "time-distribution": IconChartPie,
  "peak-hours": IconClock,
  "pace-comparison": IconTrendingUp,
  "streak-celebration": IconFlame,
  "yearly-behind": IconAlertTriangle,
};

const iconByType: Record<Insight["type"], TablerIcon> = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  success: IconTrendingUp,
  tip: IconBulb,
};

const badgeByType: Record<Insight["type"], { bg: string; icon: string }> = {
  info: { bg: "rgba(59, 130, 246, 0.15)", icon: "#6fa8dc" },
  tip: { bg: "rgba(139, 92, 246, 0.15)", icon: "#a48ee0" },
  success: { bg: "rgba(34, 197, 94, 0.15)", icon: "#4fb892" },
  warning: { bg: "rgba(234, 179, 8, 0.15)", icon: "#e0a23a" },
};

function splitWarning(message: string): { primary: string; detail: string | null } {
  const stripped = message.replace(/^You(?:'re| are)\s+/i, "");
  const idx = stripped.indexOf(". ");
  if (idx === -1) return { primary: stripped, detail: null };
  return {
    primary: stripped.slice(0, idx + 1),
    detail: stripped.slice(idx + 2).trim(),
  };
}

function InsightRow({ insight, index }: { insight: Insight; index: number }) {
  const Icon = iconById[insight.id] ?? iconByType[insight.type];
  const badge = badgeByType[insight.type];
  const isWarning = insight.type === "warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3.5 py-3",
        isWarning
          ? "border-amber-500/20 bg-amber-500/[0.06]"
          : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: badge.bg }}
      >
        <Icon size={14} stroke={1.5} style={{ color: badge.icon }} />
      </span>

      {isWarning ? (
        (() => {
          const { primary, detail } = splitWarning(insight.message);
          return (
            <div className="min-w-0">
              <p className="text-[13px] leading-relaxed text-foreground">{renderInsightMessage(primary)}</p>
              {detail && (
                <p className="mt-1 text-[12px] leading-relaxed text-amber-200/70">
                  {detail}
                </p>
              )}
            </div>
          );
        })()
      ) : (
        <p className="min-w-0 text-[13px] leading-relaxed text-muted-foreground">
          {renderInsightMessage(insight.message)}
        </p>
      )}
    </motion.div>
  );
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <IconBulb size={16} stroke={1.5} className="text-muted-foreground" />
        <span className="section-heading text-muted-foreground">Smart insights</span>
      </div>

      {insights.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Start learning to unlock personalized insights.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.slice(0, 5).map((insight, i) => (
            <InsightRow key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
