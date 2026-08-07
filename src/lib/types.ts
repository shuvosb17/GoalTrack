export type ProgressStatus = "not_started" | "in_progress" | "completed" | "mastered";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type MomentumLevel = "poor" | "average" | "good" | "excellent" | "elite";

import type {
  TieredGoal,
  LeetCodeStats,
  LeetCodeSolveEntry,
  LeetCodeDifficulty,
  LeetcodeTag,
  LeetcodeTier,
  LeetcodePatternMeta,
  LeetcodeSampleProblem,
  LeetcodeProblem,
  CsReviewItem,
  PrepQuizAttempt,
  MockRoundSession,
  TrackSettings,
  TopicCompletionMeta,
  PinnedNextItem,
  SessionQualityRating,
} from "./types/metrics";

export type {
  TieredGoal,
  LeetCodeStats,
  LeetCodeSolveEntry,
  LeetCodeDifficulty,
  LeetcodeTag,
  LeetcodeTier,
  LeetcodePatternMeta,
  LeetcodeSampleProblem,
  LeetcodeProblem,
  CsReviewItem,
  PrepQuizAttempt,
  MockRoundSession,
  TrackSettings,
  TopicCompletionMeta,
  PinnedNextItem,
  SessionQualityRating,
};

export interface Track {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  order: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  pinnedNextItem?: PinnedNextItem;
  /** Weekly study-hour goal for this track; undefined/0 = not set */
  weeklyCommitmentHours?: number;
}

export interface Module {
  id: string;
  trackId: string;
  name: string;
  description?: string;
  order: number;
  archived: boolean;
  /** Soft-delete timestamp — item is in Recycle Bin until restored or purged */
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  trackId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  status: ProgressStatus;
  order: number;
  archived: boolean;
  deletedAt?: string;
  startedAt?: string;
  dueDate?: string;
  statusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  completionMeta?: TopicCompletionMeta;
}

export interface Subtopic {
  id: string;
  topicId: string;
  moduleId: string;
  trackId: string;
  name: string;
  description?: string;
  status: ProgressStatus;
  difficulty: Difficulty;
  order: number;
  archived: boolean;
  deletedAt?: string;
  startedAt?: string;
  dueDate?: string;
  statusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  completionMeta?: TopicCompletionMeta;
}

export interface InProgressTask {
  subtopic: Subtopic;
  topicName: string;
  moduleName: string;
  trackName: string;
  trackColor: string;
  trackIcon: string;
  daysRemaining: number | null;
  isOverdue: boolean;
}

export interface InProgressTopicGroup {
  topic: Topic;
  moduleName: string;
  trackName: string;
  trackColor: string;
  trackIcon: string;
  trackId: string;
  moduleId: string;
  progress: number;
  activeSubtopics: Subtopic[];
  daysRemaining: number | null;
  isOverdue: boolean;
  dueDate?: string;
}

export interface StatusTopicEntry {
  topic: Topic;
  moduleName: string;
  trackName: string;
  trackColor: string;
  trackIcon: string;
  trackId: string;
  moduleId: string;
  /** Primary label — subtopic name when a subtopic is in progress, else topic name */
  displayName: string;
  /** Resolved status from topic + subtopic states */
  displayStatus: ProgressStatus;
  /** When the row represents a focal subtopic (in progress or recently completed) */
  focalSubtopic?: Subtopic;
  /** Topic-level status (for filters when focal subtopic status differs) */
  topicEffectiveStatus: ProgressStatus;
  activeSubtopics: Subtopic[];
  /** 2nd-order: parent topic completion across all its subtopics */
  topicProgress: number;
  /** 1st-order: focal subtopic completion (only present on subtopic rows) */
  subtopicProgress?: number;
  /** Counts of subtopics done / total for the parent topic */
  subtopicsDone: number;
  subtopicsTotal: number;
  /** Headline % shown for the card (focal item: subtopic on subtopic rows, else topic) */
  progress: number;
  daysRemaining: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  dueDate?: string;
  statusDate: string;
}

export interface DailyStatusSnapshot {
  date: string;
  label: string;
  relativeLabel: string;
  counts: Record<ProgressStatus, number>;
  topics: StatusTopicEntry[];
}

export interface UrgencyAlert {
  id: string;
  level: "critical" | "warning" | "info";
  message: string;
  topicName: string;
  trackName: string;
  dueDate?: string;
  topicId: string;
  /** When the alert is for a specific in-progress subtopic */
  subtopicId?: string;
  subtopicName?: string;
}

