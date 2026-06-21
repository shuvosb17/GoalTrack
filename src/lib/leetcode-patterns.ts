import type {
  LeetcodePatternMeta,
  LeetcodeSampleProblem,
  LeetCodeDifficulty,
  LeetcodeTag,
  LeetcodeTier,
} from "./types/metrics";

export interface LeetcodePatternDefinition extends LeetcodePatternMeta {
  sampleProblems: LeetcodeSampleProblem[];
  isCore: boolean;
}

export interface CsFundamentalDefinition {
  category: "OOP" | "DBMS" | "DS";
  title: string;
}

export const LEETCODE_TAG_LABELS: Record<LeetcodeTag, string> = {
  "BD-CORE": "BD Core",
  "BD-CP": "BD CP",
  MAANG: "MAANG",
  "BD-ADV": "BD Advanced",
};

export const LEETCODE_TIER_LABELS: Record<LeetcodeTier, string> = {
  foundation: "Foundation",
  strong: "Strong",
  competitive: "Competitive-edge",
  useful: "Useful",
  specialist: "Specialist",
};

export const LEETCODE_TIER_ORDER: LeetcodeTier[] = [
  "foundation",
  "strong",
  "competitive",
  "useful",
  "specialist",
];

function p(title: string, slug: string, difficulty: LeetCodeDifficulty): LeetcodeSampleProblem {
  return { title, url: `https://leetcode.com/problems/${slug}/`, difficulty };
}

