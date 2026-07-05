import { v4 as uuid } from "uuid";
import { db } from "./db";
import { GIT_GITHUB_SUBTOPICS, GO_BACKEND_PATH_MARKER } from "./go-backend-path";
import type { Subtopic } from "./types";
import { nowISO } from "./utils";

const TOPIC_NAME = "Topic 0.3: Git & GitHub";
const GIT_GITHUB_SUBTOPIC_SET = new Set<string>(GIT_GITHUB_SUBTOPICS);

function subtopicIndex(name: string): number {
  return GIT_GITHUB_SUBTOPICS.findIndex((entry) => entry === name);
}

/** Legacy English subtopic titles before Bengali curriculum sync. */
const LEGACY_SUBTOPIC_NAMES = new Set([
  "What version control is and why",
  "`git init`, `git clone`",
  "Working dir → staging → commit",
  "`git add/commit/status/log/diff`",
  "Branches: `branch`, `switch`, `merge`",
  "Remotes: `push`, `pull`, `fetch`",
  "Pull requests & code review flow",
  "Merge conflicts and resolution",
  "`.gitignore`",
  "Commit hygiene",
  "Trunk-based vs GitFlow",
]);

/** Map legacy titles to the closest Bengali lesson (preserves subtopic IDs + sessions). */
const LEGACY_TO_BENGALI: Record<string, string> = {
  "What version control is and why": "01 গিট কি?",
  "`git init`, `git clone`": "02 গিট রিপোজিটরি সেটআপ",
  "Working dir → staging → commit": "04 স্টেজিং এরিয়াতে নেওয়া",
  "`git add/commit/status/log/diff`": "03 স্ট্যাটাস চেক করা",
  "Branches: `branch`, `switch`, `merge`": "10 ব্রাঞ্চ তৈরি",
  "Remotes: `push`, `pull`, `fetch`": "01 গিটহাবে পুশ",
  "Pull requests & code review flow": "04 নিজের প্রোজেক্টে পুল রিকোয়েস্ট",
  "Merge conflicts and resolution": "13 ব্রাঞ্চ মেইনে মার্জ",
  "`.gitignore`": "00 গিট রিস্টোর",
  "Commit hygiene": "05 ফাইল কমিট করা",
  "Trunk-based vs GitFlow": "04 গিট রিবেস",
};

function subtopicHasActivity(
  sub: Subtopic,
  sessionCountBySubId: Map<string, number>
): boolean {
  return (
    (sessionCountBySubId.get(sub.id) ?? 0) > 0 ||
    sub.status !== "not_started" ||
    !!sub.dueDate
  );
}

function isFullyMigrated(subtopics: Subtopic[]): boolean {
  const names = new Set(subtopics.map((s) => s.name));
  return (
    GIT_GITHUB_SUBTOPICS.every((name) => names.has(name)) &&
    subtopics.length === GIT_GITHUB_SUBTOPICS.length
  );
}

function isBengaliSubtopicName(name: string): boolean {
  return GIT_GITHUB_SUBTOPIC_SET.has(name);
}

function needsMigration(subtopics: Subtopic[]): boolean {
  if (subtopics.length === 0) return false;
  if (isFullyMigrated(subtopics)) return false;
  return subtopics.some(
    (s) => LEGACY_SUBTOPIC_NAMES.has(s.name) || isBengaliSubtopicName(s.name)
  );
}

/**
 * Replace Topic 0.3 subtopics with the Bengali Git/GitHub curriculum.
 * Renames active subtopics in place so session time logs stay attached.
 */
export async function ensureGitGithubSubtopics(): Promise<void> {
  const devTrack = await db.tracks.filter((t) => t.name === "Development").first();
  if (!devTrack) return;

  const mod = await db.modules
    .where("trackId")
    .equals(devTrack.id)
    .filter((m) => m.name === GO_BACKEND_PATH_MARKER && !m.archived)
    .first();
  if (!mod) return;

  const topic = await db.topics
    .where("moduleId")
    .equals(mod.id)
    .filter((t) => t.name === TOPIC_NAME && !t.archived)
    .first();
  if (!topic) return;

  const existing = (await db.subtopics.where("topicId").equals(topic.id).toArray())
    .filter((s) => !s.archived)
    .sort((a, b) => a.order - b.order);

  if (!needsMigration(existing)) return;

  const sessions = await db.sessions.where("topicId").equals(topic.id).toArray();
  const sessionCountBySubId = new Map<string, number>();
  for (const session of sessions) {
    if (!session.subtopicId) continue;
    sessionCountBySubId.set(
      session.subtopicId,
      (sessionCountBySubId.get(session.subtopicId) ?? 0) + 1
    );
  }

  const now = nowISO();
  const usedNames = new Set<string>();
  const difficulty = topic.difficulty ?? "medium";

  await db.transaction("rw", db.subtopics, async () => {
    for (const old of existing) {
      const active = subtopicHasActivity(old, sessionCountBySubId);

      if (!active) {
        await db.subtopics.delete(old.id);
        continue;
      }

      let targetName = LEGACY_TO_BENGALI[old.name] ?? old.name;
      if (usedNames.has(targetName) || !GIT_GITHUB_SUBTOPIC_SET.has(targetName)) {
        targetName =
          GIT_GITHUB_SUBTOPICS.find((name) => !usedNames.has(name)) ?? targetName;
      }

      usedNames.add(targetName);
      await db.subtopics.update(old.id, {
        name: targetName,
        order: subtopicIndex(targetName),
        updatedAt: now,
      });
    }

    const toInsert: Subtopic[] = [];
    for (let i = 0; i < GIT_GITHUB_SUBTOPICS.length; i++) {
      const name = GIT_GITHUB_SUBTOPICS[i];
      if (usedNames.has(name)) continue;
      toInsert.push({
        id: uuid(),
        topicId: topic.id,
        moduleId: mod.id,
        trackId: devTrack.id,
        name,
        status: "not_started",
        difficulty,
        order: i,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (toInsert.length > 0) {
      await db.subtopics.bulkAdd(toInsert);
    }

    const finalSubs = await db.subtopics.where("topicId").equals(topic.id).toArray();
    for (const sub of finalSubs) {
      const idx = subtopicIndex(sub.name);
      if (idx >= 0 && sub.order !== idx) {
        await db.subtopics.update(sub.id, { order: idx, updatedAt: now });
      }
    }
  });
}
