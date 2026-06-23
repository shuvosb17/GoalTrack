import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("linked-list")!;

export const article = buildPatternArticle({
  meta,
  summary: "Pointer manipulation on nodes — reverse, merge, detect cycles, and use dummy heads.",
  intuition: "Linked lists test **pointer discipline**. Use a **dummy node** before the head to simplify edge cases. Fast/slow pointers find middle and cycles; reversal rebuilds links in-place.",
  signals: ["Reverse or reorder list", "Merge sorted lists", "Cycle detection", "Nth from end"],
  subpatterns: [
    { name: "Fast & slow pointer", description: "Floyd's cycle detection; find middle." },
    { name: "Reverse list", description: "Iterative three-pointer reversal." },
    { name: "Dummy node", description: "Sentinel before head for insert/delete." },
    { name: "Merge lists", description: "Compare heads, attach smaller." },
  ],
  templateCode: {
    language: "typescript",
    code: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
  },
  viz: "linked-list-fast-slow",
  walkthrough: "**Reorder List**: find middle with slow/fast, reverse second half, merge alternating. Draw pointers before coding.",
  problems: [
    { title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "easy", note: "Iterative reversal." },
    { title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "easy", note: "Dummy head merge." },
    { title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "easy", note: "Floyd algorithm." },
    { title: "Reorder List", slug: "reorder-list", difficulty: "medium", note: "Middle + reverse + merge." },
    { title: "LRU Cache", slug: "lru-cache", difficulty: "medium", note: "HashMap + doubly linked list." },
  ],
  pitfalls: "Save `next` before rewiring. Check empty list and single node. For cycle, return node where slow meets fast after reset.",
  complexity: [{ operation: "List traversal", time: "O(n)", space: "O(1)" }],
});
