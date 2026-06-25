import { GO_BACKEND_PATH } from "../go-backend-path";
import type { GoResourceModule, GoResourceSubtopic } from "./types";
import { GO_BACKEND_RESOURCE_LINKS } from "./data.generated";

export function buildGoResourceId(
  moduleIndex: number,
  topicIndex: number,
  subtopicIndex: number
): string {
  return `m${moduleIndex}-t${topicIndex}-s${subtopicIndex}`;
}

export function buildGoBackendResourceCatalog(): GoResourceModule[] {
  return GO_BACKEND_PATH.map((mod, moduleIndex) => ({
    index: moduleIndex,
    name: mod.name,
    ongoing: mod.ongoing,
    topics: mod.topics.map((topic, topicIndex) => ({
      index: topicIndex,
      name: topic.name,
      subtopics: topic.subtopics.map((subtopicName, subtopicIndex) => {
        const id = buildGoResourceId(moduleIndex, topicIndex, subtopicIndex);
        const links = GO_BACKEND_RESOURCE_LINKS[id] ?? [];
        const entry: GoResourceSubtopic = {
          id,
          moduleIndex,
          topicIndex,
          subtopicIndex,
          moduleName: mod.name,
          topicName: topic.name,
          subtopicName,
          ongoing: mod.ongoing,
          links,
        };
        return entry;
      }),
    })),
  }));
}

export function flattenGoResourceSubtopics(
  catalog: GoResourceModule[]
): GoResourceSubtopic[] {
  return catalog.flatMap((mod) =>
    mod.topics.flatMap((topic) => topic.subtopics)
  );
}
