import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("advanced-dp")!;

export const article = buildPatternArticle({
  meta,
  summary: "Knapsack variants, interval DP, bitmask DP, and digit DP for harder state spaces.",
  intuition: "When state is more than index i — add dimensions: capacity, bitmask of visited, interval [i,j]. Advanced DP needs careful state definition and transition order.",
  signals: ["0/1 or unbounded knapsack", "Burst balloons interval DP", "TSP / assignment bitmask", "Count numbers with digit constraints"],
  subpatterns: [
    { name: "Knapsack", description: "dp[cap] over items — 0/1 iterate cap backwards." },
    { name: "Interval DP", description: "dp[i][j] = best on segment i..j." },
    { name: "Bitmask DP", description: "dp[mask] = best using set mask of cities." },
    { name: "Digit DP", description: "Count valid numbers by building digits with constraints." },
  ],
  templateCode: {
    language: "typescript",
    code: `function canPartition(nums: number[]): boolean {
  const sum = nums.reduce((a,b)=>a+b,0);
  if (sum % 2) return false;
  const target = sum / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums)
    for (let w = target; w >= n; w--)
      dp[w] = dp[w] || dp[w - n];
  return dp[target];
}`,
  },
  viz: "dp-state-table",
  walkthrough: "**Burst Balloons**: `dp[l][r]` = max coins for open interval (l,r) exclusive; try last balloon k to burst in range.",
  problems: [
    { title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "medium", note: "0/1 knapsack." },
    { title: "Burst Balloons", slug: "burst-balloons", difficulty: "hard", note: "Interval DP." },
    { title: "Target Sum", slug: "target-sum", difficulty: "medium", note: "Subset sum variant." },
  ],
  pitfalls: "0/1 knapsack loops capacity backwards. Interval DP: length of segment outer loop.",
  complexity: [{ operation: "Knapsack", time: "O(n·W)", space: "O(W)" }],
});
