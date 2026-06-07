import Dexie, { type Table } from "dexie";
import type {
  Track,
  Module,
  Topic,
  Subtopic,
  LearningSession,
  JournalEntry,
  Achievement,
  Milestone,
  AppSettings,
} from "./types";

export class GrowthOSDatabase extends Dexie {
  tracks!: Table<Track>;
  modules!: Table<Module>;
  topics!: Table<Topic>;
  subtopics!: Table<Subtopic>;
  sessions!: Table<LearningSession>;
  journal!: Table<JournalEntry>;
  achievements!: Table<Achievement>;
  milestones!: Table<Milestone>;
  settings!: Table<AppSettings>;

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
  }
}

export const db = new GrowthOSDatabase();
