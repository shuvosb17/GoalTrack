import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("shortest-path")!;

export const article = buildPatternArticle({
  meta,
  summary: "Compute minimum-cost paths in weighted graphs: BFS (unweighted), Dijkstra (non-negative), Bellman-Ford (negative edges).",
  intuition: "Use **shortest path** on explicit weighted graphs, grids with costs, or network delay times. Dijkstra with priority queue is default for non-negative weights.\n\nRelax edges from settled nodes. dist[start]=0; pop min dist node; if stale skip; for each neighbor if dist[u]+w < dist[v] update. For grid, encode cell as node.",
  deepDive: "0-1 BFS (deque), multi-source BFS, Dijkstra, Bellman-Ford, Floyd-Warshall small n.\n\nNetwork delay / cheapest flights within K stops blend Dijkstra and Bellman-Ford thinking.",
  signals: [
    "Weighted directed graph shortest route",
    "Non-negative edge weights",
    "Grid with cost per cell",
    "K stops or limited hops variant",
    "Multiple sources same start cost 0",
    "Need path not just distance sometimes",
    "Sparse graph with adjacency list",
    "Time-dependent or state-expanded graph"
  ],
  subpatterns: [
    {
      "name": "Dijkstra heap",
      "description": "Min-heap on dist; relax neighbors."
    },
    {
      "name": "0-1 BFS",
      "description": "Deque for weights 0 push front, 1 push back."
    },
    {
      "name": "Multi-source BFS",
      "description": "Initialize all sources dist 0 in queue."
    },
    {
      "name": "Bellman-Ford",
      "description": "Relax all edges V-1 times; detect negative cycle."
    },
    {
      "name": "State graph",
      "description": "Node is (city, stopsUsed) for flight limits."
    },
    {
      "name": "Grid Dijkstra",
      "description": "4-dir moves with edge weight cell cost."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <queue>
#include <utility>
using namespace std;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> adj(n + 1);
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        const int INF = 1e9;
        vector<int> dist(n + 1, INF);
        dist[k] = 0;
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d != dist[u]) continue;
            for (auto [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.push({dist[v], v});
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; ++i) ans = max(ans, dist[i]);
        return ans == INF ? -1 : ans;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Bellman-Ford relaxation",
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1e9;
        vector<int> dist(n, INF), prev(n, INF);
        dist[src] = 0;
        for (int i = 0; i <= k; ++i) {
            prev = dist;
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (prev[u] != INF && prev[u] + w < dist[v]) dist[v] = prev[u] + w;
            }
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  walkthrough: "Stale heap entries skipped via `if (d != dist[u])`. For k stops, relax rounds copy previous dist layer to avoid using more than k+1 edges in one round incorrectly - use temp array.",
  steps: [
    "Build adjacency with weights.",
    "Initialize dist array INF, source 0.",
    "Choose Dijkstra vs Bellman-Ford vs BFS.",
    "Push start in priority queue or deque.",
    "Relax edges; skip stale heap nodes.",
    "Return dist[target] or max over nodes.",
    "State O((V+E) log V) for Dijkstra."
  ],
  problems: [
    {
      "title": "Network Delay Time",
      "slug": "network-delay-time",
      "difficulty": "medium",
      "note": "Dijkstra from source."
    },
    {
      "title": "Cheapest Flights Within K Stops",
      "slug": "cheapest-flights-within-k-stops",
      "difficulty": "medium",
      "note": "Bellman-Ford layers."
    },
    {
      "title": "Path with Minimum Effort",
      "slug": "path-with-minimum-effort",
      "difficulty": "medium",
      "note": "Dijkstra on grid."
    },
    {
      "title": "Swim in Rising Water",
      "slug": "swim-in-rising-water",
      "difficulty": "hard",
      "note": "Binary search + BFS or Dijkstra."
    },
    {
      "title": "Shortest Path in Binary Matrix",
      "slug": "shortest-path-in-binary-matrix",
      "difficulty": "medium",
      "note": "BFS unweighted."
    },
    {
      "title": "Reconstruct Itinerary",
      "slug": "reconstruct-itinerary",
      "difficulty": "hard",
      "note": "Eulerian path Hierholzer."
    },
    {
      "title": "Minimum Cost to Make at Least One Valid Path",
      "slug": "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
      "difficulty": "hard",
      "note": "0-1 BFS."
    },
    {
      "title": "Number of Ways to Arrive at Destination",
      "slug": "number-of-ways-to-arrive-at-destination",
      "difficulty": "medium",
      "note": "Dijkstra + count ways."
    }
  ],
  pitfalls: "Using Dijkstra with negative edges. Not handling disconnected nodes (INF). Forgetting stale heap check causing TLE.",
  interviewTips: "Say non-negative weights assumption aloud. Compare BFS for unweighted vs Dijkstra.",
  complexity: [
    {
      "operation": "Dijkstra binary heap",
      "time": "O((V+E) log V)",
      "space": "O(V)"
    },
    {
      "operation": "Bellman-Ford",
      "time": "O(VE)",
      "space": "O(V)"
    },
    {
      "operation": "BFS unweighted",
      "time": "O(V+E)",
      "space": "O(V)"
    }
  ],
});
