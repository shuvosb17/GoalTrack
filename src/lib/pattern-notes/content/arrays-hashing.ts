import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("arrays-hashing")!;

export const article = buildPatternArticle({
  meta,
  summary: "Use arrays for sequential access and hash structures for O(1) lookup, counting, and deduplication.",
  intuition: "Arrays give ordered data; hashing turns search into constant time. Most array interview problems reduce to **tracking something** — counts, indices, complements, or seen values — in a hash map or set.",
  signals: ["Need O(1) lookup or duplicate detection","Count frequencies or group by key","Subarray sum / complement problems","Anagram or multiset equality"],
  subpatterns: [{"name":"Frequency count","description":"HashMap element → count for anagrams, top-K, majority."},{"name":"HashMap lookup","description":"Store value → index for Two Sum style complements."},{"name":"HashSet lookup","description":"O(1) membership for duplicates and cycle detection in arrays."},{"name":"Prefix sum","description":"Running sums in a map for subarray sum equals K."}],
  templateCode: {
    language: "typescript",
    code: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    caption: "Core template — adapt to the problem.",
  },
    viz: "frequency-count",
  walkthrough: "For **Two Sum**, store each number's index. For current `x`, check if `target - x` was seen. One pass, O(n) time. For **Group Anagrams**, map sorted string → list of words.",
  problems: [{"title":"Two Sum","slug":"two-sum","difficulty":"easy","note":"Canonical hash complement pattern."},{"title":"Contains Duplicate","slug":"contains-duplicate","difficulty":"easy","note":"HashSet membership."},{"title":"Valid Anagram","slug":"valid-anagram","difficulty":"easy","note":"Frequency count."},{"title":"Top K Frequent Elements","slug":"top-k-frequent-elements","difficulty":"medium","note":"Count then bucket/heap."},{"title":"Subarray Sum Equals K","slug":"subarray-sum-equals-k","difficulty":"medium","note":"Prefix sum + hash map."}],
  pitfalls: "Watch empty array and negative numbers. For prefix-sum problems, initialize map with `{0:1}` to count subarrays starting at index 0.",
  complexity: [{"operation":"Hash lookup/insert","time":"O(1) avg","space":"O(n)"},{"operation":"Full array scan","time":"O(n)","space":"O(1)"}],
});