export interface LearningSession {
  id: string;
  trackId: string;
  moduleId?: string;
  topicId?: string;
  subtopicId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  notes?: string;
  date: string;
  manual: boolean;
  createdAt: string;
  qualityRating?: SessionQualityRating;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  trackId?: string;
  moduleId?: string;
  topicId?: string;
  subtopicId?: string;
  learned: string;
  challenges: string;
  takeaways: string;
  nextActions: string;
  sessionIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** Bookmarked URL pinned to a track / module / topic / subtopic in Journal. */
export interface JournalLink {
  id: string;
  url: string;
  title?: string;
  trackId: string;
  moduleId?: string;
  topicId?: string;
  subtopicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Milestone {
  id: string;
  type: "hours" | "completion" | "streak" | "achievement";
  title: string;
  description: string;
  date: string;
  value?: number;
}

/** User-defined learning goal with a timeline (module/topic under a track) */
export interface GoalCheckpoint {
  id: string;
  label: string;
  done: boolean;
  doneAt?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  trackId: string;
  /** @deprecated use moduleIds — kept for older backups (single module) */
  moduleId?: string;
  /** Selected modules under a track; empty = whole track */
  moduleIds?: string[];
  /** @deprecated use topicIds — kept for older backups */
  topicId?: string;
  /** Selected topics under a single module; empty = whole module(s) or track */
  topicIds?: string[];
  startDate: string;
  months: number;
  endDate: string;
  baselineProgress: number;
  targetProgress: number;
  notes?: string;
  checkpoints?: GoalCheckpoint[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalRiskLevel = "on_track" | "at_risk" | "critical";

export interface GoalProjectedFinish {
  projectedDate: string | null;
  daysToFinish: number | null;
  onTimeProjection: boolean;
  daysEarlyOrLate: number | null;
}

export type GoalPaceStatus = "ahead" | "on_track" | "behind" | "completed" | "overdue";
export type GoalScopeType = "track" | "module" | "modules" | "topic" | "topics";

export interface GoalMilestoneStats {
  goal: GoalMilestone;
  trackName: string;
  trackIcon: string;
  trackColor: string;
  moduleName?: string;
  topicName?: string;
  scopeLabel: string;
  scopeType: GoalScopeType;
  /** Same formula as Tracks page for this scope */
  currentProgress: number;
  /** Full track % when scope is module/topic (for comparison) */
  trackWideProgress: number;
  progressGained: number;
  timeProgress: number;
  daysTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  expectedProgress: number;
  paceDelta: number;
  paceStatus: GoalPaceStatus;
  isActive: boolean;
  topicsTotal: number;
  topicsCompleted: number;
  subtopicsTotal: number;
  subtopicsCompleted: number;
  topicStatusCounts: Record<ProgressStatus, number>;
}

export interface AppSettings {
  id: string;
  yearStart: string;
  yearEnd: string;
  yearlyHourGoal: number;
  dailyHourGoal: number;
  theme: "dark" | "light";
  tieredGoal?: TieredGoal;
  leetCodeStats?: LeetCodeStats;
  leetCodeLog?: LeetCodeSolveEntry[];
  trackSettings?: Record<string, TrackSettings>;
  /** Applied Development Go Backend curriculum shape version */
  goBackendCurriculumVersion?: number;
  /** Target date to be apply-ready on the Go Backend path (yyyy-MM-dd) */
  goCoachTargetDate?: string;
  /** Planned weekly study hours used by the scenario simulator */
  goCoachPlannedHoursPerWeek?: number;
  /** BS23 Star Coder — target online MCQ date (yyyy-MM-dd) */
  bs23McqDate?: string;
  /** BS23 Star Coder — expected day-long assessment date (yyyy-MM-dd) */
  bs23DayLongDate?: string;
  /** Language/stack declared for BS23 stack-specific test */
  bs23DeclaredStack?: Bs23DeclaredStack;
  /** Planned weekly prep hours for BS23 readiness burndown */
  bs23WeeklyHours?: number;
}

export type Bs23StageId = "S1" | "S2" | "S3" | "S4" | "S5";

export type Bs23DeclaredStack = "java" | "csharp" | "javascript" | "python" | "go";

export type Bs23DrillMode =
  | "mcq_mock"
  | "written_paper"
  | "timed_dsa"
  | "paper_dsa"
  | "system_design"
  | "erd"
  | "sql_handwrite"
  | "stack_test"
  | "mock_interview"
  | "personality"
  | "presentation"
  | "star_practice";

export interface Bs23Drill {
  id: string;
  stageId: Bs23StageId;
  competencyId: string;
  date: string;
  mode: Bs23DrillMode;
  /** 0–100 */
  scorePercent: number;
  durationMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  notes?: string;
  createdAt: string;
}

export interface Bs23Artifact {
  id: string;
  itemId: string;
  status: "not_started" | "in_progress" | "done";
  completedAt?: string;
  notes?: string;
  updatedAt: string;
}

/** Per-track completion deadline for estimation charts */
export interface TrackEstimate {
  trackId: string;
  targetMonths: number;
  startDate: string;
  updatedAt: string;
}

export type TrackPaceStatus = "ahead" | "on_track" | "behind" | "completed" | "not_started";

export interface TrackEstimationPoint {
  label: string;
  target: number;
  actual?: number;
  projected?: number;
}

export interface TrackEstimationStats {
  track: Track;
  estimate: TrackEstimate;
  currentProgress: number;
  targetMonths: number;
  startDate: string;
  endDate: string;
  daysElapsed: number;
  daysRemaining: number;
  daysToComplete: number | null;
  projectedCompletionDate: string;
  projectedProgressAtDeadline: number;
  successProbability: number;
  paceStatus: TrackPaceStatus;
  paceDelta: number;
  hoursInvested: number;
  hoursPerWeek: number;
  chartData: TrackEstimationPoint[];
  insight: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startedAt?: number;
  pausedAt?: number;
  accumulatedMs: number;
  trackId?: string;
  moduleId?: string;
  topicId?: string;
  subtopicId?: string;
  activityLabel?: string;
}

export interface HierarchyPath {
  trackId: string;
  moduleId?: string;
  topicId?: string;
  subtopicId?: string;
}

export interface ProgressStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  mastered: number;
  percentage: number;
}

export interface Insight {
  id: string;
  type: "info" | "warning" | "success" | "tip";
  message: string;
  priority: number;
}

export interface RadarDimension {
  name: string;
  value: number;
  fullMark: number;
}
