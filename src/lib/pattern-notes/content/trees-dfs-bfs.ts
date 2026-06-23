import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("trees-dfs-bfs")!;

export const article = buildPatternArticle({
  meta,
  summary: "Tree traversal with recursion/stack (DFS) or queue (BFS) — the backbone of tree interviews.",
  intuition: "Trees are recursive structures. **DFS** goes deep first (pre/in/postorder); **BFS** levels use a queue. Most tree problems = base case on null + combine results from subtrees.",
  signals: ["Path sum / diameter / depth", "Level-order output", "Subtree validation", "Construct from traversals"],
  subpatterns: [
    { name: "Preorder DFS", description: "Root → left → right. Copy/serialize trees." },
    { name: "Inorder DFS", description: "Left → root → right. BST sorted order." },
    { name: "Postorder DFS", description: "Left → right → root. Delete/bottom-up DP." },
    { name: "Level-order BFS", description: "Queue processes level by level." },
  ],
  templateCode: {
    language: "typescript",
    code: `function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const res: number[][] = [], q = [root];
  while (q.length) {
    const level: number[] = [], size = q.length;
    for (let i = 0; i < size; i++) {
      const node = q.shift()!;
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
}`,
  },
  viz: "tree-traversals",
  walkthrough: "**Diameter**: postorder returns height; at each node update `best = leftHeight + rightHeight`. Global max is diameter in edges.",
  problems: [
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "easy", note: "DFS depth." },
    { title: "Same Tree", slug: "same-tree", difficulty: "easy", note: "Parallel DFS." },
    { title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "easy", note: "Swap children." },
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "medium", note: "BFS." },
    { title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", difficulty: "easy", note: "Postorder height." },
  ],
  pitfalls: "Null base case. For BFS, snapshot queue size per level. Pass parent pointer when needed for LCA.",
  complexity: [
    { operation: "DFS/BFS visit all nodes", time: "O(n)", space: "O(h) DFS / O(w) BFS" },
  ],
});
