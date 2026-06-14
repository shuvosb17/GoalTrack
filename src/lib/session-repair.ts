import { db } from "./db";
import type { LearningSession, Module, Subtopic, Topic } from "./types";

/** Strip hierarchy ids that belong to a different track than the session. */
function getSessionHierarchyFix(
  session: LearningSession,
  topics: Topic[],
  modules: Module[],
  subtopics: Subtopic[]
): LearningSession | null {
  if (!session.trackId) return null;

  let stripSubtopic = false;
  let stripTopic = false;
  let stripModule = false;

  const sub = session.subtopicId
    ? subtopics.find((s) => s.id === session.subtopicId)
    : undefined;
  if (sub && sub.trackId !== session.trackId) {
    stripSubtopic = true;
    stripTopic = true;
  }

  const topic = session.topicId
    ? topics.find((t) => t.id === session.topicId)
    : sub
      ? topics.find((t) => t.id === sub.topicId)
      : undefined;
  if (!stripTopic && topic && topic.trackId !== session.trackId) {
    stripTopic = true;
    stripSubtopic = true;
  }

  const mod = session.moduleId
    ? modules.find((m) => m.id === session.moduleId)
    : undefined;
  if (mod && mod.trackId !== session.trackId) {
    stripModule = true;
  }

  if (!stripSubtopic && !stripTopic && !stripModule) return null;

  const updated: LearningSession = { ...session };
  if (stripSubtopic) delete updated.subtopicId;
  if (stripTopic) delete updated.topicId;
  if (stripModule) delete updated.moduleId;
  return updated;
}

/** One-time repair for sessions saved with stale topic/subtopic ids from the timer leak. */
export async function repairMisattributedSessions(): Promise<number> {
  const [sessions, topics, modules, subtopics] = await Promise.all([
    db.sessions.toArray(),
    db.topics.toArray(),
    db.modules.toArray(),
    db.subtopics.toArray(),
  ]);

  let fixed = 0;
  for (const session of sessions) {
    const updated = getSessionHierarchyFix(session, topics, modules, subtopics);
    if (!updated) continue;
    await db.sessions.put(updated);
    fixed++;
  }
  return fixed;
}
