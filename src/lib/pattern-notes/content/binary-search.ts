import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("binary-search")!;

export const article = buildPatternArticle({
  meta,
  summary: "Halve the search space on sorted data or on an implicit monotonic predicate over an answer range.",
  intuition: "Use **binary search** when you can sort static data for lookup, or when feasibility `can(mid)` is monotonic: false...false,true...true. The second form (binary search on answer) is critical for minimize maximum / maximize minimum problems.\n\nMaintain invariant that answer lies in [lo, hi]. Each step probes mid, discards half based on predicate truth. For answer-space search, lo/hi are integers representing the value you will return, not array indices.",
  deepDive: "Classic index search, lower/upper bound, rotated sorted array, binary search on answer (capacity, speed, minimize max), and ternary search on unimodal functions (less common).\n\nBD firms often ask Koko Eating Bananas / capacity style 'minimize the maximum' - recognize answer-space BS quickly.",
  signals: [
    "Sorted array or sortable static data",
    "Find boundary of first true in monotonic predicate",
    "Minimize maximum or maximize minimum feasible value",
    "O(log n) required on large constraints",
    "Rotated sorted array with broken monotonic segment",
    "Search insert position / range bounds",
    "Peak finding on implicit terrain",
    "Capacity, speed, or partition feasibility checks"
  ],
  subpatterns: [
    {
      "name": "Index binary search",
      "description": "lo=0, hi=n-1 on sorted vector for exact or bound positions."
    },
    {
      "name": "Answer-space search",
      "description": "hi = max possible answer; check if feasible(mid) then move lo/hi."
    },
    {
      "name": "Lower/upper bound",
      "description": "First index with nums[i] >= x using half-open interval tricks."
    },
    {
      "name": "Rotated array",
      "description": "Identify sorted half each step to discard safely."
    },
    {
      "name": "Binary search on prefix",
      "description": "Predicate over prefix length rather than value."
    },
    {
      "name": "Fractional binary search",
      "description": "Real-valued answer with fixed iterations (rare in interviews)."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Binary search on answer (feasibility)",
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        auto can = [&](int speed) {
            long long hours = 0;
            for (int p : piles) hours += (p + speed - 1) / speed;
            return hours <= h;
        };
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (can(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "binary-search-space",
  walkthrough: "Separate **index search** from **value search**. For value search, write `can(mid)` first, prove monotonicity, then binary search lo..hi inclusive-exclusive consistently (`while lo < hi`).",
  steps: [
    "Determine search domain: indices vs answer value.",
    "Define monotonic predicate or sorted order property.",
    "Pick loop style: `lo<=hi` with return or `lo<hi` with lo answer.",
    "Implement mid without overflow: lo + (hi-lo)/2.",
    "Adjust bounds carefully on equals vs strict.",
    "Test on small array including misses and duplicates.",
    "State O(log n) time, O(1) space."
  ],
  problems: [
    {
      "title": "Binary Search",
      "slug": "binary-search",
      "difficulty": "easy",
      "note": "Classic index search."
    },
    {
      "title": "Search Insert Position",
      "slug": "search-insert-position",
      "difficulty": "easy",
      "note": "Lower bound."
    },
    {
      "title": "Find Minimum in Rotated Sorted Array",
      "slug": "find-minimum-in-rotated-sorted-array",
      "difficulty": "medium",
      "note": "Rotated BS."
    },
    {
      "title": "Koko Eating Bananas",
      "slug": "koko-eating-bananas",
      "difficulty": "medium",
      "note": "Answer-space BS."
    },
    {
      "title": "Median of Two Sorted Arrays",
      "slug": "median-of-two-sorted-arrays",
      "difficulty": "hard",
      "note": "Partition BS."
    },
    {
      "title": "Split Array Largest Sum",
      "slug": "split-array-largest-sum",
      "difficulty": "hard",
      "note": "Minimize maximum subarray sum."
    },
    {
      "title": "Find Peak Element",
      "slug": "find-peak-element",
      "difficulty": "medium",
      "note": "Local compare BS."
    },
    {
      "title": "Sqrt(x)",
      "slug": "sqrtx",
      "difficulty": "easy",
      "note": "Answer search on integer root."
    }
  ],
  pitfalls: "Infinite loops from wrong `mid` updates. Mixing 0-based and 1-based bounds. Using BS on unsorted data without monotonic predicate.",
  interviewTips: "Always say whether you binary search on **index** or **answer**. Write feasibility function before the loop.",
  complexity: [
    {
      "operation": "Index BS",
      "time": "O(log n)",
      "space": "O(1)"
    },
    {
      "operation": "Answer BS + check O(n)",
      "time": "O(n log V)",
      "space": "O(1)"
    },
    {
      "operation": "Rotated search",
      "time": "O(log n)",
      "space": "O(1)"
    }
  ],
});
