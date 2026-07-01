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
  loggedAt?: string;
}

export interface LeetCodeStats {
  easy: number;
  medium: number;
  hard: number;
  lastSolvedDate?: string;
}

export type LeetCodeDifficulty = "easy" | "medium" | "hard";

export type LeetcodeTag = "BD-CORE" | "BD-CP" | "MAANG" | "BD-ADV";

export type LeetcodeTier =
  | "foundation"
  | "strong"
  | "competitive"
  | "useful"
  | "specialist";

export interface LeetcodePatternMeta {
  name: string;
  tier: LeetcodeTier;
  importance: 1 | 2 | 3 | 4;
  tags: LeetcodeTag[];
}

export interface LeetcodeSampleProblem {
  title: string;
  url: string;
  difficulty: LeetCodeDifficulty;
}

export interface LeetcodeProblem {
  id: string;
  pattern: string;
  title: string;
  url?: string;
  difficulty: LeetCodeDifficulty;
  done: boolean;
  isCore: boolean;
  notes?: string;
  order: number;
  doneAt?: string;
  confidenceRating?: 1 | 2 | 3 | 4 | 5;
  nextReviewDue?: string;
  confidenceRated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CsReviewItem {
  id: string;
  category: "OOP" | "DBMS" | "DS";
  title: string;
  done: boolean;
  order: number;
  quizPassed?: boolean;
  quizBestScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrepQuizAttempt {
  id: string;
  subjectType: "cs" | "pattern";
  subjectKey: string;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

export interface MockRoundSession {
  id: string;
  mode: "global" | "pattern";
  pattern?: string;
  problemIds: string[];
  durationMinutes: number;
  startedAt: string;
  completedAt?: string;
}

/** A single dated problem-solve event, used for the per-week problems chart. */
export interface LeetCodeSolveEntry {
  date: string; // yyyy-MM-dd
  difficulty: LeetCodeDifficulty;
}

export interface TopicCompletionMeta {
  completedAt: string;
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  nextReviewDue: string;
  reviewedAt?: string;
  /** False until the user explicitly rates (or skips) after completion. */
  confidenceRated?: boolean;
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
  loggedHours: number;
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
