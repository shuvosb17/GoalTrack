export interface TieredGoal {
  minimum: number;
  target: number;
  stretch: number;
  year: number;
}

export interface DailyPaceTarget {
  hoursNeededToday: number;
  hoursLoggedToday: number;
  onPace: boolean;
  weeksRemaining: number;
  hoursLeftToday: number;
}

export interface WeeklyConsistency {
  daysOnTarget: number;
  totalDays: number;
  lastWeekDays: number;
}

export interface MomentumBreakdown {
  consistency: number;
  volume: number;
  velocity: number;
  balance: number;
  total: number;
  weakest: "consistency" | "volume" | "velocity" | "balance";
  dragMessage: string;
}

export interface TrackHealth {
  trackId: string;
  trackName: string;
  lastStudied: string | null;
  daysSinceStudied: number;
  status: "healthy" | "at-risk" | "neglected";
  shareOfTotalTime: number;
}

export type SessionQualityRating = 1 | 2 | 3;
export type SkipReason = "too-tired" | "too-busy" | "unclear-what-to-do" | "forgot" | "other";

export interface SkipLog {
  id: string;
  date: string;
  reason: SkipReason;
}

export interface LeetCodeStats {
  easy: number;
  medium: number;
  hard: number;
  lastSolvedDate?: string;
}

export interface TopicCompletionMeta {
  completedAt: string;
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  nextReviewDue: string;
  reviewedAt?: string;
}

export interface PinnedNextItem {
  type: "topic" | "subtopic" | "module";
  id: string;
  label: string;
}

export interface TrackSettings {
  neglectThresholdDays?: number;
  targetAllocationPercent?: number;
  leetCodeTargets?: { easy: number; medium: number; hard: number };
}

export interface TierGoalProgress {
  tier: "minimum" | "target" | "stretch";
  label: string;
  hours: number;
  projectedHours: number;
  percentOnTrack: number;
  onTrack: boolean;
}

export const TRACK_BAR_COLORS: Record<string, string> = {
  "CS Fundamentals": "#7c5cfc",
  LeetCode: "#97C459",
  Development: "#5DCAA5",
  "System Design": "#FAC775",
  Academic: "#a78bfa",
};

export const DEFAULT_TIERED_GOAL: TieredGoal = {
  minimum: 300,
  target: 700,
  stretch: 2000,
  year: 2026,
};
