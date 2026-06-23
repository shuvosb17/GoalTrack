import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("dp-1d")!;

export const article = buildPatternArticle({
  meta,
  summary: "Linear DP: define state on index i, transition from smaller indices.",
  intuition: "1D DP answers: *what's the best I can do using first i elements?* Write recurrence, base cases, iterate bottom-up. Space-optimize to O(1) when only last k states matter.",
  signals: ["Count ways / min cost along sequence", "House robber no adjacent", "Coin change amount", "Longest increasing subsequence"],
  subpatterns: [
    { name: "Linear DP", description: "dp[i] depends on dp[i-1], dp[i-2], ..." },
    { name: "State transition", description: "Write formula before coding." },
    { name: "Space optimization", description: "Rolling variables if deps are small." },
  ],
  templateCode: {
    language: "typescript",
    code: `function rob(nums: number[]): number {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}`,
  },
  viz: "dp-state-table",
  walkthrough: "**Coin Change**: `dp[a]` = min coins for amount `a`. For each coin, `dp[a] = min(dp[a], 1 + dp[a-coin])`. Initialize dp[0]=0, rest infinity.",
  problems: [
    { title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "easy", note: "Fibonacci DP." },
    { title: "House Robber", slug: "house-robber", difficulty: "medium", note: "Take/skip recurrence." },
    { title: "Coin Change", slug: "coin-change", difficulty: "medium", note: "Unbounded knapsack." },
    { title: "Decode Ways", slug: "decode-ways", difficulty: "medium", note: "String DP." },
  ],
  pitfalls: "Initialize base cases. Use `Infinity` for impossible states. Order loops correctly for unbounded knapsack.",
  complexity: [{ operation: "1D DP", time: "O(n·W)", space: "O(n) or O(W)" }],
});
