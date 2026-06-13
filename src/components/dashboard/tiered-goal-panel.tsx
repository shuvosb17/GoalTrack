"use client";

import type { TierGoalProgress } from "@/lib/types/metrics";
import { cn } from "@/lib/utils";

export function TieredGoalPanel({
  tiers,
  reframeMessage,
}: {
  tiers: TierGoalProgress[];
  reframeMessage: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">{reframeMessage}</p>
      <div className="space-y-3">
        {tiers.map((tier) => (
          <div key={tier.tier} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {tier.label}
                <span className="ml-2 text-muted-foreground">{tier.hours}h</span>
              </span>
              <span className={cn("text-xs tabular-nums", tier.onTrack ? "text-emerald-400" : "text-amber-400")}>
                {tier.percentOnTrack}% on track {tier.onTrack ? "✓" : ""}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  tier.tier === "minimum" && "bg-emerald-500",
                  tier.tier === "target" && "bg-violet-500",
                  tier.tier === "stretch" && "bg-blue-500"
                )}
                style={{ width: `${Math.min(100, tier.percentOnTrack)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
