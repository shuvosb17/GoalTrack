import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("two-pointers")!;

export const article = buildPatternArticle({
  meta,
  summary: "Scan from two indices to reduce O(n²) brute force to O(n) on sorted or paired structures.",
  intuition: "When data is **sorted** or you need **pairwise** comparisons from both ends, two pointers eliminate nested loops. Move pointers based on a comparison rule until they meet or cross.",
  signals: ["Sorted array pair/triplet sum","Palindrome check","Remove duplicates in-place","Container/water trapping style maximize area"],
  subpatterns: [{"name":"Opposite ends","description":"left=0, right=n-1; move based on sum vs target."},{"name":"Same direction","description":"Both advance; fast/slow or writer/reader for in-place."},{"name":"Fast & slow","description":"Cycle detection, middle of list (see Linked List)."},{"name":"Partitioning","description":"Dutch flag, quickselect pivot placement."}],
  templateCode: {
    language: "typescript",
    code: `function isPalindrome(s: string): boolean {
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}`,
    caption: "Core template — adapt to the problem.",
  },
    viz: "two-pointer-opposite",
  walkthrough: "**3Sum**: sort, fix index `i`, run opposite-end two-pointer on `i+1..n-1` for sum zero. Skip duplicate `i` values.",
  problems: [{"title":"Valid Palindrome","slug":"valid-palindrome","difficulty":"easy","note":"Opposite ends with skip."},{"title":"Two Sum II","slug":"two-sum-ii-input-array-is-sorted","difficulty":"medium","note":"Sorted opposite ends."},{"title":"3Sum","slug":"3sum","difficulty":"medium","note":"Sort + fix one + two pointers."},{"title":"Container With Most Water","slug":"container-with-most-water","difficulty":"medium","note":"Move shorter side."},{"title":"Trapping Rain Water","slug":"trapping-rain-water","difficulty":"hard","note":"Two pointers or monotonic stack."}],
  pitfalls: "Sort first when needed. For 3Sum/4Sum always dedupe after finding a valid tuple.",
  complexity: [{"operation":"Two-pointer scan","time":"O(n)","space":"O(1)"}],
});
