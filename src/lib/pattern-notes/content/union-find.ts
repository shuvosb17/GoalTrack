import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("union-find")!;

export const article = buildPatternArticle({
  meta,
  summary: "Disjoint Set Union (DSU) tracks connected components with near-constant unite/find using path compression and union by rank.",
  intuition: "Use **union-find** for dynamic connectivity, counting components, or detecting cycle in undirected graphs when edges arrive online.\n\nParent array with find(x) walking to root; union attaches roots by rank/size. Path compression flattens trees during find.",
  deepDive: "Number of provinces, redundant connection, accounts merge, Kruskal MST, percolation grid DSU.\n\nConnected components and detect cycle in undirected graph are common DSU questions.",
  signals: [
    "Undirected connectivity queries",
    "Count connected components after unions",
    "Detect if adding edge creates cycle",
    "Group items by transitive equivalence",
    "Offline Kruskal minimum spanning tree",
    "Grid cells connect to neighbors",
    "Need near O(1) amortized merge",
    "Accounts merge / synonym groups"
  ],
  subpatterns: [
    {
      "name": "Path compression",
      "description": "Point nodes directly to root during find."
    },
    {
      "name": "Union by rank/size",
      "description": "Attach smaller tree under larger."
    },
    {
      "name": "Grid DSU",
      "description": "Map cell id to index for union of adjacent open cells."
    },
    {
      "name": "Component size tracking",
      "description": "Maintain size array at roots for largest component."
    },
    {
      "name": "Kruskal MST",
      "description": "Sort edges; union if different sets."
    },
    {
      "name": "Rollback DSU",
      "description": "Rare interview variant with stack of changes."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
using namespace std;

struct DSU {
    vector<int> parent, rank_;
    DSU(int n) : parent(n), rank_(n, 0) { for (int i = 0; i < n; ++i) parent[i] = i; }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (rank_[a] < rank_[b]) swap(a, b);
        parent[b] = a;
        if (rank_[a] == rank_[b]) ++rank_[a];
        return true;
    }
};

class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        DSU dsu(n);
        for (auto& e : edges) dsu.unite(e[0], e[1]);
        int roots = 0;
        for (int i = 0; i < n; ++i) if (dsu.find(i) == i) ++roots;
        return roots;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Detect redundant edge (cycle)",
    language: "cpp",
    code: `#include <vector>
using namespace std;

struct DSU {
    vector<int> p;
    DSU(int n): p(n) { for (int i=0;i<n;++i) p[i]=i; }
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
    bool unite(int a,int b){ a=find(a); b=find(b); if(a==b) return false; p[b]=a; return true; }
};

class Solution {
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        DSU dsu((int)edges.size()+1);
        for (auto& e : edges) if (!dsu.unite(e[0], e[1])) return e;
        return {};
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "union-find",
  walkthrough: "For redundant connection, first edge connecting already-connected nodes is the answer. Component count equals number of distinct roots after all unions.",
  steps: [
    "Size DSU to nodes (0..n-1 or 1..n).",
    "Implement find with path compression.",
    "Implement union returning whether merged.",
    "Process edges or grid neighbors.",
    "Count roots or answer connectivity query.",
    "Mention amortized inverse Ackermann complexity.",
    "Contrast with BFS for single static graph."
  ],
  problems: [
    {
      "title": "Number of Connected Components",
      "slug": "number-of-connected-components-in-an-undirected-graph",
      "difficulty": "medium",
      "note": "Count roots."
    },
    {
      "title": "Graph Valid Tree",
      "slug": "graph-valid-tree",
      "difficulty": "medium",
      "note": "n-1 edges + no cycle."
    },
    {
      "title": "Redundant Connection",
      "slug": "redundant-connection",
      "difficulty": "medium",
      "note": "First cycle edge."
    },
    {
      "title": "Accounts Merge",
      "slug": "accounts-merge",
      "difficulty": "medium",
      "note": "Union emails/names."
    },
    {
      "title": "Surrounded Regions",
      "slug": "surrounded-regions",
      "difficulty": "medium",
      "note": "Union border vs interior."
    },
    {
      "title": "Number of Provinces",
      "slug": "number-of-provinces",
      "difficulty": "medium",
      "note": "Matrix connectivity."
    },
    {
      "title": "Minimize Malware Spread",
      "slug": "minimize-malware-spread",
      "difficulty": "hard",
      "note": "Component sizes."
    },
    {
      "title": "Satisfiability of Equality Equations",
      "slug": "satisfiability-of-equality-equations",
      "difficulty": "medium",
      "note": "Union chars."
    }
  ],
  pitfalls: "1-indexed vs 0-indexed nodes. Forgetting to count roots after unions. Using DSU on directed edges without adaptation.",
  interviewTips: "Spell out path compression and union by rank. Say amortized nearly O(1).",
  complexity: [
    {
      "operation": "Find/union amortized",
      "time": "O(alpha(n))",
      "space": "O(n)"
    },
    {
      "operation": "Kruskal MST",
      "time": "O(E log E)",
      "space": "O(V)"
    }
  ],
});
