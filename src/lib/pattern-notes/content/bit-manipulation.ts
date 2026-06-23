import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("bit-manipulation")!;

export const article = buildPatternArticle({
  meta,
  summary: "Use bitwise ops for compact state, parity, and O(1) tricks.",
  intuition: "**XOR** cancels pairs. **AND** masks bits. Shifts multiply/divide by 2. Bitmask DP represents subsets as integers.",
  signals: ["Single number among pairs", "Count set bits", "Subset enumeration with mask", "Power of two check"],
  subpatterns: [
    { name: "XOR trick", description: "a^a=0, a^0=a — find unique element." },
    { name: "Bit masking", description: "mask & (1<<i) tests bit i." },
    { name: "Brian Kernighan", description: "n &= n-1 removes lowest set bit." },
  ],
  templateCode: {
    language: "typescript",
    code: `function singleNumber(nums: number[]): number {
  let x = 0;
  for (const n of nums) x ^= n;
  return x;
}

function hammingWeight(n: number): number {
  let count = 0;
  while (n) { n &= n - 1; count++; }
  return count;
}`,
  },
  viz: "bit-xor",
  walkthrough: "**Counting Bits**: `dp[i] = dp[i >> 1] + (i & 1)` — bits in i = bits in half plus LSB.",
  problems: [
    { title: "Single Number", slug: "single-number", difficulty: "easy", note: "XOR all." },
    { title: "Missing Number", slug: "missing-number", difficulty: "easy", note: "XOR index and value." },
    { title: "Counting Bits", slug: "counting-bits", difficulty: "easy", note: "DP on bits." },
  ],
  pitfalls: "JS numbers are 32-bit for bitwise — use `>>> 0` for unsigned. Watch sign extension on right shift.",
  complexity: [{ operation: "Bit scan", time: "O(1) or O(log n)", space: "O(1)" }],
});
