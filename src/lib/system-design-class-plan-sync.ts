import { v4 as uuid } from "uuid";
import { db } from "./db";
import { syncTopicStatusFromSubtopics } from "./crud";
import type { AppSettings, LearningSession, Subtopic, Topic } from "./types";
import { nowISO } from "./utils";

/** Bump when the System Design TJIP class plan (Class 10+) changes. */
export const SYSTEM_DESIGN_CLASS_PLAN_VERSION = 1;

const TRACK_NAME = "System Design";
const MODULE_NAME = "TJIP";
const FIRST_SYNCED_CLASS = 10;

interface ClassPlanEntry {
  classNumber: number;
  title: string;
  subtopics: string[];
  /** Titles from the previous class plan whose topics (and time logs) move into this class. */
  legacyTitles?: string[];
}

export const SYSTEM_DESIGN_CLASS_PLAN: ClassPlanEntry[] = [
  {
    classNumber: 10,
    title: "Managing Long-Running Tasks",
    subtopics: ["Async Workers", "Queues", "Retries", "Dead Letter Queue (DLQ)", "Idempotency", "Backpressure"],
    legacyTitles: ["Long-Running Tasks and Workflow Orchestration"],
  },
  {
    classNumber: 11,
    title: "Search Systems as a Read Model",
    subtopics: ["Search Index as Derived Data", "Freshness vs Performance", "Query-First Design"],
  },
  {
    classNumber: 12,
    title: "Handling Large Blobs",
    subtopics: ["Presigned URLs", "Multipart Uploads", "CDN", "Metadata + Blob State Sync"],
  },
  {
    classNumber: 13,
    title: "Approximate Data Structures & Analytics",
    subtopics: ["Bloom Filters", "Count-Min Sketch", "HyperLogLog", "Percentile Sketches"],
    legacyTitles: [
      "Approximate Data Structures (Bloom + Count-Min)",
      "Approximate Analytics II (HLL + Percentiles)",
    ],
  },
  {
    classNumber: 14,
    title: "TBD",
    subtopics: [],
  },
  {
    classNumber: 15,
    title: "Workflow Orchestration",
    subtopics: ["State Machines", "Sagas", "Compensation", "Outbox Pattern"],
  },
  {
    classNumber: 16,
    title: "Interview Strategy & Rubric",
    subtopics: ["Requirements", "Estimation", "Architecture", "Tradeoffs Framework"],
  },
  {
    classNumber: 17,
    title: "Workshop I: URL Shortener",
    subtopics: ["Key Generation", "Caching", "Abuse Controls", "10x Scaling"],
    legacyTitles: ["Design Workshop I: URL Shortener"],
  },
  {
    classNumber: 18,
    title: "Workshop II: Ticket Booking",
    subtopics: ["Seat Holds", "Payment Races", "Oversell Prevention"],
    legacyTitles: ["Design Workshop II: Ticket Booking System"],
  },
  {
    classNumber: 19,
    title: "Workshop III: Ad Click Aggregation",
    subtopics: ["Event Contracts", "Partitioning", "Windowing", "Dedup"],
    legacyTitles: ["Design Workshop III: Ad Click Aggregation"],
  },
  {
    classNumber: 20,
    title: "Workshop IV: Social Feed",
    subtopics: ["Push vs Pull Fan-out", "Celebrity Problem", "Feed Caching"],
  },
  {
    classNumber: 21,
    title: "Workshop V: Notification Service",
    subtopics: ["Multi-channel Delivery", "Retry Policies", "DLQ", "Provider Fallback"],
  },
  {
    classNumber: 22,
    title: "Reliability & Observability",
    subtopics: ["SLOs", "Metrics", "Alerts", "Incident Playbooks"],
    legacyTitles: ["Reliability and Observability Synthesis"],
  },
  {
    classNumber: 23,
    title: "Final Review & Course Wrap",
    subtopics: ["Mock Interviews", "AI Coding Practice", "30-Day Roadmap"],
    legacyTitles: ["Final Interview Clinic and Course Closure"],
  },
];

