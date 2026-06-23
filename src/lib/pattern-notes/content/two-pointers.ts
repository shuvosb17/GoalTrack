import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("two-pointers")!;

export const article = buildPatternArticle({
  meta,
  summary: "Maintain two indices (or fast/slow) to shrink the search space from O(n^2) to O(n) on sorted arrays, in-place tasks, or linked lists.",
  intuition: "Use **two pointers** when data is sorted (or you can sort) and answers depend on comparing ends or maintaining a valid prefix while scanning. Opposite-end pointers encode a monotonic discard rule; same-direction pointers compact or filter in-place.\n\nEach pointer move should eliminate a class of impossible candidates. On a sorted array, if the current pair sum is too small, advancing left increases sum; if too large, shrinking right decreases sum - each index moves at most n times. Same-direction `writer/reader` maintains an invariant prefix of valid elements.",
  deepDive: "Opposite ends (pair sum, palindrome, container area), reader/writer compaction (remove duplicates), fast/slow on lists (cycle, middle), outer fixed index + inner two pointers (3Sum/4Sum), and Dutch-flag three pointers for 0/1/2 partitions.\n\nFrequently tested for palindrome, two-sum on sorted data, and 3Sum-style deduplication. Bangladesh interviewers like hearing the **monotonicity** argument for why pointers never skip the answer.",
  signals: [
    "Sorted array or sort is acceptable",
    "Find pairs/triplets with sum or product targets",
    "In-place removal or deduplication of sorted duplicates",
    "Palindrome or symmetric checks",
    "Maximize area/volume with two boundaries",
    "Partition into categories (sort colors)",
    "Linked list cycle or middle node",
    "Need O(1) extra space after sorting"
  ],
  subpatterns: [
    {
      "name": "Opposite ends",
      "description": "l=0, r=n-1; move based on comparison to target or greedy maximization rule."
    },
    {
      "name": "Reader/writer",
      "description": "Reader explores; writer marks end of valid prefix for overwrite algorithms."
    },
    {
      "name": "Fast & slow",
      "description": "Detect cycles, find midpoint, or kth from end on linked lists."
    },
    {
      "name": "Fixed + pair",
      "description": "Fix one index; run opposite pointers on the subarray to its right."
    },
    {
      "name": "Three-way partition",
      "description": "low/mid/high pointers for 0-1-2 sorting in one pass."
    },
    {
      "name": "Merge two sorted arrays",
      "description": "Tail fill from ends to keep O(1) extra space."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSumSorted(vector<int>& numbers, int target) {
        int l = 0, r = (int)numbers.size() - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return {l + 1, r + 1};
            if (sum < target) ++l;
            else --r;
        }
        return {};
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "In-place deduplication (writer pointer)",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int w = 1;
        for (int r = 1; r < (int)nums.size(); ++r) {
            if (nums[r] != nums[r - 1]) nums[w++] = nums[r];
        }
        return w;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "two-pointer-opposite",
  walkthrough: "For 3Sum: sort, iterate i, run two pointers on (i+1..n-1). When sum is zero, record and skip duplicate left/right values. For container water, always move the pointer at the shorter line because height is limited by the shorter side.",
  steps: [
    "Confirm sorting is allowed and whether original indices matter.",
    "Pick opposite vs same-direction vs fast/slow.",
    "Define loop invariant (what [l,r] or prefix represents).",
    "Prove each pointer moves O(n) times total.",
    "Add deduplication skips for equal values on sorted arrays.",
    "Implement with careful `<` vs `<=` boundaries.",
    "State overall complexity including sort if used."
  ],
  problems: [
    {
      "title": "Valid Palindrome",
      "slug": "valid-palindrome",
      "difficulty": "easy",
      "note": "Opposite ends with skips."
    },
    {
      "title": "Two Sum II",
      "slug": "two-sum-ii-input-array-is-sorted",
      "difficulty": "medium",
      "note": "Sorted two pointers."
    },
    {
      "title": "3Sum",
      "slug": "3sum",
      "difficulty": "medium",
      "note": "Fix i + pair scan."
    },
    {
      "title": "Container With Most Water",
      "slug": "container-with-most-water",
      "difficulty": "medium",
      "note": "Move shorter side."
    },
    {
      "title": "Trapping Rain Water",
      "slug": "trapping-rain-water",
      "difficulty": "hard",
      "note": "Two pointer or stack."
    },
    {
      "title": "Remove Duplicates from Sorted Array",
      "slug": "remove-duplicates-from-sorted-array",
      "difficulty": "easy",
      "note": "Writer pointer."
    },
    {
      "title": "Sort Colors",
      "slug": "sort-colors",
      "difficulty": "medium",
      "note": "Dutch flag."
    },
    {
      "title": "4Sum",
      "slug": "4sum",
      "difficulty": "medium",
      "note": "Double outer loop + pair."
    }
  ],
  pitfalls: "Forgetting to sort before opposite-end search. In 3Sum/4Sum, not skipping duplicate i or duplicate tuple ends produces duplicates. Off-by-one when returning 1-based indices (Two Sum II).",
  interviewTips: "Explain why moving the shorter container pointer is safe. Mention that sorting enables two pointers but costs O(n log n).",
  complexity: [
    {
      "operation": "Opposite scan",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "3Sum with sort",
      "time": "O(n^2)",
      "space": "O(1) extra"
    },
    {
      "operation": "Fast/slow list",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "Dutch flag",
      "time": "O(n)",
      "space": "O(1)"
    }
  ],
});
