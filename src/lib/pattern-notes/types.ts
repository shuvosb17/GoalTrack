export type PatternNoteSection = "foundation" | "advanced";

export type VizId =
  | "frequency-count"
  | "two-pointer-opposite"
  | "sliding-window-expand-shrink"
  | "binary-search-space"
  | "stack-monotonic"
  | "linked-list-fast-slow"
  | "tree-traversals"
  | "heap-top-k"
  | "backtracking-tree"
  | "graph-bfs-dfs"
  | "trie-prefix"
  | "union-find"
  | "topo-sort"
  | "dp-state-table"
  | "bit-xor"
  | "prefix-sum"
  | "greedy-choice"
  | "interval-merge"
  | "monotonic-queue";

export interface PatternNoteMeta {
  slug: string;
  title: string;
  section: PatternNoteSection;
  order: number;
  linkedPracticePattern?: string;
  estimatedReadMin: number;
}

export type NoteBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "prose"; markdown: string }
  | { type: "callout"; variant: "insight" | "tip" | "warning"; title?: string; markdown: string }
  | { type: "code"; language: "cpp"; code: string; caption?: string }
  | { type: "viz"; viz: VizId }
  | { type: "subpatterns"; items: { name: string; description: string }[] }
  | {
      type: "problems";
      items: { title: string; slug: string; difficulty: string; note: string }[];
    }
  | { type: "complexity"; rows: { operation: string; time: string; space: string }[] };

export interface PatternNoteArticle {
  meta: PatternNoteMeta;
  summary: string;
  blocks: NoteBlock[];
}

export interface PatternNoteContentInput {
  meta: PatternNoteMeta;
  summary: string;
  intuition: string;
  /** Extra paragraphs after intuition — deeper conceptual coverage. */
  deepDive?: string;
  signals: string[];
  subpatterns: { name: string; description: string }[];
  templateCode: { language: "cpp"; code: string; caption?: string };
  /** Optional second template for a common variant. */
  variantCode?: { title: string; language: "cpp"; code: string; caption?: string };
  viz?: VizId;
  walkthrough: string;
  /** Step-by-step approach for interviews. */
  steps?: string[];
  problems: { title: string; slug: string; difficulty: string; note: string }[];
  pitfalls: string;
  interviewTips?: string;
  complexity: { operation: string; time: string; space: string }[];
}
