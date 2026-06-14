import { cn } from "@/lib/utils";
import { confidenceTier } from "@/lib/revision-catalog";

const TIER_DOT: Record<"low" | "medium" | "high", string> = {
  low: "#ef4444",
  medium: "#f59e0b",
  high: "#22c55e",
};

const TIER_EMPTY = "rgba(255,255,255,0.12)";

interface ConfidenceDotsProps {
  confidence: number;
  className?: string;
}

export function ConfidenceDots({ confidence, className }: ConfidenceDotsProps) {
  const rating = Math.min(5, Math.max(1, Math.round(confidence)));
  const tier = confidenceTier(rating);
  const fillColor = TIER_DOT[tier];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full transition-colors"
          style={{ background: i < rating ? fillColor : TIER_EMPTY }}
        />
      ))}
    </div>
  );
}

export function ConfidenceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
      {(
        [
          ["low", "Low", TIER_DOT.low],
          ["medium", "Medium", TIER_DOT.medium],
          ["high", "High", TIER_DOT.high],
        ] as const
      ).map(([, label, color]) => (
        <span key={label} className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
