import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("advanced-dp")!;

export const article = buildPatternArticle({
  meta,
  summary: "Harder DP: knapsack variants, interval DP, bitmask DP, and digit DP when state includes ranges, subsets, or digit positions.",
  intuition: "Use **advanced DP** when state is more than a single index - capacities, intervals [l,r], bitmask of visited cities, or digit position with tight bounds.\n\nDefine state variables explicitly. Iteration order must fill dependencies first (shorter intervals before longer). 0/1 knapsack iterates capacity backwards. Bitmask loops over submasks.",
  deepDive: "0/1 knapsack, burst balloons interval DP, traveling salesman bitmask, digit count with limits.\n\nBurst balloons and partition knapsack differentiate strong candidates; explain state and loop nesting order.",
  signals: [
    "0/1 or unbounded knapsack with capacity",
    "Optimal on interval l..r splitting last",
    "Visit all cities/subsets with bitmask state",
    "Count numbers with digit constraints",
    "Non-contiguous state dimensions",
    "Try all split points k inside interval",
    "Exponential state 2^n with n <= 20",
    "Need DP table not greedy proof"
  ],
  subpatterns: [
    {
      "name": "0/1 knapsack",
      "description": "dp[w] backwards over items prevents reuse."
    },
    {
      "name": "Interval DP",
      "description": "dp[l][r] best on open interval; try last action k."
    },
    {
      "name": "Bitmask DP",
      "description": "dp[mask][i] best tour ending at i visiting mask."
    },
    {
      "name": "Digit DP",
      "description": "Count valid numbers with tight flag and position."
    },
    {
      "name": "Tree DP advanced",
      "description": "States per node with merging children."
    },
    {
      "name": "DP + monotonic optimization",
      "description": "Convex hull trick (rare)."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <numeric>
using namespace std;

class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (sum % 2) return false;
        int target = sum / 2;
        vector<char> dp(target + 1, 0);
        dp[0] = 1;
        for (int x : nums)
            for (int w = target; w >= x; --w)
                dp[w] = dp[w] || dp[w - x];
        return dp[target];
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Interval DP (burst balloons style)",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> a(nums.size() + 2, 1);
        for (int i = 0; i < (int)nums.size(); ++i) a[i + 1] = nums[i];
        int n = (int)a.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int len = 3; len <= n; ++len)
            for (int l = 0; l + len - 1 < n; ++l) {
                int r = l + len - 1;
                for (int k = l + 1; k < r; ++k)
                    dp[l][r] = max(dp[l][r], dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]);
            }
        return dp[0][n - 1];
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "dp-state-table",
  walkthrough: "Burst balloons: pad with 1; dp[l][r] on open interval excludes l and r as burst endpoints; choose last balloon k to burst inside. Knapsack: backward w loop ensures 0/1 usage.",
  steps: [
    "List all state variables (i,j,mask,tight).",
    "Define base cases for smallest intervals/empty mask.",
    "Choose outer loop order (length, mask increasing).",
    "Write transition trying all split/choices.",
    "Optimize space if only previous layer needed.",
    "Trace tiny example table on board.",
    "State time complexity with state count * transitions."
  ],
  problems: [
    {
      "title": "Partition Equal Subset Sum",
      "slug": "partition-equal-subset-sum",
      "difficulty": "medium",
      "note": "0/1 knapsack."
    },
    {
      "title": "Target Sum",
      "slug": "target-sum",
      "difficulty": "medium",
      "note": "Subset sum sign assignment."
    },
    {
      "title": "Burst Balloons",
      "slug": "burst-balloons",
      "difficulty": "hard",
      "note": "Interval DP."
    },
    {
      "title": "Longest Palindromic Substring",
      "slug": "longest-palindromic-substring",
      "difficulty": "medium",
      "note": "Interval expand or DP."
    },
    {
      "title": "Stickers to Spell Word",
      "slug": "stickers-to-spell-word",
      "difficulty": "hard",
      "note": "Bitmask target."
    },
    {
      "title": "Shopping Offers",
      "slug": "shopping-offers",
      "difficulty": "medium",
      "note": "DFS/DP on needs vector."
    },
    {
      "title": "Number of Digit One",
      "slug": "number-of-digit-one",
      "difficulty": "hard",
      "note": "Digit DP."
    },
    {
      "title": "Minimum Cost to Cut a Stick",
      "slug": "minimum-cost-to-cut-a-stick",
      "difficulty": "hard",
      "note": "Interval DP on cuts."
    }
  ],
  pitfalls: "Forward knapsack loop allowing reuse. Interval loops with wrong len bounds. Bitmask DP using float states.",
  interviewTips: "Write state on board before triple loops. Mention why iteration order matters.",
  complexity: [
    {
      "operation": "0/1 knapsack",
      "time": "O(n * W)",
      "space": "O(W)"
    },
    {
      "operation": "Interval DP",
      "time": "O(n^3)",
      "space": "O(n^2)"
    },
    {
      "operation": "Bitmask TSP style",
      "time": "O(n^2 * 2^n)",
      "space": "O(n * 2^n)"
    }
  ],
});
