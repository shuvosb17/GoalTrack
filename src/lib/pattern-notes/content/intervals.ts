import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("intervals")!;

export const article = buildPatternArticle({
  meta,
  summary: "Sort interval endpoints and sweep to merge, insert, or measure overlap - core scheduling geometry on the line.",
  intuition: "Use **intervals** when input is ranges [start,end] and answer needs merged coverage, conflicts, or insertion point. Sorting by start or end unlocks linear sweeps.\n\nAfter sorting, compare current interval with last in result list. Overlap if `start <= lastEnd` (watch inclusive/exclusive). For meeting rooms II, min-heap of end times tracks concurrent meetings.",
  deepDive: "Merge, insert, intersection, employee free time, meeting rooms count, sweep line with +1/-1 events.\n\nMerge intervals and meeting rooms are BD staples - clarify inclusive boundaries.",
  signals: [
    "List of [start,end] pairs",
    "Merge overlapping ranges",
    "Count maximum concurrent overlaps",
    "Insert new interval into sorted list",
    "Interval intersection of two lists",
    "Sweep line / difference array on timeline",
    "Minimum arrows or points to cover",
    "Calendar booking follow-ups"
  ],
  subpatterns: [
    {
      "name": "Merge after sort",
      "description": "Sort by start; extend last end while overlapping."
    },
    {
      "name": "Insert interval",
      "description": "Linear merge pass with three phases."
    },
    {
      "name": "Heap overlap count",
      "description": "Sort starts; push ends; pop if earliest end <= start."
    },
    {
      "name": "Sweep line events",
      "description": "+1 at start, -1 after end for peak concurrency."
    },
    {
      "name": "Two-pointer intersection",
      "description": "Advance list with smaller ending interval."
    },
    {
      "name": "Interval DP",
      "description": "Rare: weighted intervals use DP + binary search."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        for (auto& in : intervals) {
            if (res.empty() || res.back()[1] < in[0]) res.push_back(in);
            else res.back()[1] = max(res.back()[1], in[1]);
        }
        return res;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Meeting rooms II (min end-time heap)",
    language: "cpp",
    code: `#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        priority_queue<int, vector<int>, greater<int>> pq;
        for (auto& iv : intervals) {
            if (!pq.empty() && pq.top() <= iv[0]) pq.pop();
            pq.push(iv[1]);
        }
        return (int)pq.size();
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "interval-merge",
  walkthrough: "Merge: non-overlap when new start > last end. Meeting rooms: after sorting by start, free a room if smallest ending meeting finished before current start.",
  steps: [
    "Clarify inclusive vs exclusive interval ends.",
    "Choose sort key (start vs end).",
    "Linear scan building output list.",
    "For overlap count, use min-heap of end times.",
    "Test touching intervals [1,2] and [2,3].",
    "Discuss sweep line alternative.",
    "Complexity O(n log n)."
  ],
  problems: [
    {
      "title": "Merge Intervals",
      "slug": "merge-intervals",
      "difficulty": "medium",
      "note": "Sort merge."
    },
    {
      "title": "Insert Interval",
      "slug": "insert-interval",
      "difficulty": "medium",
      "note": "Three-phase merge."
    },
    {
      "title": "Meeting Rooms II",
      "slug": "meeting-rooms-ii",
      "difficulty": "medium",
      "note": "Heap count."
    },
    {
      "title": "Non-overlapping Intervals",
      "slug": "non-overlapping-intervals",
      "difficulty": "medium",
      "note": "Greedy end sort."
    },
    {
      "title": "Interval List Intersections",
      "slug": "interval-list-intersections",
      "difficulty": "medium",
      "note": "Two pointers."
    },
    {
      "title": "Employee Free Time",
      "slug": "employee-free-time",
      "difficulty": "hard",
      "note": "Merge all then gaps."
    },
    {
      "title": "My Calendar I",
      "slug": "my-calendar-i",
      "difficulty": "medium",
      "note": "Overlap check."
    },
    {
      "title": "Data Stream as Disjoint Intervals",
      "slug": "data-stream-as-disjoint-intervals",
      "difficulty": "hard",
      "note": "Map/sorted intervals."
    }
  ],
  pitfalls: "Off-by-one on touching intervals. Forgetting to sort before merge. Using wrong heap polarity.",
  interviewTips: "Draw number line merges. State whether [1,2] overlaps [2,3].",
  complexity: [
    {
      "operation": "Sort + merge",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    {
      "operation": "Meeting rooms heap",
      "time": "O(n log n)",
      "space": "O(n)"
    }
  ],
});
