import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("backtracking")!;

export const article = buildPatternArticle({
  meta,
  summary: "Explore decision trees with choose-explore-unchoose to enumerate or optimize assignments under constraints.",
  intuition: "Use **backtracking** when you must build a solution incrementally (permutation, subset, board placement) and can prune branches that violate constraints early.\n\nMaintain partial state vector; at each step try valid choices, recurse, then undo (pop) to restore state for siblings. Pruning is the difference between usable and TLE.",
  deepDive: "Subsets/permutations/combinations, N-Queens, Sudoku, word search grid DFS, partition palindrome, expression add operators.\n\nSubsets and permutations are common; emphasize pruning and duplicate handling on sorted arrays.",
  signals: [
    "Generate all combinations/permutations/subsets",
    "Constraint satisfaction on boards",
    "Path in grid with visited marks",
    "Partition or assign items with validity check",
    "Explicit exponential output size",
    "Can prune early with bounds/heuristics",
    "Use visited array restored after recursion",
    "Sort input to skip duplicate branches"
  ],
  subpatterns: [
    {
      "name": "Subsets / combinations",
      "description": "Start index to avoid reuse; include/exclude each element."
    },
    {
      "name": "Permutations",
      "description": "Swap or use used[]; try each unused position."
    },
    {
      "name": "Grid DFS",
      "description": "Mark cell visited, explore 4 dirs, unmark on return."
    },
    {
      "name": "Board CSP",
      "description": "Place piece; check row/col/box conflicts; backtrack."
    },
    {
      "name": "Partitioning",
      "description": "Cut string at i when prefix valid; recurse on suffix."
    },
    {
      "name": "Target search with ops",
      "description": "Try + - * on growing expression string."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> path;
        function<void(int)> dfs = [&](int start) {
            res.push_back(path);
            for (int i = start; i < (int)nums.size(); ++i) {
                path.push_back(nums[i]);
                dfs(i + 1);
                path.pop_back();
            }
        };
        dfs(0);
        return res;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Permutations with used array",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> path;
        vector<char> used(nums.size(), 0);
        function<void()> dfs = [&]() {
            if ((int)path.size() == (int)nums.size()) { res.push_back(path); return; }
            for (int i = 0; i < (int)nums.size(); ++i) {
                if (used[i]) continue;
                used[i] = 1; path.push_back(nums[i]);
                dfs();
                path.pop_back(); used[i] = 0;
            }
        };
        dfs();
        return res;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "backtracking-tree",
  walkthrough: "Subsets: each level chooses next index to include. For combination sum, sort and skip equal candidates at same depth to avoid duplicate combos.",
  steps: [
    "Define partial state and goal condition.",
    "Write recursive function with parameters (index, path).",
    "Loop choices; apply constraint check before recurse.",
    "Push choice, dfs, pop choice (undo).",
    "Add pruning (remaining sum, visited).",
    "Handle duplicates via sorting + skip.",
    "State exponential time in output size."
  ],
  problems: [
    {
      "title": "Subsets",
      "slug": "subsets",
      "difficulty": "medium",
      "note": "Include/exclude DFS."
    },
    {
      "title": "Permutations",
      "slug": "permutations",
      "difficulty": "medium",
      "note": "used[] backtrack."
    },
    {
      "title": "Combination Sum",
      "slug": "combination-sum",
      "difficulty": "medium",
      "note": "Reuse candidates."
    },
    {
      "title": "Combination Sum II",
      "slug": "combination-sum-ii",
      "difficulty": "medium",
      "note": "No reuse + skip dup."
    },
    {
      "title": "N-Queens",
      "slug": "n-queens",
      "difficulty": "hard",
      "note": "Column/diag pruning."
    },
    {
      "title": "Word Search",
      "slug": "word-search",
      "difficulty": "medium",
      "note": "Grid backtrack."
    },
    {
      "title": "Palindrome Partitioning",
      "slug": "palindrome-partitioning",
      "difficulty": "medium",
      "note": "Cut + valid prefix."
    },
    {
      "title": "Letter Combinations of a Phone Number",
      "slug": "letter-combinations-of-a-phone-number",
      "difficulty": "medium",
      "note": "Digit mapping DFS."
    }
  ],
  pitfalls: "Forgetting to undo visited marks. Not sorting to skip duplicate combinations. Shallow copying path vectors incorrectly.",
  interviewTips: "Draw recursion tree depth and branching factor. Mention pruning condition before recursing.",
  complexity: [
    {
      "operation": "Subsets",
      "time": "O(n * 2^n)",
      "space": "O(n)"
    },
    {
      "operation": "Permutations",
      "time": "O(n * n!)",
      "space": "O(n)"
    },
    {
      "operation": "N-Queens",
      "time": "O(n!)",
      "space": "O(n)"
    }
  ],
});
