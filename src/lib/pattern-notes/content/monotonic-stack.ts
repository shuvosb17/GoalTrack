import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("monotonic-stack")!;

export const article = buildPatternArticle({
  meta,
  summary: "Stack keeping indices/values monotonic to answer next-greater/smaller in linear time.",
  intuition: "Use **monotonic stack** when each element needs nearest greater/smaller to left/right, or histogram area problems.\n\nWhen current violates monotonic property, pop and resolve waiting indices. Increasing stack for next greater; decreasing for span to warmer temperature.",
  deepDive: "Daily temperatures, largest rectangle histogram, sum of subarray minimums, trapping rain water variant, remove k digits.\n\nDaily temperatures and histogram rectangle are high-yield advanced stack problems.",
  signals: [
    "Next greater/smaller element index or value",
    "Histogram maximal rectangle",
    "Contribution of each element as minimum of subarrays",
    "Maintain decreasing/increasing stack of indices",
    "Circular array next greater (double scan)",
    "Remove digits to form smallest number",
    "Stock span problems",
    "O(n) required after O(n^2) naive"
  ],
  subpatterns: [
    {
      "name": "Next greater to right",
      "description": "Pop while current > stack top; assign distance."
    },
    {
      "name": "Histogram area",
      "description": "Pop width when height decreases; use sentinel."
    },
    {
      "name": "Subarray minimum sum",
      "description": "Pop left/right boundaries per element as min."
    },
    {
      "name": "Circular NGE",
      "description": "Traverse array twice or duplicate virtual indices."
    },
    {
      "name": "Monotonic queue hybrid",
      "description": "When need sliding window min - use deque."
    },
    {
      "name": "Lexicographic stack",
      "description": "Pop larger digits while k removals remain."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <stack>
using namespace std;

class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        heights.push_back(0);
        stack<int> st;
        int best = 0;
        for (int i = 0; i < (int)heights.size(); ++i) {
            while (!st.empty() && heights[i] < heights[st.top()]) {
                int h = heights[st.top()]; st.pop();
                int left = st.empty() ? -1 : st.top();
                int w = i - left - 1;
                best = max(best, h * w);
            }
            st.push(i);
        }
        heights.pop_back();
        return best;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Next greater element (indices)",
    language: "cpp",
    code: `#include <vector>
#include <stack>
using namespace std;

class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> res(n, -1);
        stack<int> st;
        for (int i = 0; i < 2 * n; ++i) {
            int idx = i % n;
            while (!st.empty() && nums[idx] > nums[st.top()]) {
                res[st.top()] = nums[idx];
                st.pop();
            }
            if (i < n) st.push(idx);
        }
        return res;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "stack-monotonic",
  walkthrough: "Histogram: when height drops, popped bar's right boundary is current index; left is stack top after pop. Sentinel 0 forces flush.",
  steps: [
    "Decide increasing vs decreasing stack.",
    "Store indices not values when width matters.",
    "Loop elements; drain stack on violation resolving answers.",
    "Push current index.",
    "Add sentinel element if needed.",
    "Clean remaining stack if unanswered.",
    "O(n) amortized argument."
  ],
  problems: [
    {
      "title": "Daily Temperatures",
      "slug": "daily-temperatures",
      "difficulty": "medium",
      "note": "NGE distance."
    },
    {
      "title": "Largest Rectangle in Histogram",
      "slug": "largest-rectangle-in-histogram",
      "difficulty": "hard",
      "note": "Width on pop."
    },
    {
      "title": "Sum of Subarray Minimums",
      "slug": "sum-of-subarray-minimums",
      "difficulty": "medium",
      "note": "Left/right less boundaries."
    },
    {
      "title": "Next Greater Element II",
      "slug": "next-greater-element-ii",
      "difficulty": "medium",
      "note": "Circular stack."
    },
    {
      "title": "Remove K Digits",
      "slug": "remove-k-digits",
      "difficulty": "medium",
      "note": "Monotonic increasing stack."
    },
    {
      "title": "Trapping Rain Water",
      "slug": "trapping-rain-water",
      "difficulty": "hard",
      "note": "Stack or two pointers."
    },
    {
      "title": "132 Pattern",
      "slug": "132-pattern",
      "difficulty": "medium",
      "note": "Stack candidate middle."
    },
    {
      "title": "Car Fleet",
      "slug": "car-fleet",
      "difficulty": "medium",
      "note": "Stack of times."
    }
  ],
  pitfalls: "Forgetting sentinel in histogram. Using value instead of index for width. Infinite loop in circular without limiting pushes.",
  interviewTips: "Explain each element pushed/popped once. Draw histogram bars when popping.",
  complexity: [
    {
      "operation": "Monotonic pass",
      "time": "O(n)",
      "space": "O(n)"
    },
    {
      "operation": "Histogram",
      "time": "O(n)",
      "space": "O(n)"
    }
  ],
});
