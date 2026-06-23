import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("dp-2d")!;

export const article = buildPatternArticle({
  meta,
  summary: "Two-dimensional DP on grids or string pairs: dp[i][j] combines subproblems from rows/columns with clear boundaries.",
  intuition: "Use **2D DP** for two sequences (LCS, edit distance) or grid paths with obstacles. Fill table increasing i,j; answer often at dp[m][n].\n\nDefine cell meaning precisely. Initialization handles empty prefix rows/columns. Transition considers match/mismatch or moves from top/left/diagonal.",
  deepDive: "Unique paths, min path sum, LCS, edit distance, interleaving string, dungeon game max health.\n\nUnique paths and edit distance are frequent; draw small table filling order.",
  signals: [
    "Grid path counting or min cost",
    "Two strings compared positionally",
    "Need optimal alignment or transformation cost",
    "Obstacles modify transitions",
    "Fill DP table with i and j indices",
    "Return path reconstruction optional",
    "Constraints allow O(mn) memory",
    "Cannot greedy - need explore all subpairs"
  ],
  subpatterns: [
    {
      "name": "Grid paths",
      "description": "dp[i][j] += dp[i-1][j] + dp[i][j-1] with obstacle guards."
    },
    {
      "name": "String matching",
      "description": "Match char: diag+1; else max(left,top)."
    },
    {
      "name": "Edit distance",
      "description": "Insert/delete/replace min cost transitions."
    },
    {
      "name": "Knapsack 2D",
      "description": "Items x capacity table when 1D trick unclear."
    },
    {
      "name": "Interval as 2D",
      "description": "dp[l][r] on segments (see advanced DP)."
    },
    {
      "name": "Rolling 2D to 1D",
      "description": "Optimize space when only previous row needed."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = (int)text1.size(), n = (int)text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; ++i)
            for (int j = 1; j <= n; ++j)
                if (text1[i-1] == text2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        return dp[m][n];
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Unique paths with obstacles",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& grid) {
        int m = (int)grid.size(), n = grid[0].size();
        if (grid[0][0] || grid[m-1][n-1]) return 0;
        vector<vector<long long>> dp(m, vector<long long>(n, 0));
        dp[0][0] = 1;
        for (int i = 0; i < m; ++i)
            for (int j = 0; j < n; ++j) {
                if (grid[i][j]) { dp[i][j] = 0; continue; }
                if (i) dp[i][j] += dp[i-1][j];
                if (j) dp[i][j] += dp[i][j-1];
            }
        return (int)dp[m-1][n-1];
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "dp-state-table",
  walkthrough: "LCS: empty prefix row/col zeros. On char match take diagonal+1 else max up/left. Unique paths: if obstacle, cell zero.",
  steps: [
    "Define dp dimensions (m+1,n+1).",
    "Initialize first row/column.",
    "Double loop increasing indices.",
    "Write transitions with if match branches.",
    "Answer at dp[m][n] or max over table.",
    "Optional space compress to 1D row.",
    "Complexity O(mn)."
  ],
  problems: [
    {
      "title": "Unique Paths",
      "slug": "unique-paths",
      "difficulty": "medium",
      "note": "Grid combinatorics."
    },
    {
      "title": "Minimum Path Sum",
      "slug": "minimum-path-sum",
      "difficulty": "medium",
      "note": "Grid min cost."
    },
    {
      "title": "Longest Common Subsequence",
      "slug": "longest-common-subsequence",
      "difficulty": "medium",
      "note": "Pair DP."
    },
    {
      "title": "Edit Distance",
      "slug": "edit-distance",
      "difficulty": "medium",
      "note": "Levenshtein."
    },
    {
      "title": "Interleaving String",
      "slug": "interleaving-string",
      "difficulty": "medium",
      "note": "Two-string DP."
    },
    {
      "title": "Distinct Subsequences",
      "slug": "distinct-subsequences",
      "difficulty": "hard",
      "note": "Count matchings."
    },
    {
      "title": "Target Sum",
      "slug": "target-sum",
      "difficulty": "medium",
      "note": "Subset sum variant."
    },
    {
      "title": "Maximal Square",
      "slug": "maximal-square",
      "difficulty": "medium",
      "note": "dp side of 1s."
    }
  ],
  pitfalls: "Swapping i/j string indices. Forgetting obstacle cells. Integer overflow on path counts - use long long.",
  interviewTips: "Draw 3x3 table fill order. Define dp[i][j] verbally before loops.",
  complexity: [
    {
      "operation": "Fill m x n table",
      "time": "O(mn)",
      "space": "O(mn)"
    },
    {
      "operation": "Rolling row",
      "time": "O(mn)",
      "space": "O(n)"
    }
  ],
});
