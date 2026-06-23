import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("heap")!;

export const article = buildPatternArticle({
  meta,
  summary: "Heaps maintain min/max at root — ideal for Top K, merging streams, and scheduling.",
  intuition: "A **min-heap** of size K tracks K largest elements: if new item > root, replace root. Heaps also power Dijkstra and median-from-stream with two heaps.",
  signals: ["Kth largest/smallest", "Merge K sorted lists", "Continuous median", "Schedule tasks by deadline"],
  subpatterns: [
    { name: "Top K", description: "Size-K heap; O(n log k) vs O(n log n) sort." },
    { name: "Min heap", description: "Extract smallest repeatedly." },
    { name: "Max heap", description: "Negate values or use max-heap API." },
    { name: "Two heaps", description: "Max-heap low half + min-heap high half for median." },
  ],
  templateCode: {
    language: "typescript",
    code: `function findKthLargest(nums: number[], k: number): number {
  const heap = new MinPriorityQueue<number>();
  for (const n of nums) {
    heap.enqueue(n);
    if (heap.size() > k) heap.dequeue();
  }
  return heap.front()!;
}`,
    caption: "Use your language's priority queue; maintain size k.",
  },
  viz: "heap-top-k",
  walkthrough: "**Merge K Lists**: push head of each list into min-heap; pop smallest, push its next node. Process until heap empty.",
  problems: [
    { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "medium", note: "Size-k min-heap." },
    { title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "hard", note: "Two heaps balance." },
    { title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "hard", note: "Heap of list heads." },
  ],
  pitfalls: "Off-by-one on k vs index. Rebalance two heaps when size differs by >1.",
  complexity: [{ operation: "Top K with heap", time: "O(n log k)", space: "O(k)" }],
});
