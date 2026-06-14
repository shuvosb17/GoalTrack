"use client";

import type { TopStudyItem } from "@/lib/session-attribution";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<TopStudyItem["level"], string> = {
  topic: "Topic",
  module: "Module",
  track: "Track",
};

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-400/25 to-amber-600/10 text-amber-300 ring-amber-400/30",
  "bg-gradient-to-br from-zinc-300/20 to-zinc-500/10 text-zinc-200 ring-zinc-400/25",
  "bg-gradient-to-br from-orange-700/25 to-orange-900/10 text-orange-300 ring-orange-600/25",
];

interface MostStudiedTopicsPanelProps {
  items: TopStudyItem[];
}

export function MostStudiedTopicsPanel({ items }: MostStudiedTopicsPanelProps) {
  const maxHours = items[0]?.hours ?? 1;
  const totalHours = items.reduce((sum, i) => sum + i.hours, 0);

  return (
    <Card className="relative overflow-hidden border-[0.5px] border-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(139,92,246,0.35), transparent)",
        }}
      />
      <CardContent className="relative pt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionHeading className="mb-1 border-0 pb-0">Most Studied Topics</SectionHeading>
            <p className="text-[11px] text-muted-foreground">
              All logged hours · topic, module & track timers · any status
            </p>
          </div>
          {items.length > 0 && (
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-right">
              <p className="metric-value text-lg tabular-nums leading-none">{totalHours.toFixed(1)}h</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">in this list</p>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No study time logged yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const pct = Math.max(4, (item.hours / maxHours) * 100);
              const isTop3 = i < 3;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]",
                    isTop3 && "border-white/[0.1] bg-white/[0.03]"
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1 opacity-80"
                    style={{ background: item.trackColor }}
                  />
                  <div className="flex items-center gap-3 pl-2">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums ring-1 ring-inset",
                        isTop3 ? RANK_STYLES[i] : "bg-white/[0.04] text-muted-foreground ring-white/[0.08]"
                      )}
                    >
                      {i + 1}
                    </span>

                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                      style={{
                        background: `${item.trackColor}22`,
                        boxShadow: `inset 0 0 0 1px ${item.trackColor}44`,
                      }}
                    >
                      {item.trackIcon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
                          style={{
                            color: item.trackColor,
                            background: `${item.trackColor}18`,
                            border: `0.5px solid ${item.trackColor}33`,
                          }}
                        >
                          {LEVEL_LABELS[item.level]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{item.trackName}</p>

                      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${item.trackColor}, ${item.trackColor}99)`,
                            boxShadow: `0 0 12px ${item.trackColor}55`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="metric-value text-lg tabular-nums leading-none" style={{ color: item.trackColor }}>
                        {item.hours.toFixed(1)}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">hours</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
