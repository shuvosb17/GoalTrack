import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("math-number-theory")!;

export const article = buildPatternArticle({
  meta,
  summary: "GCD, primes, modular arithmetic, and numeric tricks for math-flavored problems.",
  intuition: "Know **Euclidean GCD**, sieve for primes, fast exponentiation. Many problems reduce to number properties rather than data structures.",
  signals: ["GCD/LCM of values", "Prime counting", "Modular pow", "Detect cycles in sequence (Floyd on values)"],
  subpatterns: [
    { name: "GCD / LCM", description: "Euclid: gcd(a,b)=gcd(b,a%b)." },
    { name: "Prime sieve", description: "Sieve of Eratosthenes up to n." },
    { name: "Modular arithmetic", description: "(a*b)%m with bigint if needed." },
    { name: "Cycle detection", description: "Happy number — Floyd on next function." },
  ],
  templateCode: {
    language: "typescript",
    code: `function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

function isHappy(n: number): boolean {
  const next = (x: number) => String(x).split("").reduce((s,d) => s + (+d)**2, 0);
  let slow = n, fast = n;
  do { slow = next(slow); fast = next(next(fast)); } while (slow !== fast);
  return slow === 1;
}`,
  },
  walkthrough: "**Pow(x,n)**: binary exponentiation — square base, halve exponent, multiply result when bit set.",
  problems: [
    { title: "Happy Number", slug: "happy-number", difficulty: "easy", note: "Cycle detection." },
    { title: "Pow(x, n)", slug: "powx-n", difficulty: "medium", note: "Fast pow." },
    { title: "Count Primes", slug: "count-primes", difficulty: "medium", note: "Sieve." },
  ],
  pitfalls: "Watch overflow — use BigInt or mod throughout. Negative numbers in mod need adjustment.",
  complexity: [{ operation: "GCD", time: "O(log min(a,b))", space: "O(1)" }],
});
