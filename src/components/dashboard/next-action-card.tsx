"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconTargetArrow, IconPlayerPlayFilled, IconCircleCheck } from "@tabler/icons-react";
import type { MomentumBreakdown } from "@/lib/types/metrics";

interface NextAction {
  trackName: string;
  label: string;
  href: string;
}

interface NextActionCardProps {
  hoursLeftToday: number;
  onPace: boolean;
  momentum: MomentumBreakdown;
  action?: NextAction;
}

export function NextActionCard({ hoursLeftToday, onPace, momentum, action }: NextActionCardProps) {
  const headline = onPace
    ? "You've hit today's pace. Bank extra hours toward Target."
    : `Log ${hoursLeftToday}h more today to stay on Target pace.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border relative overflow-hidden p-5"
      style={{ borderLeftWidth: 2, borderLeftColor: onPace ? "#34d399" : "#7c5cfc" }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ background: onPace ? "linear-gradient(135deg,#34d399,transparent)" : "linear-gradient(135deg,#7c5cfc,transparent)" }}
      />
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {onPace ? <IconCircleCheck className="h-3.5 w-3.5 text-emerald-400" stroke={1.5} /> : <IconTargetArrow className="h-3.5 w-3.5 text-violet-400" stroke={1.5} />}
            What to do right now
          </p>
          <p className="text-base font-medium" style={{ color: "#e2d9ff", letterSpacing: "-0.3px" }}>{headline}</p>
          <p className="truncate text-xs text-muted-foreground">{momentum.dragMessage}</p>
        </div>
        {action && (
          <Link
            href={action.href}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            style={{ background: "rgba(124,92,252,0.9)" }}
          >
            <IconPlayerPlayFilled className="h-4 w-4" />
            <span className="truncate">Start: {action.label}</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
