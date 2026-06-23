import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("greedy")!;

export const article = buildPatternArticle({
  meta,
  summary: "Make locally optimal choices that global structure proves safe - especially intervals, scheduling, and coin-like systems.",
  intuition: "Use **greedy** when problem has matroid-like or exchange argument structure: sorting plus one-pass decision works. Always ask: does a local best choice never block a better global solution?\n\nSort by start time, end time, ratio, or deadline. Track current resource (last end, total capacity). If choice fits, take it; else skip or replace. Proof sketch matters in interviews.",
  deepDive: "Interval scheduling, jump game reachability, gas station circuit, task scheduling, Huffman-style merging (heap), partition labels.\n\nJump game and meeting rooms style interval greedies are common mediums.",
  signals: [
    "Schedule maximum non-overlapping intervals",
    "Minimum jumps to reach end",
    "Assign labels with last occurrence constraints",
    "Proof that sorting by finish time works",
    "Exchange argument or stays ahead proof",
    "Simulate with priority of smallest ending",
    "Fractional vs discrete - know when greedy fails",
    "Activity selection wording"
  ],
  subpatterns: [
    {
      "name": "Earliest finish time",
      "description": "Sort by end; take next compatible interval."
    },
    {
      "name": "Farthest reach",
      "description": "Track max reachable index (jump game)."
    },
    {
      "name": "Two-pass greedy",
      "description": "Left-to-right and right-to-left for trapping/assignments."
    },
    {
      "name": "Heap-assisted greedy",
      "description": "Pick smallest/largest available resource dynamically."
    },
    {
      "name": "Lexicographic greedy",
      "description": "Remove digits to form smallest number with length k."
    },
    {
      "name": "Counter greedy",
      "description": "Balance deficits with surpluses in one circuit."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        sort(points.begin(), points.end(), [](auto& a, auto& b) {
            return a[1] < b[1];
        });
        int arrows = 0;
        long long end = LLONG_MIN;
        for (auto& p : points) {
            if (p[0] > end) {
                ++arrows;
                end = p[1];
            }
        }
        return arrows;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Jump game reachability",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); ++i) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
            if (reach >= (int)nums.size() - 1) return true;
        }
        return true;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "greedy-choice",
  walkthrough: "Minimum arrows: sort balloons by xend; shoot at end when current start > last end. Jump game: if index exceeds reach, fail; else extend reach.",
  steps: [
    "Identify sort key (start, end, ratio).",
    "Prove or cite greedy choice property.",
    "Simulate one pass tracking invariant.",
    "Handle edge empty input and single element.",
    "Contrast with DP when greedy fails (0/1 knapsack).",
    "Walk sample intervals on timeline.",
    "State O(n log n) from sort."
  ],
  problems: [
    {
      "title": "Jump Game",
      "slug": "jump-game",
      "difficulty": "medium",
      "note": "Max reach greedy."
    },
    {
      "title": "Merge Intervals",
      "slug": "merge-intervals",
      "difficulty": "medium",
      "note": "Sort by start merge."
    },
    {
      "title": "Non-overlapping Intervals",
      "slug": "non-overlapping-intervals",
      "difficulty": "medium",
      "note": "Greedy by end."
    },
    {
      "title": "Partition Labels",
      "slug": "partition-labels",
      "difficulty": "medium",
      "note": "Last occurrence greedy."
    },
    {
      "title": "Gas Station",
      "slug": "gas-station",
      "difficulty": "medium",
      "note": "Total sum + start index."
    },
    {
      "title": "Task Scheduler",
      "slug": "task-scheduler",
      "difficulty": "medium",
      "note": "Formula + heap variant."
    },
    {
      "title": "Candy",
      "slug": "candy",
      "difficulty": "hard",
      "note": "Two-pass ratings."
    },
    {
      "title": "Minimum Number of Arrows",
      "slug": "minimum-number-of-arrows-to-burst-balloons",
      "difficulty": "medium",
      "note": "End sort greedy."
    }
  ],
  pitfalls: "Greedy on coin change when denominations not canonical - need DP. Wrong sort comparator. Integer overflow on interval ends.",
  interviewTips: "Always mention proof sketch: 'sorting by finish time stays ahead.' Admit when greedy fails.",
  complexity: [
    {
      "operation": "Sort + scan",
      "time": "O(n log n)",
      "space": "O(1)"
    },
    {
      "operation": "Jump linear",
      "time": "O(n)",
      "space": "O(1)"
    }
  ],
});
