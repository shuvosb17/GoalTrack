import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("prefix-sum")!;

export const article = buildPatternArticle({
  meta,
  summary: "Precompute cumulative sums for O(1) range queries on static arrays.",
  intuition: "`prefix[i]` = sum of nums[0..i]. Range sum `[l,r]` = `prefix[r] - prefix[l-1]`. Combine with hash map for subarray sum equals K.",
  signals: ["Many range sum queries", "Subarray sum divisible by K", "2D matrix range sum", "Running sum stream"],
  subpatterns: [
    { name: "Range query", description: "O(1) query after O(n) build." },
    { name: "Running sum + hash", description: "Count subarrays with target sum." },
    { name: "2D prefix", description: "Inclusion-exclusion on rectangle." },
  ],
  templateCode: {
    language: "typescript",
    code: `function subarraySum(nums: number[], k: number): number {
  const freq = new Map<number, number>([[0, 1]]);
  let sum = 0, count = 0;
  for (const n of nums) {
    sum += n;
    count += freq.get(sum - k) ?? 0;
    freq.set(sum, (freq.get(sum) ?? 0) + 1);
  }
  return count;
}`,
  },
  viz: "prefix-sum",
  walkthrough: "Map stores how often each prefix sum appeared. For current sum `s`, add count of `s-k` to answer.",
  problems: [
    { title: "Range Sum Query - Immutable", slug: "range-sum-query-immutable", difficulty: "easy", note: "Build prefix." },
    { title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", difficulty: "medium", note: "Prefix + hash." },
  ],
  pitfalls: "Initialize map with `{0:1}`. For 2D prefix, handle `i-1` and `j-1` boundary cases.",
  complexity: [
    { operation: "Build prefix", time: "O(n)", space: "O(n)" },
    { operation: "Range query", time: "O(1)", space: "O(1)" },
  ],
});
