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

/** Exact icon match for the five primary insight categories; others fall back by type. */
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

/** Badge background + icon color, replacing the old left-border color coding. */
const badgeByType: Record<Insight["type"], { bg: string; icon: string }> = {
  info: { bg: "#1c2a3d", icon: "#6fa8dc" },
  tip: { bg: "#241f3d", icon: "#a48ee0" },
  success: { bg: "#15302a", icon: "#4fb892" },
  warning: { bg: "#3a2c16", icon: "#e0a23a" },
};

const NEUTRAL_ROW = { background: "#15151c", border: "0.5px solid #232330" };
const WARNING_ROW = { background: "#1d180f", border: "0.5px solid #3a2c16" };

/** Split a warning message into a primary line and a supporting detail line. */
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
      className="flex items-start gap-3 rounded-[10px]"
      style={{ ...(isWarning ? WARNING_ROW : NEUTRAL_ROW), padding: "13px 14px" }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: 26, height: 26, borderRadius: 7, background: badge.bg, marginTop: 1 }}
      >
        <Icon size={14} stroke={1.5} style={{ color: badge.icon }} />
      </span>

      {isWarning ? (
        (() => {
          const { primary, detail } = splitWarning(insight.message);
          return (
            <div className="min-w-0">
              <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "#c7c5d6", marginBottom: detail ? 6 : 0 }}>
                {renderInsightMessage(primary)}
              </p>
              {detail && (
                <p style={{ fontSize: "12px", lineHeight: 1.4, color: "#8b7a52", margin: 0 }}>
                  {detail}
                </p>
              )}
            </div>
          );
        })()
      ) : (
        <p className="min-w-0" style={{ fontSize: "13.5px", lineHeight: 1.5, color: "#c7c5d6", margin: 0 }}>
          {renderInsightMessage(insight.message)}
        </p>
      )}
    </motion.div>
  );
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div style={{ background: "#0d0d11", borderRadius: 16, padding: 24 }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 18 }}>
        <IconBulb size={16} stroke={1.5} style={{ color: "#8b88a3" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#a9a7bd", letterSpacing: "0.02em" }}>
          Smart insights
        </span>
      </div>

      {insights.length === 0 ? (
        <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "#8b88a3", margin: 0 }}>
          Start learning to unlock personalized insights.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {insights.slice(0, 5).map((insight, i) => (
            <InsightRow key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
