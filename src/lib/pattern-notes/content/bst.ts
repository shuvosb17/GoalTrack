import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("bst")!;

export const article = buildPatternArticle({
  meta,
  summary: "BST invariant: left < root < right. Inorder traversal yields sorted order.",
  intuition: "Every BST problem exploits **ordering**. Search is O(h). Inorder gives sorted sequence. Validate by passing min/max bounds down the tree.",
  signals: ["Validate BST property", "Kth smallest in BST", "LCA in BST (compare with root)", "Insert/delete/search"],
  subpatterns: [
    { name: "Inorder sorted property", description: "Iterative inorder for kth smallest." },
    { name: "Lower/upper bound", description: "Walk left/right like binary search on tree." },
    { name: "Range validation", description: "Pass (min, max) allowed for each node." },
  ],
  templateCode: {
    language: "typescript",
    code: `function isValidBST(root: TreeNode | null, lo = -Infinity, hi = Infinity): boolean {
  if (!root) return true;
  if (root.val <= lo || root.val >= hi) return false;
  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);
}`,
  },
  viz: "tree-traversals",
  walkthrough: "**Kth Smallest**: iterative inorder — go left, process, go right; decrement k at each visit until k=0.",
  problems: [
    { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "medium", note: "Bounds propagation." },
    { title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "medium", note: "Inorder." },
    { title: "Lowest Common Ancestor of a BST", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "medium", note: "Compare values with root." },
  ],
  pitfalls: "Duplicates: clarify if equal goes left or right. Use long/infinity bounds for INT_MIN/MAX edge cases.",
  complexity: [{ operation: "BST operations", time: "O(h)", space: "O(h)" }],
});