function classTopicName(entry: ClassPlanEntry): string {
  return `Class ${String(entry.classNumber).padStart(2, "0")} - ${entry.title}`;
}

function parseClassTopic(name: string): { classNumber: number; title: string } | null {
  const match = name.match(/^\s*class\s*(\d+)\s*[-–—:]?\s*(.*)$/i);
  if (!match) return null;
  return { classNumber: Number(match[1]), title: match[2] };
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isLive<T extends { archived: boolean; deletedAt?: string }>(item: T): boolean {
  return !item.archived && !item.deletedAt;
}

function countBy(sessions: LearningSession[], key: "topicId" | "subtopicId"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    const id = session[key];
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

function hasProgress(item: Topic | Subtopic): boolean {
  return item.status !== "not_started" || !!item.dueDate;
}

/**
 * Align TJIP Class 10+ topics with SYSTEM_DESIGN_CLASS_PLAN.
 * Classes below 10 are never touched. Topics and subtopics with logged time
 * are renamed or archived in place so their sessions stay attached.
 */
export async function ensureSystemDesignClassPlan(): Promise<void> {
  const settings = await db.settings.toCollection().first();
  if (settings?.systemDesignClassPlanVersion === SYSTEM_DESIGN_CLASS_PLAN_VERSION) return;

  const track = await db.tracks.filter((t) => t.name === TRACK_NAME && !t.archived).first();
  if (!track) return;

  const mod = await db.modules
    .where("trackId")
    .equals(track.id)
    .filter((m) => m.name.trim().toUpperCase() === MODULE_NAME && isLive(m))
    .first();
  if (!mod) return;

  const moduleTopics = (await db.topics.where("moduleId").equals(mod.id).toArray()).filter(isLive);

  const keptTopics: Topic[] = [];
  const syncedTopics: Array<{ topic: Topic; classNumber: number; title: string }> = [];
  for (const topic of moduleTopics) {
    const parsed = parseClassTopic(topic.name);
    if (parsed && parsed.classNumber >= FIRST_SYNCED_CLASS) {
      syncedTopics.push({ topic, ...parsed });
    } else {
      keptTopics.push(topic);
    }
  }

  const syncedTopicIds = syncedTopics.map((s) => s.topic.id);
  const [sessions, allSubtopics] = await Promise.all([
    syncedTopicIds.length ? db.sessions.where("topicId").anyOf(syncedTopicIds).toArray() : [],
    syncedTopicIds.length ? db.subtopics.where("topicId").anyOf(syncedTopicIds).toArray() : [],
  ]);
  const sessionsByTopic = countBy(sessions, "topicId");
  const sessionsBySubtopic = countBy(sessions, "subtopicId");

  const liveSubsByTopic = new Map<string, Subtopic[]>();
  for (const sub of allSubtopics.filter(isLive)) {
    const list = liveSubsByTopic.get(sub.topicId) ?? [];
    list.push(sub);
    liveSubsByTopic.set(sub.topicId, list);
  }
  for (const list of liveSubsByTopic.values()) list.sort((a, b) => a.order - b.order);

  const subtopicActive = (sub: Subtopic) =>
    (sessionsBySubtopic.get(sub.id) ?? 0) > 0 || hasProgress(sub);
  const topicActive = (topic: Topic) =>
    (sessionsByTopic.get(topic.id) ?? 0) > 0 ||
    hasProgress(topic) ||
    (liveSubsByTopic.get(topic.id) ?? []).some(subtopicActive);

  const assigned = new Map<number, Topic>();
  const usedTopicIds = new Set<string>();

  for (const entry of SYSTEM_DESIGN_CLASS_PLAN) {
    const candidates = [entry.title, ...(entry.legacyTitles ?? [])].map(normalizeTitle);
    for (const candidate of candidates) {
      const match = syncedTopics.find(
        (s) => !usedTopicIds.has(s.topic.id) && normalizeTitle(s.title) === candidate
      );
      if (match) {
        assigned.set(entry.classNumber, match.topic);
        usedTopicIds.add(match.topic.id);
        break;
      }
    }
  }

  for (const entry of SYSTEM_DESIGN_CLASS_PLAN) {
    if (assigned.has(entry.classNumber)) continue;
    const match = syncedTopics.find(
      (s) =>
        !usedTopicIds.has(s.topic.id) &&
        s.classNumber === entry.classNumber &&
        !topicActive(s.topic)
    );
    if (match) {
      assigned.set(entry.classNumber, match.topic);
      usedTopicIds.add(match.topic.id);
    }
  }

  const leftovers = syncedTopics.filter((s) => !usedTopicIds.has(s.topic.id)).map((s) => s.topic);
  const baseOrder = keptTopics.reduce((max, t) => Math.max(max, t.order), -1) + 1;
  const now = nowISO();

  await db.transaction("rw", [db.topics, db.subtopics, db.settings], async () => {
    for (const topic of leftovers) {
      if (topicActive(topic)) {
        await db.topics.update(topic.id, { archived: true, updatedAt: now });
        continue;
      }
      await db.topics.update(topic.id, { deletedAt: now, updatedAt: now });
      await db.subtopics.where("topicId").equals(topic.id).modify((s) => {
        if (!s.deletedAt) {
          s.deletedAt = now;
          s.updatedAt = now;
        }
      });
    }

    for (const entry of SYSTEM_DESIGN_CLASS_PLAN) {
      const order = baseOrder + (entry.classNumber - FIRST_SYNCED_CLASS);
      const existing = assigned.get(entry.classNumber);
      const topicId = existing?.id ?? uuid();
      const difficulty = existing?.difficulty ?? "medium";

      if (existing) {
        await db.topics.update(existing.id, {
          name: classTopicName(entry),
          order,
          updatedAt: now,
        });
      } else {
        await db.topics.add({
          id: topicId,
          moduleId: mod.id,
          trackId: track.id,
          name: classTopicName(entry),
          difficulty,
          status: "not_started",
          order,
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const targetNames = entry.subtopics;
      const targetSet = new Set(targetNames);
      const usedNames = new Set<string>();
      const keptSubIds = new Set<string>();
      const currentSubs = existing ? liveSubsByTopic.get(existing.id) ?? [] : [];

      for (const sub of currentSubs) {
        if (!targetSet.has(sub.name) || usedNames.has(sub.name)) continue;
        usedNames.add(sub.name);
        keptSubIds.add(sub.id);
        await db.subtopics.update(sub.id, { order: targetNames.indexOf(sub.name), updatedAt: now });
      }

      for (const sub of currentSubs) {
        if (keptSubIds.has(sub.id)) continue;

        if (!subtopicActive(sub)) {
          await db.subtopics.update(sub.id, { deletedAt: now, updatedAt: now });
          continue;
        }

        const nextName = targetNames.find((name) => !usedNames.has(name));
        if (nextName) {
          usedNames.add(nextName);
          await db.subtopics.update(sub.id, {
            name: nextName,
            order: targetNames.indexOf(nextName),
            updatedAt: now,
          });
        } else {
          await db.subtopics.update(sub.id, { archived: true, updatedAt: now });
        }
      }

      const toInsert: Subtopic[] = [];
      targetNames.forEach((name, index) => {
        if (usedNames.has(name)) return;
        toInsert.push({
          id: uuid(),
          topicId,
          moduleId: mod.id,
          trackId: track.id,
          name,
          status: "not_started",
          difficulty,
          order: index,
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
      });
      if (toInsert.length > 0) await db.subtopics.bulkAdd(toInsert);
    }

    if (settings) {
      await db.settings.update(settings.id, {
        systemDesignClassPlanVersion: SYSTEM_DESIGN_CLASS_PLAN_VERSION,
      } satisfies Partial<AppSettings>);
    }
  });

  for (const topic of assigned.values()) {
    await syncTopicStatusFromSubtopics(topic.id);
  }
}
