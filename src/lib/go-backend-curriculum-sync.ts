import { v4 as uuid } from "uuid";
import { db } from "./db";
import { getGoBackendPathWithProjects } from "./go-backend-import";
import {
  formatGoProjectTopicName,
  GO_BACKEND_PROJECT_TOPIC_PREFIX,
  goProjectTierToDifficulty,
} from "./go-backend-projects";
import {
  GO_BACKEND_CURRICULUM_VERSION,
  GO_BACKEND_PATH_MARKER,
} from "./go-backend-path";
import type { AppSettings, Module, Subtopic, Topic } from "./types";
import { nowISO } from "./utils";

export { GO_BACKEND_CURRICULUM_VERSION };

const LEGACY_MODULE_NAMES: Record<string, string> = {
  "Module 12: Cloud & Deployment (AWS)":
    "Module 12: Cloud & Deployment (AWS) — Hands-on",
};

type PathModule = ReturnType<typeof getGoBackendPathWithProjects>[number];

function isProjectTopic(name: string): boolean {
  return name.startsWith(GO_BACKEND_PROJECT_TOPIC_PREFIX);
}

function desiredTopicNames(mod: PathModule): Set<string> {
  const names = new Set(mod.topics.map((t) => t.name));
  for (const project of mod.projects ?? []) {
    names.add(formatGoProjectTopicName(project));
  }
  return names;
}

