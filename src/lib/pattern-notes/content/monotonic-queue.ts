import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("monotonic-queue")!;

export const article = buildPatternArticle({
  meta,
  summary: "Deque maintaining monotonic order for sliding window min/max in O(n).",
  intuition: "Store **indices** in deque. Front is window maximum (for decreasing deque). Pop back while back value < current before push. Pop front when index leaves window.",
  signals: ["Sliding window maximum/minimum", "Fixed window extrema", "Queue design problems"],
  subpatterns: [
    { name: "Monotonic deque", description: "Decreasing deque for max; increasing for min." },
    { name: "Index tracking", description: "Remove front when index < window start." },
  ],
  templateCode: {
    language: "typescript",
    code: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = [], res: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && nums[dq[dq.length-1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[0] <= i - k) dq.shift();
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  return res;
}`,
  },
  viz: "monotonic-queue",
  walkthrough: "Each index enters and leaves deque once → O(n). Compare with heap approach O(n log k) when k is small either works.",
  problems: [
    { title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: "hard", note: "Canonical monotonic deque." },
    { title: "Design Circular Queue", slug: "design-circular-queue", difficulty: "medium", note: "Ring buffer basics." },
  ],
  pitfalls: "Use deque not shift on large arrays in hot paths if performance critical — ring buffer alternative.",
  complexity: [{ operation: "Sliding window max", time: "O(n)", space: "O(k)" }],
});
