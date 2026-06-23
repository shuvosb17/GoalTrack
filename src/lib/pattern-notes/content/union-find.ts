import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("union-find")!;

export const article = buildPatternArticle({
  meta,
  summary: "Disjoint Set Union (DSU) tracks connected components with near-constant union/find.",
  intuition: "Maintain `parent[]` and `rank[]`. **Find** with path compression; **union** by rank. Perfect for dynamic connectivity and detecting cycles in undirected graphs.",
  signals: ["Connected components online", "Detect cycle when adding edge", "Accounts merge / redundant connection", "Count islands dynamically"],
  subpatterns: [
    { name: "Path compression", description: "Point nodes directly to root on find." },
    { name: "Union by rank/size", description: "Attach smaller tree under larger." },
    { name: "Component counting", description: "Decrement count on successful union." },
  ],
  templateCode: {
    language: "typescript",
    code: `class UnionFind {
  parent: number[]; rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}`,
  },
  viz: "union-find",
  walkthrough: "**Redundant Connection**: process edges; first edge connecting already-connected nodes is redundant (cycle edge).",
  problems: [
    { title: "Redundant Connection", slug: "redundant-connection", difficulty: "medium", note: "Cycle detection." },
    { title: "Number of Provinces", slug: "number-of-provinces", difficulty: "medium", note: "Count components." },
    { title: "Accounts Merge", slug: "accounts-merge", difficulty: "medium", note: "Union emails." },
  ],
  pitfalls: "0-index vs 1-index nodes. Path compression is essential for performance.",
  complexity: [{ operation: "Union/find amortized", time: "O(α(n))", space: "O(n)" }],
});
