import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("trie")!;

export const article = buildPatternArticle({
  meta,
  summary: "Prefix tree for fast string prefix/suffix queries, autocomplete, and word search on boards.",
  intuition: "Use a **trie** when multiple strings share prefixes and you need insert/search/startsWith in O(L) time per operation, or DFS with trie pruning on grids.\n\nEach node stores children map/array and end-of-word flag. Walk characters from root; missing child means no match. Compress memory with array[26] for lowercase English.",
  deepDive: "Standard trie, prefix search, word search II with trie + board DFS, XOR trie for max XOR pair, replace words with roots.\n\nTrie appears in word search II and implement trie - less frequent but distinguishes strong candidates.",
  signals: [
    "Dictionary of many words queried repeatedly",
    "Prefix existence / autocomplete",
    "Find all words from grid letters",
    "Replace words by shortest root prefix",
    "Bit trie for maximum XOR",
    "Streaming character adds and searches",
    "Need better than hash of full string",
    "Shared prefix structure obvious"
  ],
  subpatterns: [
    {
      "name": "Array children trie",
      "description": "26-length array per node for lowercase letters."
    },
    {
      "name": "Hash map children",
      "description": "Flexible alphabet or sparse nodes."
    },
    {
      "name": "Board DFS + trie",
      "description": "Prune paths when trie has no child for next char."
    },
    {
      "name": "Prefix aggregation",
      "description": "Store count or top suggestions at nodes."
    },
    {
      "name": "Bitwise trie",
      "description": "Binary children for max XOR queries."
    },
    {
      "name": "Deletion / compaction",
      "description": "Rare; mark wordEnd false and optionally prune."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <string>
using namespace std;

struct TrieNode {
    TrieNode* children[26]{};
    bool word = false;
};

class Trie {
public:
    TrieNode* root;
    Trie() { root = new TrieNode(); }
    void insert(const string& word) {
        TrieNode* node = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (!node->children[i]) node->children[i] = new TrieNode();
            node = node->children[i];
        }
        node->word = true;
    }
    bool search(const string& word) {
        TrieNode* node = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (!node->children[i]) return false;
            node = node->children[i];
        }
        return node->word;
    }
    bool startsWith(const string& prefix) {
        TrieNode* node = root;
        for (char ch : prefix) {
            int i = ch - 'a';
            if (!node->children[i]) return false;
            node = node->children[i];
        }
        return true;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Word search helper (find in trie)",
    language: "cpp",
    code: `#include <string>
using namespace std;

class Solution {
public:
    bool dfsWord(TrieNode* node, const string& word, int idx) {
        if (!node) return false;
        if (idx == (int)word.size()) return node->word;
        int i = word[idx] - 'a';
        return dfsWord(node->children[i], word, idx + 1);
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "trie-prefix",
  walkthrough: "For Word Search II, insert all words, DFS board while walking trie; on `word` flag collect and optionally remove to avoid duplicates.",
  steps: [
    "Define node structure (children + terminal flag).",
    "Implement insert/search/prefix walk.",
    "For grid problems, pair trie with visited board marks.",
    "Prune DFS when trie child missing.",
    "Collect results; handle duplicate words carefully.",
    "Discuss memory vs hash set of strings.",
    "Complexity O(total chars) build, O(L) per query."
  ],
  problems: [
    {
      "title": "Implement Trie",
      "slug": "implement-trie-prefix-tree",
      "difficulty": "medium",
      "note": "Insert/search/prefix."
    },
    {
      "title": "Design Add and Search Words",
      "slug": "design-add-and-search-word-data-structure",
      "difficulty": "medium",
      "note": "Wildcard DFS."
    },
    {
      "title": "Word Search II",
      "slug": "word-search-ii",
      "difficulty": "hard",
      "note": "Trie + board DFS."
    },
    {
      "title": "Replace Words",
      "slug": "replace-words",
      "difficulty": "medium",
      "note": "Shortest root prefix."
    },
    {
      "title": "Longest Word in Dictionary",
      "slug": "longest-word-in-dictionary",
      "difficulty": "medium",
      "note": "Trie BFS/DFS."
    },
    {
      "title": "Maximum XOR of Two Numbers",
      "slug": "maximum-xor-of-two-numbers-in-an-array",
      "difficulty": "medium",
      "note": "Bit trie."
    },
    {
      "title": "Search Suggestions System",
      "slug": "search-suggestions-system",
      "difficulty": "medium",
      "note": "Trie collect prefixes."
    },
    {
      "title": "Map Sum Pairs",
      "slug": "map-sum-pairs",
      "difficulty": "medium",
      "note": "Trie with value sum."
    }
  ],
  pitfalls: "Not freeing nodes in interview (acceptable). Using vector of children without initializing. Wildcard search needs branching DFS.",
  interviewTips: "Compare trie vs sorting + binary search for static dictionary.",
  complexity: [
    {
      "operation": "Insert/search len L",
      "time": "O(L)",
      "space": "O(chars) total"
    },
    {
      "operation": "Word search II",
      "time": "O(mn * 4^L)",
      "space": "O(words)"
    }
  ],
});