async function syncSubtopics(
  trackId: string,
  moduleId: string,
  topic: Topic,
  desired: string[]
): Promise<void> {
  const existing = await db.subtopics.where("topicId").equals(topic.id).toArray();
  const byName = new Map(existing.map((s) => [s.name, s]));
  const now = nowISO();
  const keep = new Set(desired);
  const difficulty = topic.difficulty ?? "medium";

  const updates: Subtopic[] = [];
  const inserts: Subtopic[] = [];

  desired.forEach((name, order) => {
    const found = byName.get(name);
    if (found) {
      const patchNeeded =
        found.order !== order || found.archived || found.difficulty !== difficulty;
      if (patchNeeded) {
        updates.push({
          ...found,
          order,
          archived: false,
          difficulty,
          updatedAt: now,
        });
      }
      return;
    }
    inserts.push({
      id: uuid(),
      topicId: topic.id,
      moduleId,
      trackId,
      name,
      status: "not_started",
      difficulty,
      order,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  });

  const toArchive = existing.filter((s) => !s.archived && !keep.has(s.name));

  await db.transaction("rw", db.subtopics, async () => {
    for (const s of updates) await db.subtopics.put(s);
    if (inserts.length) await db.subtopics.bulkAdd(inserts);
    for (const s of toArchive) {
      await db.subtopics.update(s.id, { archived: true, updatedAt: now });
    }
  });
}

async function upsertTopic(
  trackId: string,
  moduleId: string,
  name: string,
  order: number,
  difficulty: Topic["difficulty"],
  existingByName: Map<string, Topic>
): Promise<Topic> {
  const now = nowISO();
  const found = existingByName.get(name);
  if (!found) {
    const topic: Topic = {
      id: uuid(),
      moduleId,
      trackId,
      name,
      difficulty,
      status: "not_started",
      order,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.topics.add(topic);
    existingByName.set(name, topic);
    return topic;
  }

  const patch: Partial<Topic> = {};
  if (found.order !== order) patch.order = order;
  if (found.archived) patch.archived = false;
  if (found.difficulty !== difficulty) patch.difficulty = difficulty;
  if (Object.keys(patch).length > 0) {
    patch.updatedAt = now;
    await db.topics.update(found.id, patch);
    const next = { ...found, ...patch };
    existingByName.set(name, next);
    return next;
  }
  return found;
}

async function syncModuleCurriculum(
  trackId: string,
  dbMod: Module,
  pathMod: PathModule
): Promise<void> {
  const now = nowISO();
  if (dbMod.name !== pathMod.name) {
    await db.modules.update(dbMod.id, { name: pathMod.name, updatedAt: now });
  }

  const allTopics = await db.topics.where("moduleId").equals(dbMod.id).toArray();
  const byName = new Map(allTopics.map((t) => [t.name, t]));
  const desired = desiredTopicNames(pathMod);
  let order = 0;

  for (const parsed of pathMod.topics) {
    const topic = await upsertTopic(
      trackId,
      dbMod.id,
      parsed.name,
      order++,
      "medium",
      byName
    );
    await syncSubtopics(trackId, dbMod.id, topic, parsed.subtopics);
  }

  for (const project of pathMod.projects ?? []) {
    const name = formatGoProjectTopicName(project);
    const topic = await upsertTopic(
      trackId,
      dbMod.id,
      name,
      order++,
      goProjectTierToDifficulty(project.tier),
      byName
    );
    await syncSubtopics(trackId, dbMod.id, topic, project.deliverables);
  }

  for (const topic of allTopics) {
    if (desired.has(topic.name) || topic.archived) continue;
    if (isProjectTopic(topic.name) && !desired.has(topic.name)) {
      await db.topics.update(topic.id, { archived: true, updatedAt: now });
      continue;
    }
    if (!desired.has(topic.name)) {
      await db.topics.update(topic.id, { archived: true, updatedAt: now });
    }
  }
}

function resolveDbModule(dbModules: Module[], pathMod: PathModule): Module | undefined {
  const legacyForThis = Object.entries(LEGACY_MODULE_NAMES)
    .filter(([, current]) => current === pathMod.name)
    .map(([legacy]) => legacy);
  return dbModules.find((m) => m.name === pathMod.name || legacyForThis.includes(m.name));
}

async function isGoBackendCurriculumStale(
  dbModules: Module[],
  pathModules: PathModule[]
): Promise<boolean> {
  for (const pathMod of pathModules) {
    const dbMod = resolveDbModule(dbModules, pathMod);
    if (!dbMod) continue;

    const topics = await db.topics.where("moduleId").equals(dbMod.id).toArray();
    const topicByName = new Map(topics.map((t) => [t.name, t]));

    for (const parsed of pathMod.topics) {
      const topic = topicByName.get(parsed.name);
      if (!topic || topic.archived) return true;

      const existing = await db.subtopics
        .where("topicId")
        .equals(topic.id)
        .filter((s) => !s.archived)
        .toArray();
      const names = new Set(existing.map((s) => s.name));
      if (parsed.subtopics.some((name) => !names.has(name))) return true;
    }

    for (const project of pathMod.projects ?? []) {
      const topicName = formatGoProjectTopicName(project);
      const topic = topicByName.get(topicName);
      if (!topic || topic.archived) return true;

      const existing = await db.subtopics
        .where("topicId")
        .equals(topic.id)
        .filter((s) => !s.archived)
        .toArray();
      const names = new Set(existing.map((s) => s.name));
      if (project.deliverables.some((name) => !names.has(name))) return true;
    }
  }

  return false;
}

/**
 * Align Development-track Go Backend modules (0–23) with GO_BACKEND_PATH.
 * Does not touch Boot.dev or any other track.
 */
export async function ensureGoBackendCurriculumSync(): Promise<void> {
  const settings = await db.settings.toCollection().first();

  const devTrack = await db.tracks.filter((t) => t.name === "Development").first();
  if (!devTrack) return;

  const pathModules = getGoBackendPathWithProjects();
  const dbModules = (await db.modules.where("trackId").equals(devTrack.id).toArray()).filter(
    (m) => !m.archived
  );

  const pathNames = new Set(pathModules.map((p) => p.name));
  const legacyNames = new Set(Object.keys(LEGACY_MODULE_NAMES));
  const hasGoPath = dbModules.some(
    (m) =>
      m.name === GO_BACKEND_PATH_MARKER ||
      pathNames.has(m.name) ||
      legacyNames.has(m.name)
  );
  if (!hasGoPath) return;

  const versionCurrent = settings?.goBackendCurriculumVersion === GO_BACKEND_CURRICULUM_VERSION;
  const stale = await isGoBackendCurriculumStale(dbModules, pathModules);
  if (versionCurrent && !stale) return;

  for (const pathMod of pathModules) {
    const dbMod = resolveDbModule(dbModules, pathMod);
    if (!dbMod) continue;

    await syncModuleCurriculum(devTrack.id, dbMod, pathMod);
  }

  if (settings) {
    await db.settings.update(settings.id, {
      goBackendCurriculumVersion: GO_BACKEND_CURRICULUM_VERSION,
    } satisfies Partial<AppSettings>);
  }
}