/** Curated sheet: Blind 75 + NeetCode 150 overlap, weighted for BD tech interviews. */
export const LEETCODE_PATTERNS: LeetcodePatternDefinition[] = [
  {
    name: "Arrays & Hashing",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Two Sum", "two-sum", "easy"),
      p("Contains Duplicate", "contains-duplicate", "easy"),
      p("Valid Anagram", "valid-anagram", "easy"),
      p("Group Anagrams", "group-anagrams", "medium"),
      p("Top K Frequent Elements", "top-k-frequent-elements", "medium"),
      p("Product of Array Except Self", "product-of-array-except-self", "medium"),
      p("Longest Consecutive Sequence", "longest-consecutive-sequence", "medium"),
      p("Encode and Decode Strings", "encode-and-decode-strings", "medium"),
    ],
  },
  {
    name: "Two Pointers",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Valid Palindrome", "valid-palindrome", "easy"),
      p("Two Sum II - Input Array Is Sorted", "two-sum-ii-input-array-is-sorted", "medium"),
      p("3Sum", "3sum", "medium"),
      p("Container With Most Water", "container-with-most-water", "medium"),
      p("Trapping Rain Water", "trapping-rain-water", "hard"),
    ],
  },
  {
    name: "Sliding Window",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "easy"),
      p("Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "medium"),
      p("Longest Repeating Character Replacement", "longest-repeating-character-replacement", "medium"),
      p("Permutation in String", "permutation-in-string", "medium"),
      p("Minimum Window Substring", "minimum-window-substring", "hard"),
      p("Sliding Window Maximum", "sliding-window-maximum", "hard"),
    ],
  },
  {
    name: "Binary Search",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Binary Search", "binary-search", "easy"),
      p("Search a 2D Matrix", "search-a-2d-matrix", "medium"),
      p("Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "medium"),
      p("Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", "medium"),
      p("Koko Eating Bananas", "koko-eating-bananas", "medium"),
      p("Median of Two Sorted Arrays", "median-of-two-sorted-arrays", "hard"),
    ],
  },
  {
    name: "Trees DFS/BFS",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "easy"),
      p("Same Tree", "same-tree", "easy"),
      p("Invert Binary Tree", "invert-binary-tree", "easy"),
      p("Subtree of Another Tree", "subtree-of-another-tree", "easy"),
      p("Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "medium"),
      p("Validate Binary Search Tree", "validate-binary-search-tree", "medium"),
      p("Kth Smallest Element in a BST", "kth-smallest-element-in-a-bst", "medium"),
      p("Construct Binary Tree from Preorder and Inorder Traversal", "construct-binary-tree-from-preorder-and-inorder-traversal", "medium"),
      p("Binary Tree Maximum Path Sum", "binary-tree-maximum-path-sum", "hard"),
      p("Lowest Common Ancestor of a Binary Tree", "lowest-common-ancestor-of-a-binary-tree", "medium"),
      p("Diameter of Binary Tree", "diameter-of-binary-tree", "easy"),
      p("Balanced Binary Tree", "balanced-binary-tree", "easy"),
    ],
  },
  {
    name: "Graphs BFS/DFS",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Number of Islands", "number-of-islands", "medium"),
      p("Clone Graph", "clone-graph", "medium"),
      p("Course Schedule", "course-schedule", "medium"),
      p("Pacific Atlantic Water Flow", "pacific-atlantic-water-flow", "medium"),
      p("Rotting Oranges", "rotting-oranges", "medium"),
      p("Walls and Gates", "walls-and-gates", "medium"),
      p("Max Area of Island", "max-area-of-island", "medium"),
    ],
  },
  {
    name: "DP Basics",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG", "BD-CP"],
    isCore: true,
    sampleProblems: [
      p("Climbing Stairs", "climbing-stairs", "easy"),
      p("Min Cost Climbing Stairs", "min-cost-climbing-stairs", "easy"),
      p("House Robber", "house-robber", "medium"),
      p("House Robber II", "house-robber-ii", "medium"),
      p("Coin Change", "coin-change", "medium"),
      p("Unique Paths", "unique-paths", "medium"),
      p("Longest Palindromic Substring", "longest-palindromic-substring", "medium"),
      p("Word Break", "word-break", "medium"),
      p("Decode Ways", "decode-ways", "medium"),
    ],
  },
  {
    name: "Stack / Monotonic Stack",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Valid Parentheses", "valid-parentheses", "easy"),
      p("Min Stack", "min-stack", "medium"),
      p("Evaluate Reverse Polish Notation", "evaluate-reverse-polish-notation", "medium"),
      p("Daily Temperatures", "daily-temperatures", "medium"),
      p("Largest Rectangle in Histogram", "largest-rectangle-in-histogram", "hard"),
      p("Car Fleet", "car-fleet", "medium"),
    ],
  },
  {
    name: "Linked List",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Reverse Linked List", "reverse-linked-list", "easy"),
      p("Merge Two Sorted Lists", "merge-two-sorted-lists", "easy"),
      p("Linked List Cycle", "linked-list-cycle", "easy"),
      p("Reorder List", "reorder-list", "medium"),
      p("Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "medium"),
      p("Copy List with Random Pointer", "copy-list-with-random-pointer", "medium"),
      p("Add Two Numbers", "add-two-numbers", "medium"),
      p("Find the Duplicate Number", "find-the-duplicate-number", "medium"),
    ],
  },
  {
    name: "Heap / Top K",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Kth Largest Element in an Array", "kth-largest-element-in-an-array", "medium"),
      p("Last Stone Weight", "last-stone-weight", "easy"),
      p("K Closest Points to Origin", "k-closest-points-to-origin", "medium"),
      p("Task Scheduler", "task-scheduler", "medium"),
      p("Find Median from Data Stream", "find-median-from-data-stream", "hard"),
      p("Merge k Sorted Lists", "merge-k-sorted-lists", "hard"),
    ],
  },
  {
    name: "Backtracking",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Subsets", "subsets", "medium"),
      p("Subsets II", "subsets-ii", "medium"),
      p("Permutations", "permutations", "medium"),
      p("Combination Sum", "combination-sum", "medium"),
      p("Combination Sum II", "combination-sum-ii", "medium"),
      p("Word Search", "word-search", "medium"),
      p("Letter Combinations of a Phone Number", "letter-combinations-of-a-phone-number", "medium"),
      p("Palindrome Partitioning", "palindrome-partitioning", "medium"),
    ],
  },
  {
    name: "Graphs Shortest Path / Dijkstra",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      p("Network Delay Time", "network-delay-time", "medium"),
      p("Cheapest Flights Within K Stops", "cheapest-flights-within-k-stops", "medium"),
      p("Path With Minimum Effort", "path-with-minimum-effort", "medium"),
      p("Swim in Rising Water", "swim-in-rising-water", "hard"),
    ],
  },
  {
    name: "Greedy",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      p("Maximum Subarray", "maximum-subarray", "medium"),
      p("Jump Game", "jump-game", "medium"),
      p("Jump Game II", "jump-game-ii", "medium"),
      p("Gas Station", "gas-station", "medium"),
      p("Merge Intervals", "merge-intervals", "medium"),
      p("Non-overlapping Intervals", "non-overlapping-intervals", "medium"),
      p("Hand of Straights", "hand-of-straights", "medium"),
      p("Partition Labels", "partition-labels", "medium"),
    ],
  },
  {
    name: "Math & Number Theory",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      p("Plus One", "plus-one", "easy"),
      p("Happy Number", "happy-number", "easy"),
      p("Greatest Common Divisor of Strings", "greatest-common-divisor-of-strings", "easy"),
      p("Count Primes", "count-primes", "medium"),
      p("Pow(x, n)", "powx-n", "medium"),
      p("Multiply Strings", "multiply-strings", "medium"),
      p("Reverse Integer", "reverse-integer", "medium"),
    ],
  },
  {
    name: "Advanced DP",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      p("Longest Increasing Subsequence", "longest-increasing-subsequence", "medium"),
      p("Longest Common Subsequence", "longest-common-subsequence", "medium"),
      p("Partition Equal Subset Sum", "partition-equal-subset-sum", "medium"),
      p("Target Sum", "target-sum", "medium"),
      p("Coin Change II", "coin-change-ii", "medium"),
      p("Edit Distance", "edit-distance", "medium"),
      p("Distinct Subsequences", "distinct-subsequences", "hard"),
      p("Best Time to Buy and Sell Stock with Cooldown", "best-time-to-buy-and-sell-stock-with-cooldown", "medium"),
    ],
  },
  {
    name: "Bit Manipulation",
    tier: "useful",
    importance: 2,
    tags: ["BD-CP", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Single Number", "single-number", "easy"),
      p("Number of 1 Bits", "number-of-1-bits", "easy"),
      p("Counting Bits", "counting-bits", "easy"),
      p("Reverse Bits", "reverse-bits", "easy"),
      p("Missing Number", "missing-number", "easy"),
      p("Sum of Two Integers", "sum-of-two-integers", "medium"),
    ],
  },
  {
    name: "Union-Find & Topological Sort",
    tier: "useful",
    importance: 2,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      p("Course Schedule II", "course-schedule-ii", "medium"),
      p("Redundant Connection", "redundant-connection", "medium"),
      p("Accounts Merge", "accounts-merge", "medium"),
      p("Graph Valid Tree", "graph-valid-tree", "medium"),
      p("Number of Connected Components in an Undirected Graph", "number-of-connected-components-in-an-undirected-graph", "medium"),
    ],
  },
  {
    name: "Tries",
    tier: "useful",
    importance: 2,
    tags: ["MAANG", "BD-ADV"],
    isCore: true,
    sampleProblems: [
      p("Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", "medium"),
      p("Design Add and Search Words Data Structure", "design-add-and-search-words-data-structure", "medium"),
      p("Word Search II", "word-search-ii", "hard"),
    ],
  },
  {
    name: "String Algorithms",
    tier: "specialist",
    importance: 2,
    tags: ["BD-ADV"],
    isCore: true,
    sampleProblems: [
      p("Find the Index of the First Occurrence in a String", "find-the-index-of-the-first-occurrence-in-a-string", "easy"),
      p("Palindromic Substrings", "palindromic-substrings", "medium"),
      p("Valid Parentheses String", "valid-parentheses-string", "medium"),
      p("Repeated DNA Sequences", "repeated-dna-sequences", "medium"),
    ],
  },
  {
    name: "Segment Tree / Fenwick Tree",
    tier: "specialist",
    importance: 1,
    tags: ["BD-ADV"],
    isCore: true,
    sampleProblems: [
      p("Range Sum Query - Immutable", "range-sum-query-immutable", "easy"),
      p("Range Sum Query - Mutable", "range-sum-query-mutable", "medium"),
      p("Range Sum Query 2D - Immutable", "range-sum-query-2d-immutable", "medium"),
    ],
  },
];

