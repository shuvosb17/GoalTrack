import Dexie, { type Table } from "dexie";
import type {
  Track,
  Module,
  Topic,
  Subtopic,
  LearningSession,
  JournalEntry,
  JournalLink,
  Achievement,
  Milestone,
  GoalMilestone,
  TrackEstimate,
  AppSettings,
  LeetcodeProblem,
  CsReviewItem,
  PrepQuizAttempt,
  MockRoundSession,
  Bs23Drill,
  Bs23Artifact,
  Bs23TopicProgress,
} from "./types";
import type { SkipLog } from "./types/metrics";

export class GrowthOSDatabase extends Dexie {
  tracks!: Table<Track>;
  modules!: Table<Module>;
  topics!: Table<Topic>;
  subtopics!: Table<Subtopic>;
  sessions!: Table<LearningSession>;
  journal!: Table<JournalEntry>;
  journalLinks!: Table<JournalLink>;
  achievements!: Table<Achievement>;
  milestones!: Table<Milestone>;
  goalMilestones!: Table<GoalMilestone>;
  trackEstimates!: Table<TrackEstimate>;
  settings!: Table<AppSettings>;
  skipLogs!: Table<SkipLog>;
  leetcodeProblems!: Table<LeetcodeProblem>;
  csReviewItems!: Table<CsReviewItem>;
  prepQuizAttempts!: Table<PrepQuizAttempt>;
  mockRoundSessions!: Table<MockRoundSession>;
  bs23Drills!: Table<Bs23Drill>;
  bs23Artifacts!: Table<Bs23Artifact>;
  bs23TopicProgress!: Table<Bs23TopicProgress>;

  constructor() {
    super("GrowthOS");
    this.version(1).stores({
      tracks: "id, name, order, archived",
      modules: "id, trackId, order, archived",
      topics: "id, moduleId, trackId, order, archived",
      subtopics: "id, topicId, moduleId, trackId, status, order, archived",
      sessions: "id, trackId, moduleId, topicId, subtopicId, date, startTime",
      journal: "id, date, createdAt",
      achievements: "id, key, unlockedAt",
      milestones: "id, type, date",
      settings: "id",
    });
    this.version(2).stores({
      subtopics: "id, topicId, moduleId, trackId, status, order, archived, dueDate",
    });
    this.version(3).stores({
      topics: "id, moduleId, trackId, order, archived, status, dueDate",
    }).upgrade(async (tx) => {
      await tx.table("topics").toCollection().modify((topic) => {
        if (!topic.status) topic.status = "not_started";
      });
    });
    this.version(4).stores({}).upgrade(async (tx) => {
      await tx.table("tracks").toCollection().modify((track) => {
        if (track.name === "CPS Fundamentals") {
          track.name = "CS Fundamentals";
          track.description = "Computer science and competitive programming foundations";
        }
      });
    });
    this.version(5).stores({
      journal: "id, date, createdAt, trackId, topicId, subtopicId",
    });
    this.version(8).stores({
      goalMilestones: "id, trackId, moduleId, topicId, startDate, endDate, order",
    });
    this.version(9).stores({}).upgrade(async (tx) => {
      const settings = await tx.table("settings").get("default");
      if (!settings) return;
      const isCalendarYear =
        settings.yearStart?.endsWith("-01-01") && settings.yearEnd?.endsWith("-12-31");
      if (isCalendarYear) {
        await tx.table("settings").update("default", {
          yearStart: "2026-06-01",
          yearEnd: "2027-04-30",
        });
      }
    });
    this.version(10).stores({
      trackEstimates: "trackId, targetMonths, startDate",
    }).upgrade(async (tx) => {
      const settings = await tx.table("settings").get("default");
      if (settings?.yearEnd === "2027-04-30") {
        await tx.table("settings").update("default", { yearEnd: "2026-12-31" });
      }
    });
    this.version(11).stores({
      skipLogs: "id, date",
    }).upgrade(async (tx) => {
      const settings = await tx.table("settings").get("default");
      if (!settings) return;
      const updates: Partial<AppSettings> = {};
      if (!settings.tieredGoal) {
        updates.tieredGoal = {
          minimum: 300,
          target: 700,
          stretch: settings.yearlyHourGoal >= 2000 ? settings.yearlyHourGoal : 2000,
          year: 2026,
        };
      }
      if (settings.yearlyHourGoal < 2000) {
        updates.yearlyHourGoal = 2000;
      }
      if (Object.keys(updates).length > 0) {
        await tx.table("settings").update("default", updates);
      }
    });
    this.version(12).stores({
      journalLinks: "id, trackId, moduleId, topicId, subtopicId, createdAt",
    });
    this.version(13).stores({
      leetcodeProblems: "id, pattern, difficulty, done, isCore, order",
      csReviewItems: "id, category, done, order",
    });
    this.version(14).stores({
      prepQuizAttempts: "id, subjectType, subjectKey, passed, completedAt",
      mockRoundSessions: "id, mode, pattern, startedAt, completedAt",
    });
    this.version(15).stores({
      modules: "id, trackId, order, archived, deletedAt",
      topics: "id, moduleId, trackId, order, archived, status, dueDate, deletedAt",
      subtopics: "id, topicId, moduleId, trackId, status, order, archived, dueDate, deletedAt",
    });
    this.version(16).stores({
      bs23Drills: "id, stageId, competencyId, date, mode",
      bs23Artifacts: "id, itemId, status, completedAt",
    });
    this.version(17).stores({
      bs23TopicProgress: "id, topicId, stageId, competencyId, status, completedAt",
    });
    this.version(7).stores({}).upgrade(async (tx) => {
      const topics = await tx.table("topics").toArray();
      for (const topic of topics) {
        if (!topic.dueDate) continue;
        const subs = await tx.table("subtopics").where("topicId").equals(topic.id).toArray();
        for (const sub of subs) {
          if (
            sub.status === "in_progress" &&
            sub.dueDate &&
            sub.dueDate > topic.dueDate
          ) {
            await tx.table("subtopics").update(sub.id, { dueDate: topic.dueDate });
          }
        }
      }
    });
    this.version(6).stores({}).upgrade(async (tx) => {
      await tx.table("topics").toCollection().modify((topic) => {
        if (topic.status !== "not_started" && !topic.statusChangedAt) {
          topic.statusChangedAt = topic.updatedAt;
        }
      });
      await tx.table("subtopics").toCollection().modify((sub) => {
        if (sub.status !== "not_started" && !sub.statusChangedAt) {
          sub.statusChangedAt = sub.updatedAt;
        }
      });
    });
  }
}

export const db = new GrowthOSDatabase();
