import type { GoPathProject } from "./go-backend-path";
import {
  formatGoProjectTopicName,
  goProjectTierToDifficulty,
  withGoBackendProjects,
} from "./go-backend-projects";
import { GO_BACKEND_PATH } from "./go-backend-path";
import type { ParsedTopic } from "./md-import";

export function getGoBackendPathWithProjects() {
  return withGoBackendProjects(GO_BACKEND_PATH);
}

export function goProjectsToParsedTopics(projects: GoPathProject[]): ParsedTopic[] {
  return projects.map((project) => ({
    name: formatGoProjectTopicName(project),
    subtopics: project.deliverables,
    difficulty: goProjectTierToDifficulty(project.tier),
  }));
}

export function moduleTopicsWithProjects(
  topics: { name: string; subtopics: string[] }[],
  projects: GoPathProject[] = []
): ParsedTopic[] {
  const conceptTopics: ParsedTopic[] = topics.map((t) => ({
    name: t.name,
    subtopics: t.subtopics,
  }));
  return [...conceptTopics, ...goProjectsToParsedTopics(projects)];
}

export function countGoBackendProjects(): number {
  return getGoBackendPathWithProjects().reduce(
    (sum, mod) => sum + (mod.projects?.length ?? 0),
    0
  );
}
