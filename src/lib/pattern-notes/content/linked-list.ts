import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("linked-list")!;

export const article = buildPatternArticle({
  meta,
  summary: "Pointer rewriting for in-place reversal, cycle detection, merging, and k-group manipulation with O(1) extra space.",
  intuition: "Use **linked list** patterns when the structure is nodes with `next` (and maybe `random`) pointers and array indexing is unavailable. Fast/slow pointers detect cycles and find midpoints; dummy head simplifies head inserts.\n\nDraw pointers before coding. Invariants: which segment is reversed, where tail connects, whether you need previous pointer. Dummy node avoids special-casing head deletions.",
  deepDive: "Reverse entire/partial list, merge two sorted lists, cycle detection (Floyd), reorder list, k-group reverse, copy list with random pointer using hash map.\n\nLess frequent than arrays but classic for cycle detection and reverse in k-group - pointer clarity matters more than language syntax.",
  signals: [
    "Explicit ListNode input",
    "In-place reversal or reorder",
    "Cycle or intersection detection",
    "Merge sorted linked sequences",
    "Find middle or kth from end",
    "Random pointer duplication",
    "Palindrome linked list",
    "O(1) memory required"
  ],
  subpatterns: [
    {
      "name": "Dummy head",
      "description": "Start with sentinel node to unify insert/delete at head."
    },
    {
      "name": "Iterative reverse",
      "description": "prev/curr/next walk reversing links."
    },
    {
      "name": "Fast & slow",
      "description": "Detect cycle, find middle, split halves."
    },
    {
      "name": "Merge lists",
      "description": "Two-pointer merge like merge sort merge step."
    },
    {
      "name": "K-group reverse",
      "description": "Count k nodes, reverse segment, connect tails."
    },
    {
      "name": "Hash clone",
      "description": "Map old node to new for random pointers."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <utility>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Iterative reverse linked list",
    language: "cpp",
    code: `using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* nxt = head->next;
            head->next = prev;
            prev = head;
            head = nxt;
        }
        return prev;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "linked-list-fast-slow",
  walkthrough: "For cycle detection, when slow meets fast, reset one pointer to head and advance both one step to find entry (optional proof). For reverse, maintain `prev` as reversed prefix tail.",
  steps: [
    "Clarify singly vs doubly and memory limit.",
    "Sketch node pointers for 3-4 nodes.",
    "Use dummy if head may change.",
    "Implement pointer moves in correct order to avoid losing rest.",
    "Restore tail connections after partial reverse.",
    "Test empty, single node, two nodes.",
    "State O(n) time O(1) space."
  ],
  problems: [
    {
      "title": "Reverse Linked List",
      "slug": "reverse-linked-list",
      "difficulty": "easy",
      "note": "Iterative reverse."
    },
    {
      "title": "Merge Two Sorted Lists",
      "slug": "merge-two-sorted-lists",
      "difficulty": "easy",
      "note": "Dummy merge."
    },
    {
      "title": "Linked List Cycle",
      "slug": "linked-list-cycle",
      "difficulty": "easy",
      "note": "Floyd detection."
    },
    {
      "title": "Reorder List",
      "slug": "reorder-list",
      "difficulty": "medium",
      "note": "Find mid, reverse, weave."
    },
    {
      "title": "Remove Nth Node From End",
      "slug": "remove-nth-node-from-end-of-list",
      "difficulty": "medium",
      "note": "Fast ahead n steps."
    },
    {
      "title": "Copy List with Random Pointer",
      "slug": "copy-list-with-random-pointer",
      "difficulty": "medium",
      "note": "Hash map clone."
    },
    {
      "title": "Reverse Nodes in k-Group",
      "slug": "reverse-nodes-in-k-group",
      "difficulty": "hard",
      "note": "Segment reverse."
    },
    {
      "title": "Palindrome Linked List",
      "slug": "palindrome-linked-list",
      "difficulty": "easy",
      "note": "Half reverse compare."
    }
  ],
  pitfalls: "Losing `next` when reversing. Not handling head deletion. Off-by-one on nth from end without dummy.",
  interviewTips: "Verbally name prev/curr/next each line. Offer iterative before recursive for O(1) space.",
  complexity: [
    {
      "operation": "Single pass list",
      "time": "O(n)",
      "space": "O(1)"
    },
    {
      "operation": "Merge two lists",
      "time": "O(n+m)",
      "space": "O(1)"
    },
    {
      "operation": "Clone with map",
      "time": "O(n)",
      "space": "O(n)"
    }
  ],
});
