"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-data";
import { addLeetCodeProblem, removeLeetCodeProblem } from "@/lib/crud";
import type { LeetCodeDifficulty } from "@/lib/types/metrics";

const DIFFICULTIES: { key: LeetCodeDifficulty; label: string; color: string }[] = [
  { key: "easy", label: "Easy", color: "#97C459" },
  { key: "medium", label: "Medium", color: "#FAC775" },
  { key: "hard", label: "Hard", color: "#f87171" },
];

export function LeetCodePanel() {
  const settings = useSettings();
  const stats = settings?.leetCodeStats ?? { easy: 0, medium: 0, hard: 0 };
  const total = stats.easy + stats.medium + stats.hard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">LeetCode Problems</h3>
          <p className="text-xs text-muted-foreground">
            {total} solved{stats.lastSolvedDate ? ` · last ${stats.lastSolvedDate}` : ""}
          </p>
        </div>
        <span
          className="rounded px-1.5 py-px text-[11px] font-medium tabular-nums"
          style={{ background: "rgba(124,92,252,0.15)", color: "#c4b5fd" }}
        >
          {stats.easy}E · {stats.medium}M · {stats.hard}H
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DIFFICULTIES.map((d) => (
          <div
            key={d.key}
            className="flex flex-col items-center gap-1.5 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] p-2.5"
          >
            <span className="text-[11px] font-medium" style={{ color: d.color }}>{d.label}</span>
            <span className="metric-value text-xl tabular-nums">{stats[d.key]}</span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => removeLeetCodeProblem(d.key)}
                aria-label={`Remove ${d.label}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                className="h-6 gap-1 px-2 text-[11px]"
                style={{ background: d.color, color: "#0a0a0c" }}
                onClick={() => addLeetCodeProblem(d.key)}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