export const CS_FUNDAMENTALS: CsFundamentalDefinition[] = [
  { category: "OOP", title: "Encapsulation — data hiding and access modifiers" },
  { category: "OOP", title: "Inheritance — IS-A relationships and code reuse" },
  { category: "OOP", title: "Polymorphism — runtime vs compile-time" },
  { category: "OOP", title: "Abstraction — interfaces vs abstract classes" },
  { category: "OOP", title: "Composition vs inheritance — when to use each" },
  { category: "OOP", title: "Method overloading vs overriding" },
  { category: "OOP", title: "SOLID principles (SRP, OCP, LSP, ISP, DIP)" },
  { category: "DBMS", title: "Normalization — 1NF, 2NF, 3NF, BCNF" },
  { category: "DBMS", title: "SQL joins — INNER, LEFT, RIGHT, FULL" },
  { category: "DBMS", title: "Indexing — B-tree, hash, composite indexes" },
  { category: "DBMS", title: "ACID properties and isolation levels" },
  { category: "DBMS", title: "Transactions — commit, rollback, deadlocks" },
  { category: "DBMS", title: "Primary, foreign, and composite keys" },
  { category: "DBMS", title: "GROUP BY, HAVING, and aggregate functions" },
  { category: "DBMS", title: "Subqueries vs joins — when to use each" },
  { category: "DS", title: "Big-O of array, hash map, heap, tree operations" },
  { category: "DS", title: "Hashing — collision resolution, load factor" },
  { category: "DS", title: "Tree properties — BST invariants, heap ordering" },
  { category: "DS", title: "Array vs linked list — tradeoffs" },
  { category: "DS", title: "Stack vs queue — use cases" },
  { category: "DS", title: "BFS vs DFS — when to use each" },
  { category: "DS", title: "Sorting algorithms — time/space complexity" },
];

