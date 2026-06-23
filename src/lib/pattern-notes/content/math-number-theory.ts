import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("math-number-theory")!;

export const article = buildPatternArticle({
  meta,
  summary: "Apply primes, GCD/LCM, modular arithmetic, and combinatorics to reduce brute force in number problems.",
  intuition: "Use **math & number theory** when constraints involve divisibility, prime factorization, modulo 1e9+7, or counting coprime pairs.\n\nFactor via sqrt(n) trial division. gcd(a,b) with Euclidean algorithm. Use mod properties for overflow. Combinatorics nCr with Pascal or factorial inverse mod prime.",
  deepDive: "Sieve of Eratosthenes, fast exponentiation, modular inverse, counting primes in range.\n\nLess frequent but appears in math-heavy screens; show you know mod and gcd basics.",
  signals: [
    "Divisors/multiples counting",
    "Prime check or sieve up to N",
    "GCD/LCM of array or pairs",
    "Modulo 10^9+7 counting",
    "nCr combinations large n",
    "Coprime counting inclusion-exclusion",
    "Pow(x,n) in log n",
    "Game theory nim/grundy (rare)"
  ],
  subpatterns: [
    {
      "name": "Euclidean GCD",
      "description": "gcd(a,b)=gcd(b,a%b) until zero."
    },
    {
      "name": "Sieve primes",
      "description": "Boolean array marking multiples starting at p*p."
    },
    {
      "name": "Modular exp",
      "description": "Binary exponentiation for pow mod."
    },
    {
      "name": "nCr mod prime",
      "description": "fact[i], invFact[i] precompute."
    },
    {
      "name": "Inclusion-exclusion",
      "description": "Count multiples with mobius-like signs."
    },
    {
      "name": "Digit math",
      "description": "Count numbers with digit constraints without string DP."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <numeric>
using namespace std;

class Solution {
public:
    int gcdArray(vector<int>& nums) {
        int g = 0;
        for (int x : nums) g = gcd(g, x);
        return g;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Binary exponentiation mod",
    language: "cpp",
    code: `using namespace std;

class Solution {
public:
    long long modPow(long long a, long long e, long long mod) {
        long long res = 1 % mod;
        a %= mod;
        while (e > 0) {
            if (e & 1) res = res * a % mod;
            a = a * a % mod;
            e >>= 1;
        }
        return res;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  walkthrough: "For count primes up to n, sieve marks composites. For unique paths modulo, use long long and mod at each multiply.",
  steps: [
    "Identify number property (prime, gcd, mod).",
    "Choose algorithm within sqrt(n) or sieve budget.",
    "Watch overflow - cast to long long before multiply.",
    "Apply mod only at end vs each step as needed.",
    "Prove loop bounds for factorization.",
    "Handle edge n=0,1 in combinatorics.",
    "State complexity O(sqrt n) or O(n log log n)."
  ],
  problems: [
    {
      "title": "Pow(x, n)",
      "slug": "powx-n",
      "difficulty": "medium",
      "note": "Binary exp."
    },
    {
      "title": "Sqrt(x)",
      "slug": "sqrtx",
      "difficulty": "easy",
      "note": "Binary search."
    },
    {
      "title": "Count Primes",
      "slug": "count-primes",
      "difficulty": "medium",
      "note": "Sieve."
    },
    {
      "title": "Ugly Number II",
      "slug": "ugly-number-ii",
      "difficulty": "medium",
      "note": "Min heap multiples."
    },
    {
      "title": "Max Points on a Line",
      "slug": "max-points-on-a-line",
      "difficulty": "hard",
      "note": "GCD normalized slope."
    },
    {
      "title": "Happy Number",
      "slug": "happy-number",
      "difficulty": "easy",
      "note": "Cycle detection math."
    },
    {
      "title": "Factorial Trailing Zeroes",
      "slug": "factorial-trailing-zeroes",
      "difficulty": "medium",
      "note": "Count factors of 5."
    },
    {
      "title": "Nth Magical Number",
      "slug": "nth-magical-number",
      "difficulty": "hard",
      "note": "Binary search + inclusion-exclusion."
    }
  ],
  pitfalls: "Integer overflow before mod. Forgetting 1 is not prime. GCD with negative numbers - use abs.",
  interviewTips: "State mod prime assumptions for inverse. Mention sieve memory O(n).",
  complexity: [
    {
      "operation": "Euclidean gcd",
      "time": "O(log min(a,b))",
      "space": "O(1)"
    },
    {
      "operation": "Sieve to N",
      "time": "O(N log log N)",
      "space": "O(N)"
    },
    {
      "operation": "Mod pow",
      "time": "O(log e)",
      "space": "O(1)"
    }
  ],
});
