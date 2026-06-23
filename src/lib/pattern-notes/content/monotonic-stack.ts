import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("monotonic-stack")!;

export const article = buildPatternArticle({
  meta,
  summary: "Stack maintaining monotonic order to find next greater/smaller in O(n).",
  intuition: "Each element pushed/popped once. For **next greater to the right**, use decreasing stack of indices. When current > stack top, pop and assign answer.",
  signals: ["Next greater/smaller element", "Daily temperatures distance", "Histogram largest rectangle", "Trapping rain water variant"],
  subpatterns: [
    { name: "Next greater", description: "Pop while current > stack top." },
    { name: "Previous smaller", description: "Scan left with increasing stack." },
    { name: "Histogram area", description: "Pop width when height decreases." },
  ],
  templateCode: {
    language: "typescript",
    code: `function dailyTemperatures(t: number[]): number[] {
  const res = Array(t.length).fill(0), stack: number[] = [];
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack[stack.length-1]]) {
      const j = stack.pop()!;
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}`,
  },
  viz: "stack-monotonic",
  walkthrough: "**Largest Rectangle**: append sentinel 0; when pop, width extends to current index minus new stack top minus 1.",
  problems: [
    { title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "medium", note: "Index distance." },
    { title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "hard", note: "Width on pop." },
    { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "hard", note: "Or two pointers." },
  ],
  pitfalls: "Store indices not values when width matters. Sentinel simplifies flush at end.",
  complexity: [{ operation: "Monotonic stack", time: "O(n)", space: "O(n)" }],
});
