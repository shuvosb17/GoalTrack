"use client";

import { motion } from "framer-motion";
import {
  IconBulb,
  IconAlertTriangle,
  IconTrendingUp,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { renderInsightMessage } from "@/lib/insight-format";
import type { Insight } from "@/lib/types";
import type { TablerIcon } from "@tabler/icons-react";

const iconMap: Record<Insight["type"], TablerIcon> = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  success: IconTrendingUp,
  tip: IconBulb,
};

const styleMap: Record<Insight["type"], { border: string; bg: string; text: string; icon: string }> = {
  info: { border: "#38bdf8", bg: "rgba(56,189,248,0.07)", text: "#7dd3fc", icon: "text-sky-400" },
  tip: { border: "#a78bfa", bg: "rgba(167,139,250,0.07)", text: "#c4b5fd", icon: "text-violet-400" },
  success: { border: "#34d399", bg: "rgba(52,211,153,0.07)", text: "#86efac", icon: "text-emerald-400" },
  warning: { border: "#fb923c", bg: "rgba(251,146,60,0.07)", text: "#fdba74", icon: "text-amber-400" },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-3">
      <h3 className="section-heading flex items-center gap-2 border-0 pb-0 text-sm text-muted-foreground">
        <IconBulb className="h-4 w-4 opacity-70" stroke={1.5} /> Smart Insights
      </h3>
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">Start learning to unlock personalized insights.</p>
      ) : (
        insights.slice(0, 5).map((insight, i) => {
          const Icon = iconMap[insight.type];
          const style = styleMap[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-lg border-[0.5px] border-white/[0.06] p-3 text-sm"
              style={{
                borderLeftWidth: 2,
                borderLeftColor: style.border,
                background: style.bg,
                color: style.text,
              }}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} stroke={1.5} />
              <p className="leading-relaxed">{renderInsightMessage(insight.message)}</p>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
