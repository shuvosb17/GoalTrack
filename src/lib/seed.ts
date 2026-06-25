import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Track, Module, Topic, Subtopic, Achievement, AppSettings, LeetcodeProblem, CsReviewItem } from "./types";
import { DEFAULT_TIERED_GOAL } from "./types/metrics";
import { nowISO } from "./utils";
import { CS_FUNDAMENTALS, LEETCODE_PATTERNS, coreProblemKey, coreCsItemKey } from "./leetcode-patterns";
import { getReviewStateForBackup, restoreReviewStateFromBackup, useReviewStore } from "@/stores/review-store";
import { buildRevisionCatalog, getDueReviewCatalogItems } from "./revision-catalog";
import { GO_BACKEND_PATH, GO_BACKEND_PATH_MARKER } from "./go-backend-path";
import { importMdIntoModule } from "./md-import";
import { archiveModule } from "./crud";

const ACHIEVEMENTS: Omit<Achievement, "id">[] = [
  { key: "first_session", title: "First Study Session", description: "Complete your first learning session", icon: "🎯" },
  { key: "hours_10", title: "10 Hour Club", description: "Invest 10 hours of focused learning", icon: "⏱️" },
  { key: "hours_50", title: "50 Hour Warrior", description: "Invest 50 hours of focused learning", icon: "💪" },
  { key: "hours_100", title: "Century Scholar", description: "Invest 100 hours of focused learning", icon: "📚" },
  { key: "hours_500", title: "500 Hour Master", description: "Invest 500 hours of focused learning", icon: "🏆" },
  { key: "hours_1000", title: "Millennium Learner", description: "Invest 1000 hours of focused learning", icon: "👑" },
  { key: "streak_7", title: "Week Warrior", description: "Maintain a 7-day learning streak", icon: "🔥" },
  { key: "streak_30", title: "Monthly Champion", description: "Maintain a 30-day learning streak", icon: "⚡" },
  { key: "streak_100", title: "Centurion", description: "Maintain a 100-day learning streak", icon: "🌟" },
  { key: "first_module", title: "Module Master", description: "Complete your first module", icon: "📦" },
  { key: "first_track", title: "Track Conqueror", description: "Complete your first learning track", icon: "🚀" },
  { key: "interview_ready", title: "Interview Ready", description: "BD-CORE readiness 85%+ and all Foundation patterns complete", icon: "🎯" },
];

