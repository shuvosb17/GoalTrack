export type ProgressStatus = "not_started" | "in_progress" | "completed" | "mastered";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type MomentumLevel = "poor" | "average" | "good" | "excellent" | "elite";

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
}

export interface Module {
  id: string;
  trackId: string;
  name: string;
  description?: string;
  order: number;
  archived: boolean;
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
  startedAt?: string;
  dueDate?: string;
  statusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  startedAt?: string;
  dueDate?: string;
  statusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AppSettings {
  id: string;
  yearStart: string;
  yearEnd: string;
  yearlyHourGoal: number;
  dailyHourGoal: number;
  theme: "dark" | "light";
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
