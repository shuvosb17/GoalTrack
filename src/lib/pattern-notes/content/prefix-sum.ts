import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("prefix-sum")!;

export const article = buildPatternArticle({
  meta,
  summary: "Precompute cumulative sums or XOR to answer range queries and subarray problems in O(1) after O(n) build.",
  intuition: "Use **prefix sums** when many queries ask sum(l..r) or count subarrays with target using map of prefix frequencies.\n\nprefix[i] = prefix[i-1] + nums[i]. Range sum is prefix[r+1]-prefix[l]. For subarray sum K, count prior prefixes with value current-K.",
  deepDive: "2D prefix for matrices, prefix XOR, difference array for range updates, prefix + hash map.\n\nSubarray sum equals K and range sum queries are common; mention 1-based prefix indexing.",
  signals: [
    "Multiple range sum queries on static array",
    "Count subarrays with sum exactly K",
    "2D rectangle sum queries",
    "Range update then point query (difference array)",
    "Xor subarray problems",
    "Transform subarray condition to prefix difference",
    "Modular prefix counts for divisibility",
    "Need O(1) query after O(n) preprocess"
  ],
  subpatterns: [
    {
      "name": "1D prefix sum",
      "description": "Build pref; query l..r via pref[r+1]-pref[l]."
    },
    {
      "name": "Prefix + hash map",
      "description": "Count complements of current prefix sum."
    },
    {
      "name": "2D prefix",
      "description": "pref[i][j] includes rectangle (0,0)-(i,j)."
    },
    {
      "name": "Difference array",
      "description": "Add val at l, subtract at r+1; prefix to recover."
    },
    {
      "name": "Prefix XOR",
      "description": "Xor subarray equals pref[r+1]^pref[l]."
    },
    {
      "name": "Prefix mod counts",
      "description": "Subarrays divisible by k via mod buckets."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<long long, int> cnt;
        cnt[0] = 1;
        long long pref = 0, ans = 0;
        for (int x : nums) {
            pref += x;
            if (cnt.count(pref - k)) ans += cnt[pref - k];
            ++cnt[pref];
        }
        return (int)ans;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Range sum query immutable",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class NumArray {
    vector<long long> pref;
public:
    NumArray(vector<int>& nums) {
        pref.resize(nums.size() + 1);
        for (int i = 0; i < (int)nums.size(); ++i) pref[i + 1] = pref[i] + nums[i];
    }
    int sumRange(int left, int right) {
        return (int)(pref[right + 1] - pref[left]);
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "prefix-sum",
  walkthrough: "Map stores how many times each prefix sum appeared. When current prefix is S, add count of S-K to answer before incrementing S.",
  steps: [
    "Choose prefix definition (0-based vs 1-based).",
    "Build prefix array if static queries.",
    "For counting subarrays, combine with hash map.",
    "Initialize map with zero prefix count 1.",
    "Use long long for prefix sums if negatives large.",
    "For 2D, include inclusion-exclusion corners.",
    "State O(n) build, O(1) or O(n) per query type."
  ],
  problems: [
    {
      "title": "Range Sum Query - Immutable",
      "slug": "range-sum-query-immutable",
      "difficulty": "easy",
      "note": "Prefix array class."
    },
    {
      "title": "Subarray Sum Equals K",
      "slug": "subarray-sum-equals-k",
      "difficulty": "medium",
      "note": "Prefix + map."
    },
    {
      "title": "Continuous Subarray Sum",
      "slug": "continuous-subarray-sum",
      "difficulty": "medium",
      "note": "Prefix mod k."
    },
    {
      "title": "Product of Array Except Self",
      "slug": "product-of-array-except-self",
      "difficulty": "medium",
      "note": "Prefix/suffix products."
    },
    {
      "title": "Find Pivot Index",
      "slug": "find-pivot-index",
      "difficulty": "easy",
      "note": "Prefix left/right."
    },
    {
      "title": "Subarray Sums Divisible by K",
      "slug": "subarray-sums-divisible-by-k",
      "difficulty": "medium",
      "note": "Mod prefix counts."
    },
    {
      "title": "Range Sum Query 2D - Immutable",
      "slug": "range-sum-query-2d-immutable",
      "difficulty": "medium",
      "note": "2D prefix."
    },
    {
      "title": "Corporate Flight Bookings",
      "slug": "corporate-flight-bookings",
      "difficulty": "medium",
      "note": "Difference array."
    }
  ],
  pitfalls: "Forgetting cnt[0]=1. Using int prefix with large sums. Off-by-one in sumRange indices.",
  interviewTips: "Write prefix formula on board. Clarify inclusive range indices.",
  complexity: [
    {
      "operation": "Build prefix",
      "time": "O(n)",
      "space": "O(n)"
    },
    {
      "operation": "Range query",
      "time": "O(1)",
      "space": "O(n)"
    },
    {
      "operation": "Subarray sum K",
      "time": "O(n)",
      "space": "O(n)"
    }
  ],
});
