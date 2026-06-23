import type { PatternNoteArticle } from "./types";
import { PATTERN_NOTES_CATALOG } from "./catalog";

type ArticleModule = { article: PatternNoteArticle };

const loaders: Record<string, () => Promise<ArticleModule>> = {
  "arrays-hashing": () => import("./content/arrays-hashing"),
  "two-pointers": () => import("./content/two-pointers"),
  "sliding-window": () => import("./content/sliding-window"),
  "binary-search": () => import("./content/binary-search"),
  stack: () => import("./content/stack"),
  "linked-list": () => import("./content/linked-list"),
  "trees-dfs-bfs": () => import("./content/trees-dfs-bfs"),
  bst: () => import("./content/bst"),
  heap: () => import("./content/heap"),
  backtracking: () => import("./content/backtracking"),
  "graph-bfs-dfs": () => import("./content/graph-bfs-dfs"),
  trie: () => import("./content/trie"),
  greedy: () => import("./content/greedy"),
  intervals: () => import("./content/intervals"),
  "dp-1d": () => import("./content/dp-1d"),
  "dp-2d": () => import("./content/dp-2d"),
  "union-find": () => import("./content/union-find"),
  "topological-sort": () => import("./content/topological-sort"),
  "monotonic-stack": () => import("./content/monotonic-stack"),
  "monotonic-queue": () => import("./content/monotonic-queue"),
  "bit-manipulation": () => import("./content/bit-manipulation"),
  "prefix-sum": () => import("./content/prefix-sum"),
  "math-number-theory": () => import("./content/math-number-theory"),
  "shortest-path": () => import("./content/shortest-path"),
  "advanced-dp": () => import("./content/advanced-dp"),
};

export async function loadPatternArticle(slug: string): Promise<PatternNoteArticle | null> {
  const loader = loaders[slug];
  if (!loader) return null;
  const mod = await loader();
  return mod.article;
}

export function getDefaultSlug(): string {
  return PATTERN_NOTES_CATALOG[0]?.slug ?? "arrays-hashing";
}

export function isValidSlug(slug: string): boolean {
  return slug in loaders;
}
