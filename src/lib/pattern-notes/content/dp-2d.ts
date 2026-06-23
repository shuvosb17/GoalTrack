import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("dp-2d")!;

export const article = buildPatternArticle({
  meta,
  summary: "Two-dimensional state — grids, two strings, or paired indices.",
  intuition: "2D DP tables model **grid paths**, **edit distance**, and **LCS**. `dp[i][j]` often compares `s[i]` and `t[j]` or cell `(i,j)` on a matrix.",
  signals: ["Unique paths on grid", "Edit distance / LCS", "Two string comparison", "Knapsack with weights"],
  subpatterns: [
    { name: "Grid DP", description: "Paths with obstacles; from top/left." },
    { name: "String DP", description: "Compare prefixes s[0..i], t[0..j]." },
    { name: "Knapsack 2D", description: "Items × capacity table." },
  ],
  templateCode: {
    language: "typescript",
    code: `function longestCommonSubsequence(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
  },
  viz: "dp-state-table",
  walkthrough: "**Edit Distance**: if chars match, dp[i][j]=dp[i-1][j-1]; else 1+min(replace, delete, insert).",
  problems: [
    { title: "Unique Paths", slug: "unique-paths", difficulty: "medium", note: "Grid combinatorics." },
    { title: "Edit Distance", slug: "edit-distance", difficulty: "medium", note: "Classic string DP." },
    { title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "medium", note: "Match/mismatch." },
  ],
  pitfalls: "Row/column 0 base cases. Space optimize to 1D when only previous row needed.",
  complexity: [{ operation: "2D table fill", time: "O(m·n)", space: "O(m·n)" }],
});
