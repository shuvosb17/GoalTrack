import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("bit-manipulation")!;

export const article = buildPatternArticle({
  meta,
  summary: "Use XOR/AND/shift properties for parity, subsets, single number, and bitmasks in DP.",
  intuition: "Use **bit manipulation** when problem involves duplicates canceling, power-of-two checks, setting/clearing bits, or enumerating subsets via masks.\n\nXOR: a^a=0, a^0=a commutative cancellation. AND for extracting lowest set bit: n & (n-1). Shift for powers of two. Bitmask DP when state is subset of small n.",
  deepDive: "Single number, count bits, power of two, subset XOR, maximum XOR trie.\n\nSingle number and counting bits are quick wins; bitmask DP appears in advanced rounds.",
  signals: [
    "Exactly one element unique, others paired",
    "Count or toggle bits in integer",
    "Check power of two in O(1)",
    "Enumerate subsets of small n <= 20",
    "XOR cumulative properties",
    "Find missing/duplicate number in array",
    "Bitmask DP over subsets",
    "Low-level memory or flag sets"
  ],
  subpatterns: [
    {
      "name": "XOR cancellation",
      "description": "Xor all numbers; pairs vanish leaving lone value."
    },
    {
      "name": "Brian Kernighan count",
      "description": "n &= n-1 counts set bits."
    },
    {
      "name": "Power of two",
      "description": "n>0 && (n & (n-1))==0."
    },
    {
      "name": "Bitmask enumeration",
      "description": "for mask 0..(1<<n)-1 process subset bits."
    },
    {
      "name": "Bit tricks DP",
      "description": "dp[mask] over subsets for TSP-like."
    },
    {
      "name": "Divide and conquer bits",
      "description": "Count bits in ranges using patterns."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int x = 0;
        for (int n : nums) x ^= n;
        return x;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Count set bits (Brian Kernighan)",
    language: "cpp",
    code: `using namespace std;

class Solution {
public:
    int hammingWeight(uint32_t n) {
        int cnt = 0;
        while (n) {
            n &= (n - 1);
            ++cnt;
        }
        return cnt;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "bit-xor",
  walkthrough: "Single number II (elements thrice) needs bit counts per position mod 3. Subsets: iterate mask and include nums[i] if mask&(1<<i).",
  steps: [
    "Identify algebraic property (XOR, AND, OR).",
    "Write brute force then simplify with bits.",
    "Watch signed vs unsigned shifts in C++.",
    "For subset masks, bound n before 1<<n explosion.",
    "Test edge 0 and INT_MIN carefully.",
    "Combine with hash map if value universe large.",
    "State O(32) or O(n) bit operations."
  ],
  problems: [
    {
      "title": "Single Number",
      "slug": "single-number",
      "difficulty": "easy",
      "note": "XOR pairs."
    },
    {
      "title": "Number of 1 Bits",
      "slug": "number-of-1-bits",
      "difficulty": "easy",
      "note": "Kernighan popcount."
    },
    {
      "title": "Counting Bits",
      "slug": "counting-bits",
      "difficulty": "easy",
      "note": "DP on bits."
    },
    {
      "title": "Missing Number",
      "slug": "missing-number",
      "difficulty": "easy",
      "note": "Xor index/value."
    },
    {
      "title": "Reverse Bits",
      "slug": "reverse-bits",
      "difficulty": "easy",
      "note": "Shift build."
    },
    {
      "title": "Sum of Two Integers",
      "slug": "sum-of-two-integers",
      "difficulty": "medium",
      "note": "Add without +/-."
    },
    {
      "title": "Subsets",
      "slug": "subsets",
      "difficulty": "medium",
      "note": "Bitmask or recursion."
    },
    {
      "title": "Maximum XOR of Two Numbers in an Array",
      "slug": "maximum-xor-of-two-numbers-in-an-array",
      "difficulty": "medium",
      "note": "Bit trie."
    }
  ],
  pitfalls: "Using 1<<n when n=31 overflows int. Forgetting unsigned for right shift of negatives. Not reducing mod for bit DP states.",
  interviewTips: "Write XOR identities on board. Mention O(1) space for single number.",
  complexity: [
    {
      "operation": "XOR scan",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "Bitmask subsets",
      "time": "O(n * 2^n)",
      "space": "O(1)"
    },
    {
      "operation": "Per-bit work",
      "time": "O(32)",
      "space": "O(1)"
    }
  ],
});
