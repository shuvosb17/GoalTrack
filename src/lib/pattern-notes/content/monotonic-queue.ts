import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("monotonic-queue")!;

export const article = buildPatternArticle({
  meta,
  summary: "Deque maintaining monotonic candidates for sliding window minimum/maximum in O(n).",
  intuition: "Use **monotonic queue** when window slides and you need min/max each step faster than heap O(log n).\n\nDeque stores indices in decreasing (for max) or increasing (for min) order of values. Pop back while worse than current; pop front when out of window.",
  deepDive: "Sliding window maximum, jump game VI, constrained subsequence DP optimization.\n\nSliding window maximum is the flagship problem - mention deque of indices.",
  signals: [
    "Fixed or variable window needs min/max each shift",
    "Need O(n) after O(n log n) heap approach",
    "Indices leave window - pop from front",
    "DP transition optimizes over last k states",
    "Queue maintains useful candidates only",
    "Compare with multiset/heap trade-offs",
    "Constraints n,k up to 10^5",
    "Max/min at front of deque after cleanup"
  ],
  subpatterns: [
    {
      "name": "Sliding window max",
      "description": "Decreasing deque of indices; front is max."
    },
    {
      "name": "Sliding window min",
      "description": "Increasing deque for minimum."
    },
    {
      "name": "Jump game DP optimize",
      "description": "Deque over dp indices in reachable range."
    },
    {
      "name": "Multi-pass queue",
      "description": "Separate passes for left/right max."
    },
    {
      "name": "Heap alternative",
      "description": "Lazy deletion heap when simpler to code."
    },
    {
      "name": "Prefix min queue",
      "description": "Maintain candidates for future windows."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <deque>
using namespace std;

class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> res;
        for (int i = 0; i < (int)nums.size(); ++i) {
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (dq.front() <= i - k) dq.pop_front();
            if (i >= k - 1) res.push_back(nums[dq.front()]);
        }
        return res;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Sliding window minimum (increasing deque)",
    language: "cpp",
    code: `#include <vector>
#include <deque>
using namespace std;

class Solution {
public:
    vector<int> minSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> res;
        for (int i = 0; i < (int)nums.size(); ++i) {
            while (!dq.empty() && nums[dq.back()] >= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (dq.front() <= i - k) dq.pop_front();
            if (i >= k - 1) res.push_back(nums[dq.front()]);
        }
        return res;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "monotonic-queue",
  walkthrough: "Indices in deque decrease by value. Front is largest in window. Remove front when index outside [i-k+1, i].",
  steps: [
    "Clarify window size k and 0/1-based indices.",
    "Choose increasing vs decreasing deque by min vs max.",
    "Pop back worse elements before push.",
    "Evict front if index left window.",
    "Record answer when window full.",
    "Contrast with priority_queue O(log n).",
    "Complexity O(n) each index in/out once."
  ],
  problems: [
    {
      "title": "Sliding Window Maximum",
      "slug": "sliding-window-maximum",
      "difficulty": "hard",
      "note": "Deque template."
    },
    {
      "title": "Shortest Subarray with Sum at Least K",
      "slug": "shortest-subarray-with-sum-at-least-k",
      "difficulty": "hard",
      "note": "Prefix sum + deque."
    },
    {
      "title": "Jump Game VI",
      "slug": "jump-game-vi",
      "difficulty": "medium",
      "note": "DP + monotonic deque."
    },
    {
      "title": "Constrained Subsequence Sum",
      "slug": "constrained-subsequence-sum",
      "difficulty": "hard",
      "note": "Deque on dp."
    },
    {
      "title": "Max Value of Equation",
      "slug": "max-value-of-equation",
      "difficulty": "hard",
      "note": "Deque of candidates."
    },
    {
      "title": "Sliding Window Median",
      "slug": "sliding-window-median",
      "difficulty": "hard",
      "note": "Two heaps not deque."
    },
    {
      "title": "Longest Continuous Subarray",
      "slug": "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
      "difficulty": "medium",
      "note": "Deque min+max."
    },
    {
      "title": "Find the Maximum Number of Fruits Collected",
      "slug": "find-the-maximum-number-of-fruits-collected",
      "difficulty": "hard",
      "note": "Grid + window techniques."
    }
  ],
  pitfalls: "Storing values instead of indices breaks window eviction. Forgetting to pop front when index expired. Wrong inequality (<= vs <) for duplicates.",
  interviewTips: "Say 'deque of indices maintaining decreasing values.' Mention why heap is O(n log k).",
  complexity: [
    {
      "operation": "Sliding window extrema",
      "time": "O(n)",
      "space": "O(k)"
    },
    {
      "operation": "Each index enqueued once",
      "time": "O(n)",
      "space": "O(n)"
    }
  ],
});