function buildSeedData() {
  const now = nowISO();
  const tracks: Track[] = [
    { id: uuid(), name: "CS Fundamentals", description: "Computer science and competitive programming foundations", color: "#8b5cf6", icon: "⚡", order: 0, archived: false, createdAt: now, updatedAt: now },
    { id: uuid(), name: "LeetCode", description: "Algorithm & data structure mastery", color: "#3b82f6", icon: "💻", order: 1, archived: false, createdAt: now, updatedAt: now },
    { id: uuid(), name: "Development", description: "Full-stack & backend engineering", color: "#10b981", icon: "🔧", order: 2, archived: false, createdAt: now, updatedAt: now },
    { id: uuid(), name: "System Design", description: "Scalable systems architecture", color: "#f59e0b", icon: "🏗️", order: 3, archived: false, createdAt: now, updatedAt: now },
    { id: uuid(), name: "Academic", description: "Theoretical CS foundations", color: "#ec4899", icon: "🎓", order: 4, archived: false, createdAt: now, updatedAt: now },
  ];

  const modules: Module[] = [];
  const topics: Topic[] = [];
  const subtopics: Subtopic[] = [];

  const seedStructure: Record<string, Record<string, Record<string, string[]>>> = {
    "CS Fundamentals": {
      "Number Theory": { "Primes & Factorization": ["Sieve of Eratosthenes", "Prime Factorization", "GCD & LCM"], "Modular Arithmetic": ["Modular Inverse", "Fermat's Little Theorem", "Chinese Remainder"] },
      "Graph Theory": { "Traversal": ["BFS", "DFS", "Connected Components"], "Shortest Paths": ["Dijkstra", "Bellman-Ford", "Floyd-Warshall"] },
    },
    LeetCode: {
      "Data Structures": { Arrays: ["Two Pointers", "Sliding Window", "Prefix Sum"], "Trees": ["Binary Search Trees", "Tree Traversals", "Lowest Common Ancestor"] },
      Algorithms: { "Dynamic Programming": ["1D DP", "2D DP", "Bitmask DP"], "Graph Algorithms": ["Union Find", "Topological Sort", "Minimum Spanning Tree"] },
    },
    Development: {
      "Backend Engineering": { Golang: ["Concurrency", "Goroutines", "Channels", "Worker Pools"], Databases: ["PostgreSQL", "Query Optimization", "Indexing Strategies"] },
      DevOps: { "Cloud & Containers": ["Docker", "Kubernetes", "CI/CD Pipelines"] },
    },
    "System Design": {
      "Core Concepts": { Scalability: ["Load Balancing", "Caching Strategies", "Database Sharding"], "Distributed Systems": ["CAP Theorem", "Consensus Algorithms", "Message Queues"] },
      "Case Studies": { "Real World": ["URL Shortener", "News Feed", "Chat System"] },
    },
    Academic: {
      "Computer Science": { "Theory": ["Automata Theory", "Computability", "Complexity Classes"], "Mathematics": ["Linear Algebra", "Probability", "Discrete Math"] },
    },
  };

  tracks.forEach((track) => {
    const trackModules = seedStructure[track.name];
    if (!trackModules) return;
    let moduleOrder = 0;
    Object.entries(trackModules).forEach(([moduleName, moduleTopics]) => {
      const newModule: Module = {
        id: uuid(), trackId: track.id, name: moduleName, order: moduleOrder++, archived: false, createdAt: now, updatedAt: now,
      };
      modules.push(newModule);
      let topicOrder = 0;
      Object.entries(moduleTopics).forEach(([topicName, subtopicNames]) => {
        const topic: Topic = {
          id: uuid(), moduleId: newModule.id, trackId: track.id, name: topicName,
          difficulty: topicOrder % 4 === 0 ? "easy" : topicOrder % 4 === 1 ? "medium" : topicOrder % 4 === 2 ? "hard" : "expert",
          status: "not_started", order: topicOrder++, archived: false, createdAt: now, updatedAt: now,
        };
        topics.push(topic);
        subtopicNames.forEach((subName, subOrder) => {
          subtopics.push({
            id: uuid(), topicId: topic.id, moduleId: newModule.id, trackId: track.id, name: subName,
            status: "not_started",
            difficulty: subOrder % 4 === 0 ? "easy" : subOrder % 4 === 1 ? "medium" : subOrder % 4 === 2 ? "hard" : "expert",
            order: subOrder, archived: false, createdAt: now, updatedAt: now,
          });
        });
      });
    });
  });

  return { tracks, modules, topics, subtopics };
}

export async function seedDatabase(): Promise<void> {
  const count = await db.tracks.count();
  if (count > 0) return;

  const { tryRestoreAutoBackup } = await import("./auto-backup");
  const restored = await tryRestoreAutoBackup();
  if (restored) return;

  const { tracks, modules, topics, subtopics } = buildSeedData();
  const settings: AppSettings = {
    id: "default",
    yearStart: "2026-06-01",
    yearEnd: "2026-12-31",
    yearlyHourGoal: 2000,
    dailyHourGoal: 3,
    theme: "dark",
    tieredGoal: DEFAULT_TIERED_GOAL,
    leetCodeStats: { easy: 0, medium: 0, hard: 0 },
  };

  await db.transaction("rw", [db.tracks, db.modules, db.topics, db.subtopics, db.achievements, db.settings], async () => {
    await db.tracks.bulkAdd(tracks);
    await db.modules.bulkAdd(modules);
    await db.topics.bulkAdd(topics);
    await db.subtopics.bulkAdd(subtopics);
    await db.achievements.bulkAdd(ACHIEVEMENTS.map((a) => ({ ...a, id: uuid() })));
    await db.settings.put(settings);
  });
}

