import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("intervals")!;

export const article = buildPatternArticle({
  meta,
  summary: "Sort intervals by start (or end), then merge or sweep to answer overlap queries.",
  intuition: "Interval problems become easy after **sorting**. Merge overlapping intervals in one pass. Meeting rooms use min-heap of end times or sweep line.",
  signals: ["Merge overlapping intervals", "Insert into sorted intervals", "Meeting room conflicts", "Minimum arrows to burst balloons"],
  subpatterns: [
    { name: "Sort + merge", description: "If current start <= prev end, extend prev." },
    { name: "Sweep line", description: "Events at start/end; track active count." },
    { name: "Sort by end time", description: "Greedy non-overlapping selection." },
  ],
  templateCode: {
    language: "typescript",
    code: `function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const res: number[][] = [];
  for (const iv of intervals) {
    if (!res.length || iv[0] > res[res.length - 1][1]) res.push(iv);
    else res[res.length - 1][1] = Math.max(res[res.length - 1][1], iv[1]);
  }
  return res;
}`,
  },
  viz: "interval-merge",
  walkthrough: "**Insert Interval**: insert then merge once, or find position and merge left/right overlaps in O(n).",
  problems: [
    { title: "Merge Intervals", slug: "merge-intervals", difficulty: "medium", note: "Sort by start." },
    { title: "Insert Interval", slug: "insert-interval", difficulty: "medium", note: "Merge neighbors." },
    { title: "Meeting Rooms II", slug: "meeting-rooms-ii", difficulty: "medium", note: "Min-heap of ends." },
  ],
  pitfalls: "Clarify inclusive vs exclusive endpoints. Sort before merge always.",
  complexity: [{ operation: "Merge intervals", time: "O(n log n)", space: "O(n)" }],
});
