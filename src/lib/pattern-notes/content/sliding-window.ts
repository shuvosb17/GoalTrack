import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("sliding-window")!;

export const article = buildPatternArticle({
  meta,
  summary: "Maintain a window [left, right] over a sequence; expand to grow, shrink when invalid.",
  intuition: "Subarray/substring problems with a **contiguous** constraint often use a window. Track window state in a hash map or counters; update in O(1) as pointers move.",
  signals: ["Longest/shortest substring with constraint","At most K distinct characters","Fixed-size window average/max","Expand until invalid, then shrink"],
  subpatterns: [{"name":"Fixed window","description":"Window size K slides; update aggregate incrementally."},{"name":"Variable window","description":"Expand right; while invalid, increment left."}],
  templateCode: {
    language: "typescript",
    code: `function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch)! >= left) left = last.get(ch)! + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    caption: "Core template — adapt to the problem.",
  },
    viz: "sliding-window-expand-shrink",
  walkthrough: "Pattern: **Expand → condition breaks → Shrink**. For minimum window substring, shrink while window is valid and track smallest valid window.",
  problems: [{"title":"Longest Substring Without Repeating Characters","slug":"longest-substring-without-repeating-characters","difficulty":"medium","note":"Classic variable window."},{"title":"Minimum Window Substring","slug":"minimum-window-substring","difficulty":"hard","note":"Shrink while valid."},{"title":"Longest Repeating Character Replacement","slug":"longest-repeating-character-replacement","difficulty":"medium","note":"Window with at most k replacements."},{"title":"Sliding Window Maximum","slug":"sliding-window-maximum","difficulty":"hard","note":"Use monotonic deque."}],
  pitfalls: "Off-by-one on window size. When shrinking, update ALL affected counters, not just the left char.",
  complexity: [{"operation":"Variable window","time":"O(n)","space":"O(k) alphabet"}],
});