export async function ensureLeetcodePrep(): Promise<void> {
  const [existingProblems, existingCs] = await Promise.all([
    db.leetcodeProblems.toArray(),
    db.csReviewItems.toArray(),
  ]);

  const now = nowISO();
  const problemKeys = new Set(existingProblems.map((p) => coreProblemKey(p.pattern, p.title)));
  const csKeys = new Set(existingCs.map((c) => coreCsItemKey(c.category, c.title)));

  let nextOrder = existingProblems.reduce((max, p) => Math.max(max, p.order), -1) + 1;
  const toInsert: LeetcodeProblem[] = [];

  for (const pattern of LEETCODE_PATTERNS) {
    for (const sample of pattern.sampleProblems) {
      const key = coreProblemKey(pattern.name, sample.title);
      if (problemKeys.has(key)) continue;
      problemKeys.add(key);
      toInsert.push({
        id: uuid(),
        pattern: pattern.name,
        title: sample.title,
        url: sample.url,
        difficulty: sample.difficulty,
        done: false,
        isCore: true,
        order: nextOrder++,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  let csOrder = existingCs.reduce((max, c) => Math.max(max, c.order), -1) + 1;
  const csToInsert: CsReviewItem[] = [];
  for (const item of CS_FUNDAMENTALS) {
    const key = coreCsItemKey(item.category, item.title);
    if (csKeys.has(key)) continue;
    csKeys.add(key);
    csToInsert.push({
      id: uuid(),
      category: item.category,
      title: item.title,
      done: false,
      order: csOrder++,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (toInsert.length === 0 && csToInsert.length === 0) return;

  await db.transaction("rw", [db.leetcodeProblems, db.csReviewItems], async () => {
    if (toInsert.length > 0) await db.leetcodeProblems.bulkAdd(toInsert);
    if (csToInsert.length > 0) await db.csReviewItems.bulkAdd(csToInsert);
  });
}

export async function ensureGoBackendPath(): Promise<void> {
  const devTrack = await db.tracks.filter((t) => t.name === "Development").first();
  if (!devTrack) return;

  const existingModules = await db.modules.where("trackId").equals(devTrack.id).toArray();

  for (const mod of existingModules) {
    if (/mastering\s+aws/i.test(mod.name) && !mod.archived) {
      await archiveModule(mod.id);
    }
  }

  const hasMarker = existingModules.some((m) => m.name === GO_BACKEND_PATH_MARKER);
  if (hasMarker) return;

  let moduleOrder = existingModules.reduce((max, m) => Math.max(max, m.order), -1) + 1;
  for (const mod of GO_BACKEND_PATH) {
    const moduleId = uuid();
    const now = nowISO();
    await db.modules.add({
      id: moduleId,
      trackId: devTrack.id,
      name: mod.name,
      order: moduleOrder++,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    await importMdIntoModule(
      devTrack.id,
      moduleId,
      mod.topics.map((t) => ({ name: t.name, subtopics: t.subtopics }))
    );
  }
}

export async function ensureInterviewReadyAchievement(): Promise<void> {
  const existing = await db.achievements.where("key").equals("interview_ready").count();
  if (existing > 0) return;
  await db.achievements.add({
    id: uuid(),
    key: "interview_ready",
    title: "Interview Ready",
    description: "BD-CORE readiness 85%+ and all Foundation patterns complete",
    icon: "🎯",
  });
}

export async function exportAllData() {
  const [
    tracks, modules, topics, subtopics, sessions, journal, journalLinks,
    achievements, milestones, goalMilestones, trackEstimates, settings, skipLogs,
    leetcodeProblems, csReviewItems, prepQuizAttempts, mockRoundSessions,
  ] = await Promise.all([
    db.tracks.toArray(), db.modules.toArray(), db.topics.toArray(), db.subtopics.toArray(),
    db.sessions.toArray(), db.journal.toArray(), db.journalLinks.toArray(), db.achievements.toArray(), db.milestones.toArray(),
    db.goalMilestones.toArray(), db.trackEstimates.toArray(), db.settings.toArray(), db.skipLogs.toArray(),
    db.leetcodeProblems.toArray(), db.csReviewItems.toArray(), db.prepQuizAttempts.toArray(), db.mockRoundSessions.toArray(),
  ]);
  const reviewState = typeof window !== "undefined" ? getReviewStateForBackup() : { queue: [], progress: null };
  return {
    version: 1,
    exportedAt: nowISO(),
    tracks, modules, topics, subtopics, sessions, journal, journalLinks, achievements, milestones,
    goalMilestones, trackEstimates, settings, skipLogs, leetcodeProblems, csReviewItems, prepQuizAttempts, mockRoundSessions,
    reviewQueue: reviewState.queue,
    reviewProgress: reviewState.progress,
  };
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>) {
  await db.transaction(
    "rw",
    [
      db.tracks, db.modules, db.topics, db.subtopics, db.sessions, db.journal, db.journalLinks,
      db.achievements, db.milestones, db.goalMilestones, db.trackEstimates, db.settings, db.skipLogs,
      db.leetcodeProblems, db.csReviewItems, db.prepQuizAttempts, db.mockRoundSessions,
    ],
    async () => {
    await Promise.all([
      db.tracks.clear(), db.modules.clear(), db.topics.clear(), db.subtopics.clear(),
      db.sessions.clear(), db.journal.clear(), db.journalLinks.clear(), db.achievements.clear(), db.milestones.clear(),
      db.goalMilestones.clear(), db.trackEstimates.clear(), db.settings.clear(), db.skipLogs.clear(),
      db.leetcodeProblems.clear(), db.csReviewItems.clear(), db.prepQuizAttempts.clear(), db.mockRoundSessions.clear(),
    ]);
    if (data.tracks?.length) await db.tracks.bulkAdd(data.tracks);
    if (data.modules?.length) await db.modules.bulkAdd(data.modules);
    if (data.topics?.length) await db.topics.bulkAdd(data.topics);
    if (data.subtopics?.length) await db.subtopics.bulkAdd(data.subtopics);
    if (data.sessions?.length) await db.sessions.bulkAdd(data.sessions);
    if (data.journal?.length) await db.journal.bulkAdd(data.journal);
    if (data.journalLinks?.length) await db.journalLinks.bulkAdd(data.journalLinks);
    if (data.achievements?.length) await db.achievements.bulkAdd(data.achievements);
    if (data.milestones?.length) await db.milestones.bulkAdd(data.milestones);
    if (data.goalMilestones?.length) await db.goalMilestones.bulkAdd(data.goalMilestones);
    if (data.trackEstimates?.length) await db.trackEstimates.bulkAdd(data.trackEstimates);
    if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    if (data.skipLogs?.length) await db.skipLogs.bulkAdd(data.skipLogs);
    if (data.leetcodeProblems?.length) await db.leetcodeProblems.bulkAdd(data.leetcodeProblems);
    if (data.csReviewItems?.length) await db.csReviewItems.bulkAdd(data.csReviewItems);
    if (data.prepQuizAttempts?.length) await db.prepQuizAttempts.bulkAdd(data.prepQuizAttempts);
    if (data.mockRoundSessions?.length) await db.mockRoundSessions.bulkAdd(data.mockRoundSessions);
  });
  if (typeof window !== "undefined") {
    restoreReviewStateFromBackup({
      queue: data.reviewQueue ?? [],
      progress: data.reviewProgress ?? null,
    });
    const catalog = buildRevisionCatalog(
      data.tracks ?? [],
      data.modules ?? [],
      data.topics ?? [],
      data.subtopics ?? []
    );
    useReviewStore.getState().refreshQueueFromCatalog(catalog);
    const dueItems = getDueReviewCatalogItems(catalog, data.topics ?? [], data.subtopics ?? []);
    useReviewStore.getState().syncDueReviewsToQueue(dueItems);
  }
}
