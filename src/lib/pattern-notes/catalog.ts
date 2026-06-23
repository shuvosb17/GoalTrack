import type { PatternNoteMeta } from "./types";

export const PATTERN_NOTES_CATALOG: PatternNoteMeta[] = [
  // Foundation (16)
  { slug: "arrays-hashing", title: "Arrays & Hashing", section: "foundation", order: 1, linkedPracticePattern: "Arrays & Hashing", estimatedReadMin: 18 },
  { slug: "two-pointers", title: "Two Pointers", section: "foundation", order: 2, linkedPracticePattern: "Two Pointers", estimatedReadMin: 16 },
  { slug: "sliding-window", title: "Sliding Window", section: "foundation", order: 3, linkedPracticePattern: "Sliding Window", estimatedReadMin: 17 },
  { slug: "binary-search", title: "Binary Search", section: "foundation", order: 4, linkedPracticePattern: "Binary Search", estimatedReadMin: 16 },
  { slug: "stack", title: "Stack", section: "foundation", order: 5, linkedPracticePattern: "Stack / Monotonic Stack", estimatedReadMin: 15 },
  { slug: "linked-list", title: "Linked List", section: "foundation", order: 6, linkedPracticePattern: "Linked List", estimatedReadMin: 16 },
  { slug: "trees-dfs-bfs", title: "Trees DFS/BFS", section: "foundation", order: 7, linkedPracticePattern: "Trees DFS/BFS", estimatedReadMin: 18 },
  { slug: "bst", title: "Binary Search Tree", section: "foundation", order: 8, linkedPracticePattern: "Trees DFS/BFS", estimatedReadMin: 14 },
  { slug: "heap", title: "Heap / Priority Queue", section: "foundation", order: 9, linkedPracticePattern: "Heap / Top K", estimatedReadMin: 15 },
  { slug: "backtracking", title: "Backtracking", section: "foundation", order: 10, linkedPracticePattern: "Backtracking", estimatedReadMin: 17 },
  { slug: "graph-bfs-dfs", title: "Graph BFS/DFS", section: "foundation", order: 11, linkedPracticePattern: "Graphs BFS/DFS", estimatedReadMin: 18 },
  { slug: "trie", title: "Trie", section: "foundation", order: 12, linkedPracticePattern: "Tries", estimatedReadMin: 14 },
  { slug: "greedy", title: "Greedy", section: "foundation", order: 13, linkedPracticePattern: "Greedy", estimatedReadMin: 15 },
  { slug: "intervals", title: "Intervals", section: "foundation", order: 14, linkedPracticePattern: "Greedy", estimatedReadMin: 14 },
  { slug: "dp-1d", title: "Dynamic Programming (1D)", section: "foundation", order: 15, linkedPracticePattern: "DP Basics", estimatedReadMin: 18 },
  { slug: "dp-2d", title: "Dynamic Programming (2D)", section: "foundation", order: 16, linkedPracticePattern: "DP Basics", estimatedReadMin: 18 },
  // Advanced (9)
  { slug: "union-find", title: "Union Find (DSU)", section: "advanced", order: 17, linkedPracticePattern: "Union-Find & Topological Sort", estimatedReadMin: 15 },
  { slug: "topological-sort", title: "Topological Sort", section: "advanced", order: 18, linkedPracticePattern: "Union-Find & Topological Sort", estimatedReadMin: 15 },
  { slug: "monotonic-stack", title: "Monotonic Stack", section: "advanced", order: 19, linkedPracticePattern: "Stack / Monotonic Stack", estimatedReadMin: 15 },
  { slug: "monotonic-queue", title: "Monotonic Queue", section: "advanced", order: 20, estimatedReadMin: 14 },
  { slug: "bit-manipulation", title: "Bit Manipulation", section: "advanced", order: 21, linkedPracticePattern: "Bit Manipulation", estimatedReadMin: 14 },
  { slug: "prefix-sum", title: "Prefix Sum", section: "advanced", order: 22, estimatedReadMin: 14 },
  { slug: "math-number-theory", title: "Math & Number Theory", section: "advanced", order: 23, linkedPracticePattern: "Math & Number Theory", estimatedReadMin: 15 },
  { slug: "shortest-path", title: "Shortest Path Algorithms", section: "advanced", order: 24, linkedPracticePattern: "Graphs Shortest Path / Dijkstra", estimatedReadMin: 17 },
  { slug: "advanced-dp", title: "Advanced DP", section: "advanced", order: 25, linkedPracticePattern: "Advanced DP", estimatedReadMin: 18 },
];

export function getPatternNoteMeta(slug: string): PatternNoteMeta | undefined {
  return PATTERN_NOTES_CATALOG.find((p) => p.slug === slug);
}

export function getGuideSlugForPractice(name: string): string | undefined {
  const matches = PATTERN_NOTES_CATALOG.filter((p) => p.linkedPracticePattern === name);
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => a.order - b.order)[0].slug;
}

export function getCatalogBySection(section: PatternNoteMeta["section"]): PatternNoteMeta[] {
  return PATTERN_NOTES_CATALOG.filter((p) => p.section === section).sort((a, b) => a.order - b.order);
}
