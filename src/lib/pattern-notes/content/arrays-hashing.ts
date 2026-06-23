import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("arrays-hashing")!;

export const article = buildPatternArticle({
  meta,
  summary: "Use arrays for sequential access and hash tables for O(1) average lookup, counting, grouping, and complement search.",
  intuition: "Reach for **arrays & hashing** when the problem asks for pairs, frequencies, duplicates, or subarray statistics and a brute-force double loop would be O(n^2). Hashing trades memory for time and keeps the scan single-pass.\n\nArrays preserve order and allow index arithmetic; `unordered_map` / `unordered_set` give expected constant-time membership. The usual recipe: define what you store (value->index, value->count, prefix sum->count), update as you scan left-to-right, and query **before** insert when you must not reuse the same element twice.",
  deepDive: "Complement lookup (Two Sum), frequency signatures (anagrams), prefix-sum counting (subarray sum K), hash-set chaining (longest consecutive), and bucket-by-key grouping (group anagrams). Some problems combine hashing with sorting for ordering requirements.\n\nThis is the most common warm-up family in Bangladesh remote and onsite rounds (Brain Station 23, Cefalo, Samsung R&D, international outsourcing firms). Interviewers expect you to justify O(n) time, mention hash average vs worst case, and handle negatives/zeros without assuming sorted input.",
  signals: [
    "Need fast lookup of a complement, partner value, or prior index",
    "Count or compare character/value frequencies",
    "Detect duplicates or membership in one pass",
    "Subarray sum/product with arbitrary starting index",
    "Group items by normalized key (sorted string, count vector)",
    "Problem explicitly allows O(n) extra space",
    "Constraints up to 10^5 favor linear expected time",
    "Multiset equality or anagram checks"
  ],
  subpatterns: [
    {
      "name": "Complement map",
      "description": "Store value->index; for each x check target-x before inserting x to avoid self-pairing."
    },
    {
      "name": "Frequency histogram",
      "description": "Increment counts per key; compare or decrement for anagram/multiset problems."
    },
    {
      "name": "Hash set membership",
      "description": "Track seen values for duplicates or as anchors to extend consecutive sequences."
    },
    {
      "name": "Prefix sum frequencies",
      "description": "Map prefix sum to count of occurrences to count subarrays with sum K."
    },
    {
      "name": "Signature grouping",
      "description": "Map canonical signature (sorted chars, 26-count array) to buckets of strings."
    },
    {
      "name": "Index map with overwrite",
      "description": "When only latest index matters, update map after processing current position."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            int need = target - nums[i];
            auto it = seen.find(need);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Frequency / multiset check",
    language: "cpp",
    code: `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        unordered_map<char, int> freq;
        for (char c : s) ++freq[c];
        for (char c : t) {
            if (--freq[c] < 0) return false;
        }
        return true;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "frequency-count",
  walkthrough: "Walk through Two Sum: at each index i, check whether `need = target - nums[i]` is already in the map; only then store `nums[i]`. For subarray sum K, when prefix sum is S, add `count[S-K]` to the answer and increment `count[S]`. Initialize `count[0]=1` so subarrays starting at index 0 are counted.",
  steps: [
    "Clarify whether output needs indices, counts, or boolean existence.",
    "Choose map vs set and define the key (value, prefix sum, signature).",
    "Decide query-before-insert vs insert-before-query to avoid reuse bugs.",
    "Handle edge cases: empty input, zeros, negatives, duplicate values.",
    "State complexity: O(n) expected time, O(n) space for hash table.",
    "Trace a 4-element example aloud while coding.",
    "If asked, compare with sort + two pointers trade-offs."
  ],
  problems: [
    {
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "easy",
      "note": "Canonical complement lookup."
    },
    {
      "title": "Contains Duplicate",
      "slug": "contains-duplicate",
      "difficulty": "easy",
      "note": "unordered_set membership."
    },
    {
      "title": "Valid Anagram",
      "slug": "valid-anagram",
      "difficulty": "easy",
      "note": "Frequency map."
    },
    {
      "title": "Group Anagrams",
      "slug": "group-anagrams",
      "difficulty": "medium",
      "note": "Bucket by signature."
    },
    {
      "title": "Top K Frequent Elements",
      "slug": "top-k-frequent-elements",
      "difficulty": "medium",
      "note": "Count then bucket/heap."
    },
    {
      "title": "Subarray Sum Equals K",
      "slug": "subarray-sum-equals-k",
      "difficulty": "medium",
      "note": "Prefix sum + map counts."
    },
    {
      "title": "Longest Consecutive Sequence",
      "slug": "longest-consecutive-sequence",
      "difficulty": "medium",
      "note": "Set anchors for O(n) chains."
    },
    {
      "title": "Product of Array Except Self",
      "slug": "product-of-array-except-self",
      "difficulty": "medium",
      "note": "Prefix products; hash optional."
    }
  ],
  pitfalls: "Do not reuse the same index twice in complement problems. For prefix-sum counting, forgetting `{0:1}` undercounts subarrays starting at 0. Watch integer overflow on prefix sums with large values. Hash maps on characters can use fixed-size array when alphabet is small.",
  interviewTips: "Say aloud: 'I'll store X in a hash map for O(1) lookups as I scan once.' Mention average-case hashing assumptions. Proactively discuss space/time trade-off vs sorting.",
  complexity: [
    {
      "operation": "Hash insert/lookup (avg)",
      "time": "O(1)",
      "space": "O(n)"
    },
    {
      "operation": "Single pass scan",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "Prefix sum + map",
      "time": "O(n)",
      "space": "O(n)"
    },
    {
      "operation": "Group by signature",
      "time": "O(n * k log k)",
      "space": "O(n)"
    }
  ],
});
