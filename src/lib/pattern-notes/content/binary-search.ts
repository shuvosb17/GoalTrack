import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("binary-search")!;

export const article = buildPatternArticle({
  meta,
  summary: "Halve the search space each step — on sorted arrays or on the answer itself.",
  intuition: "Binary search works when the answer space is **monotonic**: if `x` works, all larger values work too (or vice versa). Classic form finds a target in sorted data; generalized form searches the minimum/maximum feasible answer.",
  signals: ["Sorted array or sorted matrix", "Find first/last occurrence", "Minimize maximum / maximize minimum", "O(log n) required on large n"],
  subpatterns: [
    { name: "Exact search", description: "Find target index in sorted array." },
    { name: "First/last occurrence", description: "Bias left or right when equal to target." },
    { name: "Search space reduction", description: "Binary search on rotated array, peak finding." },
    { name: "Binary search on answer", description: "Feasibility check on mid value (Koko, ship capacity)." },
  ],
  templateCode: {
    language: "typescript",
    code: `function search(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    caption: "Use lo + ((hi-lo)>>1) to avoid overflow.",
  },
  viz: "binary-search-space",
  walkthrough: "**Koko Eating Bananas**: search speed `k` from 1 to max(piles). `feasible(k)` = can finish in `h` hours? If yes, try smaller `k`. Answer is first feasible `k`.",
  problems: [
    { title: "Binary Search", slug: "binary-search", difficulty: "easy", note: "Template." },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "medium", note: "One half always sorted." },
    { title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "medium", note: "Search on answer." },
    { title: "Capacity To Ship Packages", slug: "capacity-to-ship-packages-within-d-days", difficulty: "medium", note: "Feasibility on capacity." },
    { title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "hard", note: "Partition two arrays." },
  ],
  pitfalls: "Infinite loops: ensure `lo`/`hi` shrink each iteration. For first-occurrence, don't stop at equality — continue left.",
  complexity: [{ operation: "Binary search", time: "O(log n)", space: "O(1)" }],
});
