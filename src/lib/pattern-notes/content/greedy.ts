import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("greedy")!;

export const article = buildPatternArticle({
  meta,
  summary: "Make locally optimal choices that lead to a global optimum — when you can prove it works.",
  intuition: "Greedy works when problem has **greedy choice property** and **optimal substructure**. Sorting often reveals the greedy order (earliest finish, smallest end).",
  signals: ["Activity selection / scheduling", "Jump game reachability", "Partition labels", "Assign tasks with cooldown"],
  subpatterns: [
    { name: "Local optimal choice", description: "Pick best-looking option now without backtracking." },
    { name: "Sort first", description: "Order items so greedy choice is obvious." },
    { name: "Exchange argument", description: "Prove swapping never worsens solution (interviews)." },
  ],
  templateCode: {
    language: "typescript",
    code: `function canJump(nums: number[]): boolean {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
    if (farthest >= nums.length - 1) return true;
  }
  return true;
}`,
  },
  viz: "greedy-choice",
  walkthrough: "**Jump Game II**: track current jump end and farthest; when `i` reaches current end, increment jumps and extend to farthest.",
  problems: [
    { title: "Jump Game", slug: "jump-game", difficulty: "medium", note: "Reachability greedy." },
    { title: "Gas Station", slug: "gas-station", difficulty: "medium", note: "Single pass tank." },
    { title: "Partition Labels", slug: "partition-labels", difficulty: "medium", note: "Last occurrence map." },
    { title: "Task Scheduler", slug: "task-scheduler", difficulty: "medium", note: "Cooldown formula." },
  ],
  pitfalls: "Greedy fails on coin change with odd denominations — need DP. Always sanity-check with counterexample.",
  complexity: [{ operation: "Greedy scan", time: "O(n)", space: "O(1)" }],
});
