import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Topic, Subtopic } from "./types";
import { nowISO } from "./utils";

export interface ParsedTopic {
  name: string;
  subtopics: string[];
}

export interface ParsedModule {
  name: string;
  topics: ParsedTopic[];
}

export interface MdParseResult {
  modules: ParsedModule[];
  flatTopics: ParsedTopic[];
  mode: "module" | "track";
}

/** Parse MD for import into an existing module: ## Topic, - subtopics */
export function parseMarkdownForModule(content: string): ParsedTopic[] {
  const lines = content.split("\n");
  const topics: ParsedTopic[] = [];
  let current: ParsedTopic | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("```")) continue;

    const topicMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (topicMatch) {
      current = { name: cleanMdText(topicMatch[1]), subtopics: [] };
      topics.push(current);
      continue;
    }

    const listMatch = trimmed.match(/^[-*+]\s+\[?[ xX]?\]?\s*(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      if (!current) current = { name: "General", subtopics: [] };
      if (!topics.includes(current)) topics.push(current);
      current.subtopics.push(cleanMdText(listMatch[1]));
      continue;
    }

    const subHeading = trimmed.match(/^#{4,6}\s+(.+)$/);
    if (subHeading) {
      if (!current) current = { name: "General", subtopics: [] };
      if (!topics.includes(current)) topics.push(current);
      current.subtopics.push(cleanMdText(subHeading[1]));
    }
  }

  return topics.filter((t) => t.name);
}

/** Parse MD for full track import: # Module, ## Topic, - subtopics */
export function parseMarkdownForTrack(content: string): ParsedModule[] {
  const lines = content.split("\n");
  const modules: ParsedModule[] = [];
  let currentModule: ParsedModule | null = null;
  let currentTopic: ParsedTopic | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("```")) continue;

    const h1 = trimmed.match(/^#\s+(.+)$/);
    if (h1) {
      currentModule = { name: cleanMdText(h1[1]), topics: [] };
      modules.push(currentModule);
      currentTopic = null;
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      if (!currentModule) {
        currentModule = { name: "Imported Module", topics: [] };
        modules.push(currentModule);
      }
      currentTopic = { name: cleanMdText(h2[1]), subtopics: [] };
      currentModule.topics.push(currentTopic);
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      if (!currentModule) {
        currentModule = { name: "Imported Module", topics: [] };
        modules.push(currentModule);
      }
      currentTopic = { name: cleanMdText(h3[1]), subtopics: [] };
      currentModule.topics.push(currentTopic);
      continue;
    }

    const listMatch = trimmed.match(/^[-*+]\s+\[?[ xX]?\]?\s*(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      if (!currentModule) {
        currentModule = { name: "Imported Module", topics: [] };
        modules.push(currentModule);
      }
      if (!currentTopic) {
        currentTopic = { name: "General", subtopics: [] };
        currentModule.topics.push(currentTopic);
      }
      currentTopic.subtopics.push(cleanMdText(listMatch[1]));
    }
  }

  return modules.filter((m) => m.name);
}

function cleanMdText(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();
}

export function previewMdImport(content: string, mode: "module" | "track"): MdParseResult {
  if (mode === "module") {
    return { modules: [], flatTopics: parseMarkdownForModule(content), mode: "module" };
  }
  return { modules: parseMarkdownForTrack(content), flatTopics: [], mode: "track" };
}

export async function importMdIntoModule(
  trackId: string,
  moduleId: string,
  topics: ParsedTopic[]
): Promise<{ topics: number; subtopics: number }> {
  const now = nowISO();
  const existingTopics = await db.topics.where("moduleId").equals(moduleId).count();
  let topicOrder = existingTopics;
  let subtopicCount = 0;

  const newTopics: Topic[] = [];
  const newSubtopics: Subtopic[] = [];

  for (const parsed of topics) {
    const topic: Topic = {
      id: uuid(),
      moduleId,
      trackId,
      name: parsed.name,
      difficulty: "medium",
      status: "not_started",
      order: topicOrder++,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    newTopics.push(topic);

    parsed.subtopics.forEach((subName, i) => {
      newSubtopics.push({
        id: uuid(),
        topicId: topic.id,
        moduleId,
        trackId,
        name: subName,
        status: "not_started",
        difficulty: "medium",
        order: i,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
      subtopicCount++;
    });

    if (parsed.subtopics.length === 0) {
      newSubtopics.push({
        id: uuid(),
        topicId: topic.id,
        moduleId,
        trackId,
        name: parsed.name,
        status: "not_started",
        difficulty: "medium",
        order: 0,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
      subtopicCount++;
    }
  }

  await db.transaction("rw", [db.topics, db.subtopics], async () => {
    await db.topics.bulkAdd(newTopics);
    await db.subtopics.bulkAdd(newSubtopics);
  });

  return { topics: newTopics.length, subtopics: subtopicCount };
}

export async function importMdIntoTrack(
  trackId: string,
  modules: ParsedModule[]
): Promise<{ modules: number; topics: number; subtopics: number }> {
  const now = nowISO();
  const existingModules = await db.modules.where("trackId").equals(trackId).count();
  let moduleOrder = existingModules;
  let topicCount = 0;
  let subtopicCount = 0;

  for (const parsed of modules) {
    const moduleId = uuid();
    await db.modules.add({
      id: moduleId,
      trackId,
      name: parsed.name,
      order: moduleOrder++,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });

    const result = await importMdIntoModule(trackId, moduleId, parsed.topics);
    topicCount += result.topics;
    subtopicCount += result.subtopics;
  }

  return { modules: modules.length, topics: topicCount, subtopics: subtopicCount };
}

export const MD_IMPORT_EXAMPLE = `## Golang
- Concurrency
- Goroutines
- Channels
- Worker Pools

## Databases
- PostgreSQL
- Query Optimization
- Indexing Strategies`;

export const MD_TRACK_EXAMPLE = `# Backend Engineering
## Golang
- Concurrency
- Goroutines

## Databases
- PostgreSQL
- Indexing

# DevOps
## Docker
- Containers
- Compose`;
