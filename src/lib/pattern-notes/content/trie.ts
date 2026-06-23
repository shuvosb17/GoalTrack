import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("trie")!;

export const article = buildPatternArticle({
  meta,
  summary: "Prefix tree for fast string prefix lookup and dictionary queries.",
  intuition: "Each node represents a character path from root. `isEnd` marks complete words. Tries excel at **prefix search**, autocomplete, and word grid problems.",
  signals: ["Prefix matching", "Dictionary of words", "Word search on board", "Count words with prefix"],
  subpatterns: [
    { name: "Prefix search", description: "Walk characters; fail if child missing." },
    { name: "Dictionary insert/search", description: "Insert marks end node." },
    { name: "DFS on trie", description: "Word Search II — prune when prefix absent." },
  ],
  templateCode: {
    language: "typescript",
    code: `class TrieNode { children = new Map<string, TrieNode>(); isEnd = false; }

class Trie {
  root = new TrieNode();
  insert(word: string) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }
  search(word: string): boolean {
    const node = this.walk(word);
    return !!node?.isEnd;
  }
  walk(word: string): TrieNode | null {
    let node: TrieNode | null = this.root;
    for (const ch of word) {
      if (!node?.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}`,
  },
  viz: "trie-prefix",
  walkthrough: "**Word Search II**: build trie from words; DFS board, pass trie node; on `isEnd` add word and optionally dedupe.",
  problems: [
    { title: "Implement Trie", slug: "implement-trie-prefix-tree", difficulty: "medium", note: "Insert/search/startsWith." },
    { title: "Word Search II", slug: "word-search-ii", difficulty: "hard", note: "Trie + board DFS." },
  ],
  pitfalls: "Don't forget `isEnd` on insert. Prune trie branches after finding words to avoid duplicates.",
  complexity: [{ operation: "Insert/search length L", time: "O(L)", space: "O(total chars)" }],
});
