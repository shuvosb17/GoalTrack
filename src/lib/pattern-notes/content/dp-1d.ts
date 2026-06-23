import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("dp-1d")!;

export const article = buildPatternArticle({
  meta,
  summary: "Linear dynamic programming: define state dp[i] (or rolling) from smaller indices with optimal substructure.",
  intuition: "Use **1D DP** when best answer for position i depends on a constant number of previous states (i-1, i-2, or j<i). Space optimize with two variables or rolling array when only recent rows matter.\n\nWrite recurrence before coding. Base cases for i=0,1. Iterate i increasing so dependencies already computed. For knapsack-like 1D, iterate capacity backwards for 0/1 items.",
  deepDive: "Fibonacci-style climbing stairs, house robber skip adjacent, coin change min coins, LIS O(n^2) or patience O(n log n), decode ways, maximum product subarray.\n\nHouse robber and coin change are classic BD DP warm-ups - state definition first.",
  signals: [
    "Optimize over sequence with previous-index dependency",
    "Count ways to reach end with steps 1/2",
    "Min coins or min path cost on line",
    "Cannot take adjacent elements",
    "Sign change in product subarray",
    "State is index i only or small carry",
    "Overlapping subproblems in recursion tree",
    "Constraints n up to 10^4 suggest O(n) or O(n log n)"
  ],
  subpatterns: [
    {
      "name": "Linear reach",
      "description": "dp[i] = sum of ways from dp[i-1], dp[i-2]."
    },
    {
      "name": "Skip adjacent",
      "description": "dp[i] = max(take nums[i]+dp[i-2], dp[i-1])."
    },
    {
      "name": "Unbounded knapsack 1D",
      "description": "Forward loop on capacity for unlimited items."
    },
    {
      "name": "0/1 knapsack 1D",
      "description": "Backward capacity loop prevents reuse."
    },
    {
      "name": "LIS DP",
      "description": "dp[i] = 1 + max dp[j] for j<i and nums[j]<nums[i]."
    },
    {
      "name": "Carry state",
      "description": "Track min/max ending here vs global."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Coin change (min coins)",
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = 1e9;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; ++a)
            for (int c : coins)
                if (a >= c) dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] == INF ? -1 : dp[amount];
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "dp-state-table",
  walkthrough: "House robber: at each house choose max of skipping (prev1) or robbing (prev2+value). Coin change: dp[a] min over coins of dp[a-c]+1.",
  steps: [
    "Define dp meaning in one sentence.",
    "List base cases.",
    "Derive transition from smaller states.",
    "Choose iteration order and bounds.",
    "Optimize space if only few prior states needed.",
    "Trace small example table.",
    "State time/space complexity."
  ],
  problems: [
    {
      "title": "Climbing Stairs",
      "slug": "climbing-stairs",
      "difficulty": "easy",
      "note": "Fibonacci DP."
    },
    {
      "title": "House Robber",
      "slug": "house-robber",
      "difficulty": "medium",
      "note": "Skip adjacent."
    },
    {
      "title": "House Robber II",
      "slug": "house-robber-ii",
      "difficulty": "medium",
      "note": "Circular two passes."
    },
    {
      "title": "Coin Change",
      "slug": "coin-change",
      "difficulty": "medium",
      "note": "Unbounded knapsack."
    },
    {
      "title": "Longest Increasing Subsequence",
      "slug": "longest-increasing-subsequence",
      "difficulty": "medium",
      "note": "DP or patience."
    },
    {
      "title": "Word Break",
      "slug": "word-break",
      "difficulty": "medium",
      "note": "dp[i] reachable."
    },
    {
      "title": "Maximum Product Subarray",
      "slug": "maximum-product-subarray",
      "difficulty": "medium",
      "note": "Min/max carry."
    },
    {
      "title": "Decode Ways",
      "slug": "decode-ways",
      "difficulty": "medium",
      "note": "dp count ways."
    }
  ],
  pitfalls: "Wrong iteration direction in 0/1 knapsack. Off-by-one in amount array size. Not resetting base dp[0].",
  interviewTips: "Write recurrence on board before loops. Mention space optimization explicitly.",
  complexity: [
    {
      "operation": "Linear 1D DP",
      "time": "O(n)",
      "space": "O(1) rolling"
    },
    {
      "operation": "Coin change",
      "time": "O(amount * coins)",
      "space": "O(amount)"
    },
    {
      "operation": "LIS O(n^2)",
      "time": "O(n^2)",
      "space": "O(n)"
    }
  ],
});
