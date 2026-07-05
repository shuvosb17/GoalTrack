import type { JournalLink, Module, Subtopic, Topic, Track } from "./types";
import type { JournalHierarchy } from "@/components/journal/hierarchy-picker";

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function getLinkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getLinkFavicon(url: string): string {
  const domain = getLinkDomain(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

export function suggestLinkTitle(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, "");
    const segment = pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\.[a-z0-9]+$/i, "");
    if (segment && segment.length > 2) {
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    return host;
  } catch {
    return "Resource link";
  }
}

export function getLinkDepth(
  link: Pick<JournalLink, "trackId" | "moduleId" | "topicId" | "subtopicId">
): JournalHierarchyLevel {
  if (!link.trackId) return "uncategorized";
  if (link.subtopicId) return "subtopic";
  if (link.topicId) return "topic";
  if (link.moduleId) return "module";
  return "track";
}

export type JournalHierarchyLevel = "track" | "module" | "topic" | "subtopic" | "uncategorized";

export const UNCATEGORIZED_GROUP_KEY = "__uncategorized__";

const LEVEL_LABELS: Record<JournalHierarchyLevel, string> = {
  track: "Track",
  module: "Module",
  topic: "Topic",
  subtopic: "Subtopic",
  uncategorized: "Uncategorized",
};

export function getLevelLabel(level: JournalHierarchyLevel) {
  return LEVEL_LABELS[level];
}

/** Parent links (track/module) surface when browsing deeper in the tree. */
export function linkVisibleForScope(link: JournalLink, scope: JournalHierarchy): boolean {
  if (scope.trackId && link.trackId !== scope.trackId) return false;
  if (!scope.trackId) return true;

  if (!link.moduleId) return true;
  if (!scope.moduleId) return false;
  if (link.moduleId !== scope.moduleId) return false;

  if (!link.topicId) return true;
  if (!scope.topicId) return false;
  if (link.topicId !== scope.topicId) return false;

  if (!link.subtopicId) return true;
  if (!scope.subtopicId) return false;
  return link.subtopicId === scope.subtopicId;
}

export function getLinkPathLabel(
  link: Pick<JournalLink, "trackId" | "moduleId" | "topicId" | "subtopicId">,
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): string {
  if (!link.trackId) return "No category assigned";
  const track = tracks.find((t) => t.id === link.trackId);
  const mod = link.moduleId ? modules.find((m) => m.id === link.moduleId) : undefined;
  const topic = link.topicId ? topics.find((t) => t.id === link.topicId) : undefined;
  const sub = link.subtopicId ? subtopics.find((s) => s.id === link.subtopicId) : undefined;
  return [track?.name, mod?.name, topic?.name, sub?.name].filter(Boolean).join(" → ");
}

export function getLinkGroupKey(link: Pick<JournalLink, "trackId">): string {
  return link.trackId || UNCATEGORIZED_GROUP_KEY;
}

export function linkMatchesSearch(link: JournalLink, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const label = (link.title || suggestLinkTitle(link.url)).toLowerCase();
  return label.includes(q) || link.url.toLowerCase().includes(q);
}

export function isScopeFilterActive(scope: JournalHierarchy): boolean {
  return Boolean(scope.trackId || scope.moduleId || scope.topicId || scope.subtopicId);
}

export function hierarchyFromLink(
  link: Pick<JournalLink, "trackId" | "moduleId" | "topicId" | "subtopicId">
): JournalHierarchy {
  return {
    trackId: link.trackId,
    moduleId: link.moduleId ?? "",
    topicId: link.topicId ?? "",
    subtopicId: link.subtopicId ?? "",
  };
}

export function buildLinkPayload(
  hierarchy: JournalHierarchy,
  url: string,
  title?: string
): Pick<JournalLink, "url" | "title" | "trackId" | "moduleId" | "topicId" | "subtopicId"> {
  return {
    url,
    title: title?.trim() || undefined,
    trackId: hierarchy.trackId || "",
    moduleId: hierarchy.trackId && hierarchy.moduleId ? hierarchy.moduleId : undefined,
    topicId: hierarchy.trackId && hierarchy.topicId ? hierarchy.topicId : undefined,
    subtopicId: hierarchy.trackId && hierarchy.subtopicId ? hierarchy.subtopicId : undefined,
  };
}
