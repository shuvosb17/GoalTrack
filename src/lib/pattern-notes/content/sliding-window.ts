import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("sliding-window")!;

export const article = buildPatternArticle({
  meta,
  summary: "Maintain a window [L,R] over a sequence while preserving an invariant (sum, counts, uniqueness) for O(n) subarray/substring problems.",
  intuition: "Choose **sliding window** when the answer is a contiguous segment and expanding/shrinking the ends monotonically updates a statistic. Fixed-size windows slide one step; variable windows shrink from the left when constraints break.\n\nThe right end explores new elements; the left end discards elements that can no longer belong to any valid future window. Keep auxiliary state (sum, frequency map, distinct count) in sync on both moves. Each index enters and leaves at most once -> O(n).",
  deepDive: "Fixed length k (max sum subarray of size k), variable with sum at most/at least target, at-most K distinct characters, minimum window substring, and binary search on window size when monotonic feasibility holds.\n\nVery common for substring with at most K distinct and minimum window problems. Expect you to articulate expand vs shrink conditions clearly.",
  signals: [
    "Contiguous subarray/substring optimization",
    "Constraint on sum, product, or count inside window",
    "At most / at least / exactly K distinct/repeats",
    "Need O(n) after naive O(n^2) enumeration",
    "Monotonic feasibility when window size increases",
    "String problems with character frequency caps",
    "Array with non-negative numbers and sum targets",
    "Longest/shortest valid segment wording"
  ],
  subpatterns: [
    {
      "name": "Fixed-size window",
      "description": "Add nums[r], remove nums[l] when width exceeds k; update answer each step."
    },
    {
      "name": "Variable shrink-when-invalid",
      "description": "Expand r until invalid, then shrink l until valid again."
    },
    {
      "name": "At-most K helper",
      "description": "Solve at-most K minus at-most K-1 for exactly K distinct."
    },
    {
      "name": "Frequency map window",
      "description": "Track char counts; adjust distinct counter on insert/delete."
    },
    {
      "name": "Binary search on length",
      "description": "Check if any window of length mid satisfies condition."
    },
    {
      "name": "Two pointers on sorted values",
      "description": "Combine with sorting for subsequence-style windows."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int l = 0, best = 0;
        for (int r = 0; r < (int)s.size(); ++r) {
            if (last.count(s[r]) && last[s[r]] >= l) l = last[s[r]] + 1;
            last[s[r]] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Variable window with frequency cap",
    language: "cpp",
    code: `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int characterReplacement(string s, int k) {
        unordered_map<char, int> freq;
        int l = 0, best = 0, maxf = 0;
        for (int r = 0; r < (int)s.size(); ++r) {
            maxf = max(maxf, ++freq[s[r]]);
            while (r - l + 1 - maxf > k) --freq[s[l++]];
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "sliding-window-expand-shrink",
  walkthrough: "For longest substring without repeats, jump `l` past previous index of `s[r]`. For minimum window subsequence templates, expand until valid, then shrink while still valid to minimize length.",
  steps: [
    "Identify if window size is fixed or variable.",
    "Define validity predicate on current [l,r].",
    "Expand r, updating aggregate state.",
    "While invalid, shrink l and undo state updates.",
    "Update answer at the right phase (each r or after shrink).",
    "Prove each index moves O(1) times across loop.",
    "Discuss negatives breaking sum-monotonicity (prefix sum instead)."
  ],
  problems: [
    {
      "title": "Best Time to Buy and Sell Stock",
      "slug": "best-time-to-buy-and-sell-stock",
      "difficulty": "easy",
      "note": "One-pass min so far."
    },
    {
      "title": "Longest Substring Without Repeating Characters",
      "slug": "longest-substring-without-repeating-characters",
      "difficulty": "medium",
      "note": "Jump left past duplicate."
    },
    {
      "title": "Minimum Window Substring",
      "slug": "minimum-window-substring",
      "difficulty": "hard",
      "note": "Shrink when valid."
    },
    {
      "title": "Permutation in String",
      "slug": "permutation-in-string",
      "difficulty": "medium",
      "note": "Fixed multiset match."
    },
    {
      "title": "Max Consecutive Ones III",
      "slug": "max-consecutive-ones-iii",
      "difficulty": "medium",
      "note": "At most k zeros window."
    },
    {
      "title": "Fruit Into Baskets",
      "slug": "fruit-into-baskets",
      "difficulty": "medium",
      "note": "At most 2 types."
    },
    {
      "title": "Subarray Product Less Than K",
      "slug": "subarray-product-less-than-k",
      "difficulty": "medium",
      "note": "Variable window product."
    },
    {
      "title": "Longest Repeating Character Replacement",
      "slug": "longest-repeating-character-replacement",
      "difficulty": "medium",
      "note": "max freq inside window."
    }
  ],
  pitfalls: "Using sliding window on subarray sum with negative numbers - monotonic shrink fails. Off-by-one on window length. Forgetting to update answer after shrinking.",
  interviewTips: "State invariant: 'window always satisfies X' or 'I shrink until valid again.' Draw L and R on the string.",
  complexity: [
    {
      "operation": "Variable window scan",
      "time": "O(n)",
      "space": "O(k) map"
    },
    {
      "operation": "Fixed window",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "Min window typical",
      "time": "O(n)",
      "space": "O(alphabet)"
    }
  ],
});
