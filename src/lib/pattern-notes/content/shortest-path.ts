import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("shortest-path")!;

export const article = buildPatternArticle({
  meta,
  summary: "Weighted graphs: Dijkstra, Bellman-Ford, Floyd-Warshall for shortest paths.",
  intuition: "**Dijkstra** with min-heap on non-negative weights. **Bellman-Ford** handles negative edges (V-1 relaxations). **Floyd** all-pairs O(V³). For grids, Dijkstra on cells with cost.",
  signals: ["Network delay / travel time", "Cheapest flights with K stops", "Min effort path on grid", "Negative edge (rare) → Bellman-Ford"],
  subpatterns: [
    { name: "Dijkstra", description: "Greedy expand closest unvisited node." },
    { name: "Bellman-Ford", description: "Relax all edges V-1 times." },
    { name: "Floyd-Warshall", description: "DP on intermediate nodes k." },
    { name: "0-1 BFS", description: "Deque for weights 0 and 1 only." },
  ],
  templateCode: {
    language: "typescript",
    code: `function networkDelay(times: number[][], n: number, k: number): number {
  const adj: [number,number][][] = Array.from({length:n+1}, () => []);
  for (const [u,v,w] of times) adj[u].push([v,w]);
  const dist = Array(n+1).fill(Infinity);
  dist[k] = 0;
  const pq = new MinPriorityQueue<[number,number]>({ priority: x => x[0] });
  pq.enqueue([0, k]);
  while (!pq.isEmpty()) {
    const [d,u] = pq.dequeue()!;
    if (d > dist[u]) continue;
    for (const [v,w] of adj[u])
      if (d + w < dist[v]) { dist[v] = d + w; pq.enqueue([dist[v], v]); }
  }
  const max = Math.max(...dist.slice(1));
  return max === Infinity ? -1 : max;
}`,
    caption: "Min-priority queue by distance.",
  },
  viz: "graph-bfs-dfs",
  walkthrough: "**Cheapest Flights Within K Stops**: BFS by layers or Bellman-Ford limited to K+1 relaxations.",
  problems: [
    { title: "Network Delay Time", slug: "network-delay-time", difficulty: "medium", note: "Dijkstra from source." },
    { title: "Cheapest Flights Within K Stops", slug: "cheapest-flights-within-k-stops", difficulty: "medium", note: "K+1 relaxations." },
    { title: "Path With Minimum Effort", slug: "path-with-minimum-effort", difficulty: "medium", note: "Dijkstra on grid." },
  ],
  pitfalls: "Skip stale heap entries (`if d > dist[u] continue`). Index nodes 1..n vs 0..n-1 carefully.",
  complexity: [{ operation: "Dijkstra", time: "O((V+E) log V)", space: "O(V+E)" }],
});
