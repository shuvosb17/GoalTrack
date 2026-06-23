import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("backtracking")!;

export const article = buildPatternArticle({
  meta,
  summary: "Explore decision tree: choose → recurse → undo (backtrack).",
  intuition: "Backtracking builds candidates incrementally. When partial solution can't succeed, **prune** early. Always undo state after recursive call returns.",
  signals: ["All subsets/permutations/combinations", "Place queens/pieces on board", "Word search from cell", "Partition with constraints"],
  subpatterns: [
    { name: "Choose → Explore → Unchoose", description: "Push choice, recurse, pop choice." },
    { name: "Pruning", description: "Stop branch when constraint violated." },
    { name: "Duplicate handling", description: "Sort + skip equal picks at same depth." },
  ],
  templateCode: {
    language: "typescript",
    code: `function subsets(nums: number[]): number[][] {
  const res: number[][] = [], path: number[] = [];
  function dfs(i: number) {
    res.push([...path]);
    for (let j = i; j < nums.length; j++) {
      path.push(nums[j]);
      dfs(j + 1);
      path.pop();
    }
  }
  dfs(0);
  return res;
}`,
  },
  viz: "backtracking-tree",
  walkthrough: "**Combination Sum**: allow reuse by recursing from same index `j`; prune when sum exceeds target.",
  problems: [
    { title: "Subsets", slug: "subsets", difficulty: "medium", note: "Include/exclude each element." },
    { title: "Permutations", slug: "permutations", difficulty: "medium", note: "Swap or used[] array." },
    { title: "Combination Sum", slug: "combination-sum", difficulty: "medium", note: "Reuse allowed." },
    { title: "N-Queens", slug: "n-queens", difficulty: "hard", note: "Column/diag sets." },
  ],
  pitfalls: "Copy path when saving (`[...path]`). Clear board state on backtrack. Sort for duplicate subsets.",
  complexity: [{ operation: "Subsets", time: "O(n·2^n)", space: "O(n)" }],
});
