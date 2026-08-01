import { cn } from "@/lib/utils";
import type { TrackHealth } from "@/lib/types/metrics";

const PILL_CLASS: Record<TrackHealth["status"], string> = {
  healthy: "status-pill-healthy",
  "at-risk": "status-pill-at-risk",
  neglected: "status-pill-neglected",
};

const LABEL: Record<TrackHealth["status"], string> = {
  healthy: "Healthy",
  "at-risk": "At risk",
  neglected: "Neglected",
};

interface StatusPillProps {
  status: TrackHealth["status"];
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span className={cn("status-pill shrink-0", PILL_CLASS[status], className)}>
      {LABEL[status]}
    </span>
  );
}
