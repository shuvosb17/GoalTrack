import type {
  LeetcodePatternMeta,
  LeetcodeSampleProblem,
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

export const LEETCODE_PATTERNS: LeetcodePatternDefinition[] = [
  {
    name: "Arrays & Hashing",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "easy" },
      { title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", difficulty: "medium" },
      { title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "medium" },
    ],
  },
  {
    name: "Two Pointers",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "medium" },
      { title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "medium" },
    ],
  },
  {
    name: "Sliding Window",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "medium" },
      { title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "hard" },
    ],
  },
  {
    name: "Binary Search",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "medium" },
    ],
  },
  {
    name: "Trees DFS/BFS",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "medium" },
      { title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "medium" },
      { title: "Lowest Common Ancestor of a Binary Tree", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty: "medium" },
    ],
  },
  {
    name: "Graphs BFS/DFS",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "medium" },
      { title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", difficulty: "medium" },
    ],
  },
  {
    name: "DP Basics",
    tier: "foundation",
    importance: 4,
    tags: ["BD-CORE", "MAANG", "BD-CP"],
    isCore: true,
    sampleProblems: [
      { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "easy" },
      { title: "House Robber", url: "https://leetcode.com/problems/house-robber/", difficulty: "medium" },
      { title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "medium" },
      { title: "Unique Paths", url: "https://leetcode.com/problems/unique-paths/", difficulty: "medium" },
    ],
  },
  {
    name: "Stack / Monotonic Stack",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "easy" },
      { title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", difficulty: "medium" },
    ],
  },
  {
    name: "Linked List",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "easy" },
      { title: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "easy" },
      { title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "easy" },
    ],
  },
  {
    name: "Heap / Top K",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "medium" },
      { title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "medium" },
    ],
  },
  {
    name: "Backtracking",
    tier: "strong",
    importance: 3,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Subsets", url: "https://leetcode.com/problems/subsets/", difficulty: "medium" },
      { title: "Permutations", url: "https://leetcode.com/problems/permutations/", difficulty: "medium" },
      { title: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/", difficulty: "medium" },
    ],
  },
  {
    name: "Graphs Shortest Path / Dijkstra",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      { title: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/", difficulty: "medium" },
      { title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "medium" },
    ],
  },
  {
    name: "Greedy",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      { title: "Jump Game", url: "https://leetcode.com/problems/jump-game/", difficulty: "medium" },
      { title: "Gas Station", url: "https://leetcode.com/problems/gas-station/", difficulty: "medium" },
      { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "medium" },
    ],
  },
  {
    name: "Math & Number Theory",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      { title: "Greatest Common Divisor of Strings", url: "https://leetcode.com/problems/greatest-common-divisor-of-strings/", difficulty: "easy" },
      { title: "Count Primes", url: "https://leetcode.com/problems/count-primes/", difficulty: "medium" },
      { title: "Pow(x, n)", url: "https://leetcode.com/problems/powx-n/", difficulty: "medium" },
    ],
  },
  {
    name: "Advanced DP",
    tier: "competitive",
    importance: 3,
    tags: ["BD-CP"],
    isCore: true,
    sampleProblems: [
      { title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "medium" },
      { title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "medium" },
      { title: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "medium" },
      { title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "medium" },
    ],
  },
  {
    name: "Bit Manipulation",
    tier: "useful",
    importance: 2,
    tags: ["BD-CP", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Single Number", url: "https://leetcode.com/problems/single-number/", difficulty: "easy" },
      { title: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "easy" },
    ],
  },
  {
    name: "Union-Find & Topological Sort",
    tier: "useful",
    importance: 2,
    tags: ["BD-CORE", "MAANG"],
    isCore: true,
    sampleProblems: [
      { title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "medium" },
      { title: "Redundant Connection", url: "https://leetcode.com/problems/redundant-connection/", difficulty: "medium" },
    ],
  },
  {
    name: "Tries",
    tier: "useful",
    importance: 2,
    tags: ["MAANG", "BD-ADV"],
    isCore: true,
    sampleProblems: [
      { title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "medium" },
      { title: "Word Search II", url: "https://leetcode.com/problems/word-search-ii/", difficulty: "hard" },
    ],
  },
  {
    name: "String Algorithms",
    tier: "specialist",
    importance: 2,
    tags: ["BD-ADV"],
    isCore: true,
    sampleProblems: [
      { title: "Longest Palindromic Substring", url: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "medium" },
      { title: "Find the Index of the First Occurrence in a String", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty: "easy" },
      { title: "Palindromic Substrings", url: "https://leetcode.com/problems/palindromic-substrings/", difficulty: "medium" },
    ],
  },
  {
    name: "Segment Tree / Fenwick Tree",
    tier: "specialist",
    importance: 1,
    tags: ["BD-ADV"],
    isCore: true,
    sampleProblems: [
      { title: "Range Sum Query - Mutable", url: "https://leetcode.com/problems/range-sum-query-mutable/", difficulty: "medium" },
    ],
  },
];

export const CS_FUNDAMENTALS: CsFundamentalDefinition[] = [
  { category: "OOP", title: "Encapsulation" },
  { category: "OOP", title: "Inheritance" },
  { category: "OOP", title: "Polymorphism" },
  { category: "OOP", title: "Abstraction" },
  { category: "DBMS", title: "Normalization" },
  { category: "DBMS", title: "Joins" },
  { category: "DBMS", title: "Indexing" },
  { category: "DBMS", title: "ACID" },
  { category: "DBMS", title: "Transactions" },
  { category: "DS", title: "Big-O of common operations" },
  { category: "DS", title: "Hashing" },
  { category: "DS", title: "Tree & heap properties" },
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