export type LeetcodeTagFilter = LeetcodeTag | "all";

export function getPatternByName(name: string): LeetcodePatternDefinition | undefined {
  return LEETCODE_PATTERNS.find((p) => p.name === name);
}

export function filterPatternsByTag(tag: LeetcodeTagFilter): LeetcodePatternDefinition[] {
  if (tag === "all") return LEETCODE_PATTERNS;
  return LEETCODE_PATTERNS.filter((p) => p.tags.includes(tag));
}

export function patternHasTag(patternName: string, tag: LeetcodeTagFilter): boolean {
  if (tag === "all") return true;
  const pattern = getPatternByName(patternName);
  return pattern?.tags.includes(tag) ?? false;
}

export function sortPatternsByImportance(
  patterns: LeetcodePatternDefinition[]
): LeetcodePatternDefinition[] {
  return [...patterns].sort((a, b) => b.importance - a.importance);
}

export function groupPatternsByTier(
  patterns: LeetcodePatternDefinition[]
): Record<LeetcodeTier, LeetcodePatternDefinition[]> {
  const grouped = Object.fromEntries(
    LEETCODE_TIER_ORDER.map((tier) => [tier, [] as LeetcodePatternDefinition[]])
  ) as Record<LeetcodeTier, LeetcodePatternDefinition[]>;

  for (const pattern of patterns) {
    grouped[pattern.tier].push(pattern);
  }

  for (const tier of LEETCODE_TIER_ORDER) {
    grouped[tier] = sortPatternsByImportance(grouped[tier]);
  }

  return grouped;
}

/** Stable key for deduplicating seeded core problems. */
export function coreProblemKey(pattern: string, title: string): string {
  return `${pattern}::${title.trim().toLowerCase()}`;
}

export function coreCsItemKey(category: string, title: string): string {
  return `${category}::${title.trim().toLowerCase()}`;
}
