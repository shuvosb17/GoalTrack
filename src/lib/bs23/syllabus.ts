import type { Bs23StageId } from "../types";

export type Bs23TopicTier = "core" | "stretch";

export interface Bs23TopicDef {
  id: string;
  stageId: Bs23StageId;
  competencyId: string;
  order: number;
  title: string;
  detail: string;
  tier: Bs23TopicTier;
}

export const TIER_WEIGHT: Record<Bs23TopicTier, number> = {
  core: 1.0,
  stretch: 0.5,
};

export type Bs23TopicProgressMap = Record<string, "not_started" | "in_progress" | "done">;

export interface Bs23CompetencyCoverage {
  competencyId: string;
  stageId: Bs23StageId;
  totalWeight: number;
  completedWeight: number;
  coverage: number;
  totalTopics: number;
  completedTopics: number;
  coreTopics: number;
  coreCompleted: number;
}

export interface Bs23StageCoverageSummary {
  stageId: Bs23StageId;
  totalWeight: number;
  completedWeight: number;
  coverage: number;
  competencies: Bs23CompetencyCoverage[];
}

function t(
  id: string,
  stageId: Bs23StageId,
  competencyId: string,
  order: number,
  title: string,
  detail: string,
  tier: Bs23TopicTier = "core"
): Bs23TopicDef {
  return { id, stageId, competencyId, order, title, detail, tier };
}

/** 309 ordered topics across BS23 Star Coder prep stages S1–S5. */
export const BS23_SYLLABUS: Bs23TopicDef[] = [
  t("s1_resume_one_page", "S1", "resume_ats", 1, "One-page resume layout", "Single page, 10-12pt font, clear sections: contact, education, skills, projects, experience."),
  t("s1_resume_action_verbs", "S1", "resume_ats", 2, "Action verb bullets", "Start each bullet with strong verbs: Built, Designed, Optimized — never Responsible for."),
  t("s1_resume_quantify", "S1", "resume_ats", 3, "Quantified impact bullets", "Add numbers: users, latency %, test coverage, team size, deadlines met."),
  t("s1_resume_ats_keywords", "S1", "resume_ats", 4, "ATS keyword alignment", "Mirror BS23 JD keywords: OOP, SQL, REST, Agile, fintech without keyword stuffing."),
  t("s1_resume_pdf_format", "S1", "resume_ats", 5, "ATS-safe PDF export", "Export text-selectable PDF; no tables/columns/icons that break parsers.", "stretch"),
  t("s1_gh_profile_readme", "S1", "github_portfolio", 6, "Profile README", "Short bio, stack, contact, link to best project."),
  t("s1_gh_pin_repos", "S1", "github_portfolio", 7, "Pin 4-6 repos", "Pinned repos show breadth: backend, DB, one full-stack deploy."),
  t("s1_gh_readme_architecture", "S1", "github_portfolio", 8, "README architecture section", "Each pinned repo: problem, stack, architecture diagram or flow, how to run."),
  t("s1_gh_commit_hygiene", "S1", "github_portfolio", 9, "Consistent commit history", "Meaningful messages; green graph from steady commits, not one bulk push."),
  t("s1_gh_contribution_activity", "S1", "github_portfolio", 10, "Contribution graph", "Regular commits over 3+ months; avoid empty weeks before application.", "stretch"),
  t("s1_proj1_live_url", "S1", "deployed_projects", 11, "Project #1 live deployment", "Public URL with uptime; not localhost-only demo."),
  t("s1_proj1_readme", "S1", "deployed_projects", 12, "Project #1 README depth", "Setup, env vars, API docs, trade-offs, future work."),
  t("s1_proj1_stack_justify", "S1", "deployed_projects", 13, "Project #1 stack justification", "Explain why Spring/Express/PostgreSQL — aligns with BS23 stack test choice."),
  t("s1_proj2_different_domain", "S1", "deployed_projects", 14, "Project #2 different domain", "Second project in different domain from #1 (e.g., ticketing vs inventory)."),
  t("s1_proj2_auth_or_payments", "S1", "deployed_projects", 15, "Project #2 auth or payment flow", "Show login/JWT or mock payment — fintech-adjacent proof."),
  t("s1_proj_demo_video", "S1", "deployed_projects", 16, "30-sec demo GIF or video", "Quick walkthrough linked in README for reviewers.", "stretch"),
  t("s1_li_headline", "S1", "linkedin", 17, "LinkedIn headline", "Role-targeted headline: Software Engineer | Java/SQL | FinTech-ready."),
  t("s1_li_about", "S1", "linkedin", 18, "About section", "3 short paragraphs: stack, projects with links, what you want at BS23."),
  t("s1_li_projects_featured", "S1", "linkedin", 19, "Featured projects section", "Add deployed URLs and GitHub links as featured items."),
  t("s1_li_open_to_work", "S1", "linkedin", 20, "Open to work settings", "Enable recruiters-only if comfortable; location Dhaka.", "stretch"),
  t("s1_cgpa_requirement_check", "S1", "cgpa_eligibility", 21, "Verify CGPA requirement", "Confirm latest BS23 fresher CGPA cutoff from official posting."),
  t("s1_cgpa_transcript", "S1", "cgpa_eligibility", 22, "Transcript ready", "Soft copy transcript or provisional certificate available if asked."),
  t("s1_cgpa_no_backlog", "S1", "cgpa_eligibility", 23, "No outstanding backlogs", "All courses cleared before assessment dates."),
  t("s1_cgpa_honors_courses", "S1", "cgpa_eligibility", 24, "Highlight relevant coursework", "List DS, OOP, DBMS, Software Engineering on resume if strong grades."),
  t("s1_cgpa_explanation_plan", "S1", "cgpa_eligibility", 25, "Low-grade explanation prep", "If any weak semester, prepare honest 20-sec explanation.", "stretch"),
  t("s2_oop_encapsulation_def", "S2", "oop_pillars", 26, "Encapsulation definition", "Bundle data + methods; hide fields with private/protected access."),
  t("s2_oop_encapsulation_getter_setter", "S2", "oop_pillars", 27, "Getters and setters", "When to expose via accessors vs immutable objects."),
  t("s2_oop_encapsulation_java_access", "S2", "oop_pillars", 28, "Java access modifiers", "public, private, protected, package-private — MCQ favorites."),
  t("s2_oop_inheritance_is_a", "S2", "oop_pillars", 29, "Inheritance IS-A relationship", "Subclass extends superclass; code reuse vs composition debate."),
  t("s2_oop_inheritance_override", "S2", "oop_pillars", 30, "Method overriding rules", "@Override, same signature, runtime polymorphism."),
  t("s2_oop_inheritance_constructor_chain", "S2", "oop_pillars", 31, "Constructor chaining", "super() call order in inheritance hierarchies."),
  t("s2_oop_polymorphism_runtime", "S2", "oop_pillars", 32, "Runtime polymorphism", "Parent reference, child object — which method runs."),
  t("s2_oop_polymorphism_overload_vs_override", "S2", "oop_pillars", 33, "Overload vs override", "Compile-time vs runtime binding — classic MCQ."),
  t("s2_oop_polymorphism_interface_impl", "S2", "oop_pillars", 34, "Interface implementation", "Class implements interface; default methods in Java 8+."),
  t("s2_oop_abstraction_abstract_class", "S2", "oop_pillars", 35, "Abstract classes", "Partial implementation; cannot instantiate; when to use."),
  t("s2_oop_abstraction_interface", "S2", "oop_pillars", 36, "Interfaces vs abstract classes", "Multiple inheritance via interfaces; MCQ comparison table."),
  t("s2_oop_abstraction_real_world", "S2", "oop_pillars", 37, "Abstraction examples", "PaymentProcessor interface hiding Stripe/bKash implementations."),
  t("s2_oop_adv_solid_s", "S2", "oop_advanced", 38, "SOLID — Single Responsibility", "One class, one reason to change; identify violations in snippets."),
  t("s2_oop_adv_solid_o", "S2", "oop_advanced", 39, "SOLID — Open/Closed", "Open for extension, closed for modification; strategy pattern link."),
  t("s2_oop_adv_solid_l", "S2", "oop_advanced", 40, "SOLID — Liskov Substitution", "Subtypes must be substitutable; square-rectangle trap."),
  t("s2_oop_adv_solid_i", "S2", "oop_advanced", 41, "SOLID — Interface Segregation", "Small focused interfaces vs fat interfaces."),
  t("s2_oop_adv_solid_d", "S2", "oop_advanced", 42, "SOLID — Dependency Inversion", "Depend on abstractions; DI containers intro."),
  t("s2_oop_adv_equals_vs_hashcode", "S2", "oop_advanced", 43, "equals() vs ==", "Reference equality vs value equality; hashCode contract."),
  t("s2_oop_adv_immutable_objects", "S2", "oop_advanced", 44, "Immutable objects", "String immutability; benefits for threading and hashing."),
  t("s2_oop_adv_composition_over_inheritance", "S2", "oop_advanced", 45, "Composition over inheritance", "Has-A vs Is-A; favor delegation."),
  t("s2_oop_adv_static_vs_instance", "S2", "oop_advanced", 46, "Static vs instance members", "Static methods cannot override; hidden methods."),
  t("s2_oop_adv_final_keyword", "S2", "oop_advanced", 47, "final keyword usages", "final class, method, variable — MCQ scenarios."),
  t("s2_dbms_norm_1nf", "S2", "dbms_normalization", 48, "First normal form (1NF)", "Atomic values; no repeating groups."),
  t("s2_dbms_norm_2nf", "S2", "dbms_normalization", 49, "Second normal form (2NF)", "1NF + no partial dependency on composite key."),
  t("s2_dbms_norm_3nf", "S2", "dbms_normalization", 50, "Third normal form (3NF)", "2NF + no transitive dependency."),
  t("s2_dbms_norm_bcnf", "S2", "dbms_normalization", 51, "BCNF", "Every determinant is a candidate key; difference from 3NF."),
  t("s2_dbms_norm_denormalize_when", "S2", "dbms_normalization", 52, "When to denormalize", "Read-heavy analytics; accept redundancy trade-offs."),
  t("s2_dbms_norm_functional_dependency", "S2", "dbms_normalization", 53, "Functional dependencies", "Identify FDs from table data — exam style."),
  t("s2_dbms_norm_anomalies", "S2", "dbms_normalization", 54, "Insertion/update/deletion anomalies", "How normalization fixes each anomaly type."),
  t("s2_dbms_norm_normalization_example", "S2", "dbms_normalization", 55, "Normalize a sample table", "Take unnormalized Order table to 3NF on paper."),
  t("s2_dbms_join_inner_join", "S2", "dbms_sql_joins", 56, "INNER JOIN", "Return matching rows only; Venn diagram intuition."),
  t("s2_dbms_join_left_join", "S2", "dbms_sql_joins", 57, "LEFT JOIN", "All left rows + matches; NULLs for non-matches."),
  t("s2_dbms_join_right_join", "S2", "dbms_sql_joins", 58, "RIGHT JOIN", "Mirror of LEFT JOIN; less common in exams."),
  t("s2_dbms_join_full_outer", "S2", "dbms_sql_joins", 59, "FULL OUTER JOIN", "All rows from both; NULL padding."),
  t("s2_dbms_join_cross_join", "S2", "dbms_sql_joins", 60, "CROSS JOIN", "Cartesian product; when accidental vs intentional."),
  t("s2_dbms_join_self_join", "S2", "dbms_sql_joins", 61, "SELF JOIN", "Join table to itself — employee/manager hierarchy."),
  t("s2_dbms_join_group_by_having", "S2", "dbms_sql_joins", 62, "GROUP BY + HAVING", "Filter aggregates; WHERE vs HAVING."),
  t("s2_dbms_join_second_highest_salary", "S2", "dbms_sql_joins", 63, "Second highest salary", "Subquery vs DENSE_RANK — BS23 favorite."),
  t("s2_dbms_join_nth_highest_salary", "S2", "dbms_sql_joins", 64, "Nth highest salary", "Generalize with LIMIT/OFFSET or window functions."),
  t("s2_dbms_join_join_three_tables", "S2", "dbms_sql_joins", 65, "Three-table JOIN", "Orders-Customers-Products style query."),
  t("s2_dbms_join_subquery_vs_join", "S2", "dbms_sql_joins", 66, "Subquery vs JOIN", "When correlated subquery beats JOIN."),
  t("s2_dbms_join_union_intersect", "S2", "dbms_sql_joins", 67, "UNION / INTERSECT / EXCEPT", "Set operations on result sets."),
  t("s2_dbms_join_aggregate_functions", "S2", "dbms_sql_joins", 68, "COUNT/SUM/AVG/MIN/MAX", "NULL handling in aggregates."),
  t("s2_dbms_join_case_when", "S2", "dbms_sql_joins", 69, "CASE expressions", "Conditional columns in SELECT."),
  t("s2_dbms_join_date_functions", "S2", "dbms_sql_joins", 70, "Date functions", "EXTRACT, DATEADD — filter by month/year."),
  t("s2_dbms_acid_acid_atomicity", "S2", "dbms_indexing_acid", 71, "ACID — Atomicity", "All or nothing transactions."),
  t("s2_dbms_acid_acid_consistency", "S2", "dbms_indexing_acid", 72, "ACID — Consistency", "Valid state before and after transaction."),
  t("s2_dbms_acid_acid_isolation", "S2", "dbms_indexing_acid", 73, "ACID — Isolation", "Concurrent transactions; isolation levels."),
  t("s2_dbms_acid_acid_durability", "S2", "dbms_indexing_acid", 74, "ACID — Durability", "Committed data survives crash."),
  t("s2_dbms_acid_isolation_levels", "S2", "dbms_indexing_acid", 75, "Isolation levels", "Read uncommitted → serializable; dirty read example."),
  t("s2_dbms_acid_clustered_index", "S2", "dbms_indexing_acid", 76, "Clustered index", "Data sorted by index; one per table."),
  t("s2_dbms_acid_non_clustered_index", "S2", "dbms_indexing_acid", 77, "Non-clustered index", "Separate structure pointing to rows."),
  t("s2_dbms_acid_index_when_not", "S2", "dbms_indexing_acid", 78, "When indexes hurt", "Write-heavy tables; low-cardinality columns."),
  t("s2_dbms_acid_transaction_deadlock", "S2", "dbms_indexing_acid", 79, "Deadlocks", "Detection and prevention basics."),
  t("s2_dbms_acid_commit_rollback", "S2", "dbms_indexing_acid", 80, "COMMIT and ROLLBACK", "Transaction control statements."),
  t("s2_ds_arraylist_vs_linkedlist", "S2", "ds_algo_theory", 81, "ArrayList vs LinkedList", "Insert/delete vs random access complexity."),
  t("s2_ds_stack_queue_deque", "S2", "ds_algo_theory", 82, "Stack, queue, deque", "LIFO/FIFO operations and use cases."),
  t("s2_ds_hashmap_internals", "S2", "ds_algo_theory", 83, "HashMap internals", "Buckets, collisions, O(1) average case."),
  t("s2_ds_tree_terminology", "S2", "ds_algo_theory", 84, "Tree terminology", "Root, leaf, height, depth, balanced vs skewed."),
  t("s2_ds_bst_properties", "S2", "ds_algo_theory", 85, "Binary search tree", "Ordering property; search/insert complexity."),
  t("s2_ds_traversal_inorder", "S2", "ds_algo_theory", 86, "Inorder traversal", "Left-root-right; sorted output for BST."),
  t("s2_ds_traversal_preorder", "S2", "ds_algo_theory", 87, "Preorder traversal", "Root-left-right; copy tree use case."),
  t("s2_ds_traversal_postorder", "S2", "ds_algo_theory", 88, "Postorder traversal", "Left-right-root; delete tree use case."),
  t("s2_ds_bfs_vs_dfs", "S2", "ds_algo_theory", 89, "BFS vs DFS", "Queue vs stack; shortest path unweighted."),
  t("s2_ds_sorting_complexity", "S2", "ds_algo_theory", 90, "Sorting complexities", "Quick/merge/heap sort Big-O comparison."),
  t("s2_ds_big_o_basics", "S2", "ds_algo_theory", 91, "Big-O basics", "O(1), O(log n), O(n), O(n log n), O(n²) examples."),
  t("s2_ds_recursion_base_case", "S2", "ds_algo_theory", 92, "Recursion fundamentals", "Base case + recursive case; stack overflow risk."),
  t("s2_trace_1", "S2", "output_tracing", 93, "Output tracing drill #1", "Trace inheritance/overloading snippet #1 on paper; write final output line-by-line."),
  t("s2_trace_2", "S2", "output_tracing", 94, "Output tracing drill #2", "Trace inheritance/overloading snippet #2 on paper; write final output line-by-line."),
  t("s2_trace_3", "S2", "output_tracing", 95, "Output tracing drill #3", "Trace inheritance/overloading snippet #3 on paper; write final output line-by-line."),
  t("s2_trace_4", "S2", "output_tracing", 96, "Output tracing drill #4", "Trace inheritance/overloading snippet #4 on paper; write final output line-by-line."),
  t("s2_trace_5", "S2", "output_tracing", 97, "Output tracing drill #5", "Trace inheritance/overloading snippet #5 on paper; write final output line-by-line."),
  t("s2_trace_6", "S2", "output_tracing", 98, "Output tracing drill #6", "Trace inheritance/overloading snippet #6 on paper; write final output line-by-line."),
  t("s2_trace_7", "S2", "output_tracing", 99, "Output tracing drill #7", "Trace inheritance/overloading snippet #7 on paper; write final output line-by-line."),
  t("s2_trace_8", "S2", "output_tracing", 100, "Output tracing drill #8", "Trace inheritance/overloading snippet #8 on paper; write final output line-by-line."),
  t("s2_trace_9", "S2", "output_tracing", 101, "Output tracing drill #9", "Trace inheritance/overloading snippet #9 on paper; write final output line-by-line."),
  t("s2_trace_10", "S2", "output_tracing", 102, "Output tracing drill #10", "Trace inheritance/overloading snippet #10 on paper; write final output line-by-line."),
  t("s2_pattern_factory", "S2", "design_patterns", 103, "Factory pattern", "Create objects without specifying exact class."),
  t("s2_pattern_singleton", "S2", "design_patterns", 104, "Singleton pattern", "Single instance; thread-safety concern."),
  t("s2_pattern_observer", "S2", "design_patterns", 105, "Observer pattern", "Publish-subscribe; event listeners."),
  t("s2_pattern_strategy", "S2", "design_patterns", 106, "Strategy pattern", "Swap algorithms at runtime; OCP example."),
  t("s2_pattern_decorator", "S2", "design_patterns", 107, "Decorator pattern", "Add behavior dynamically; Java I/O streams."),
  t("s2_pattern_adapter", "S2", "design_patterns", 108, "Adapter pattern", "Convert interface to another expected interface."),
  t("s2_pattern_mvc", "S2", "design_patterns", 109, "MVC pattern", "Model-View-Controller separation."),
  t("s2_pattern_identify_from_uml", "S2", "design_patterns", 110, "Identify pattern from UML", "Given class diagram, name the pattern."),
  t("s2_mcq_mock_1", "S2", "mcq_speed", 111, "Full MCQ mock #1", "45-min timed mock; log score and weak sections."),
  t("s2_mcq_mock_2", "S2", "mcq_speed", 112, "Full MCQ mock #2", "Second full mock under exam conditions."),
  t("s2_mcq_oop_speed", "S2", "mcq_speed", 113, "OOP speed drill", "20 OOP MCQs in 15 minutes."),
  t("s2_mcq_dbms_speed", "S2", "mcq_speed", 114, "DBMS speed drill", "20 DBMS MCQs in 15 minutes."),
  t("s2_mcq_review_errors", "S2", "mcq_speed", 115, "Error log review", "Review every wrong answer; tag by competency.", "stretch"),
  t("s3_arr_two_sum", "S3", "arrays_strings", 116, "Two Sum (LC 1)", "Hash map complement lookup; explain O(n) time."),
  t("s3_arr_group_anagrams", "S3", "arrays_strings", 117, "Group Anagrams (LC 49)", "Sort or frequency key grouping."),
  t("s3_arr_valid_anagram", "S3", "arrays_strings", 118, "Valid Anagram (LC 242)", "Character frequency comparison."),
  t("s3_arr_contains_duplicate", "S3", "arrays_strings", 119, "Contains Duplicate (LC 217)", "Set membership check."),
  t("s3_arr_product_except_self", "S3", "arrays_strings", 120, "Product of Array Except Self (LC 238)", "Prefix/suffix products without division."),
  t("s3_arr_max_subarray", "S3", "arrays_strings", 121, "Maximum Subarray (LC 53)", "Kadane\'s algorithm; track running sum."),
  t("s3_arr_best_time_stock", "S3", "arrays_strings", 122, "Best Time to Buy and Sell Stock (LC 121)", "Track min price and max profit."),
  t("s3_arr_move_zeroes", "S3", "arrays_strings", 123, "Move Zeroes (LC 283)", "In-place two-pointer swap."),
  t("s3_arr_encode_decode_strings", "S3", "arrays_strings", 124, "Encode and Decode Strings (LC 271)", "Delimiter or length-prefix encoding.", "stretch"),
  t("s3_arr_top_k_frequent", "S3", "arrays_strings", 125, "Top K Frequent Elements (LC 347)", "Bucket sort or heap by frequency.", "stretch"),
  t("s3_hash_two_sum_review", "S3", "hashing", 126, "Two Sum — hashing lens", "Re-solve emphasizing hash map design choices."),
  t("s3_hash_valid_anagram_hash", "S3", "hashing", 127, "Valid Anagram — hash map", "Array of 26 counts vs HashMap."),
  t("s3_hash_subarray_sum_k", "S3", "hashing", 128, "Subarray Sum Equals K (LC 560)", "Prefix sum + hash map frequency."),
  t("s3_hash_longest_consecutive", "S3", "hashing", 129, "Longest Consecutive Sequence (LC 128)", "Set lookup for streak expansion."),
  t("s3_hash_happy_number", "S3", "hashing", 130, "Happy Number (LC 202)", "Cycle detection with hash set."),
  t("s3_hash_isomorphic_strings", "S3", "hashing", 131, "Isomorphic Strings (LC 205)", "Bijection mapping with two maps."),
  t("s3_hash_ransom_note", "S3", "hashing", 132, "Ransom Note (LC 383)", "Character frequency feasibility check."),
  t("s3_hash_first_unique_char", "S3", "hashing", 133, "First Unique Character (LC 387)", "Frequency map then scan string."),
  t("s3_tp_longest_substring", "S3", "two_pointers_sliding", 134, "Longest Substring Without Repeating (LC 3)", "Sliding window with last-seen index map."),
  t("s3_tp_min_window_substring", "S3", "two_pointers_sliding", 135, "Minimum Window Substring (LC 76)", "Expand/shrink window with frequency counts."),
  t("s3_tp_container_water", "S3", "two_pointers_sliding", 136, "Container With Most Water (LC 11)", "Two pointers from both ends."),
  t("s3_tp_3sum", "S3", "two_pointers_sliding", 137, "3Sum (LC 15)", "Sort + two pointers; skip duplicates."),
  t("s3_tp_3sum_closest", "S3", "two_pointers_sliding", 138, "3Sum Closest (LC 16)", "Track closest sum to target.", "stretch"),
  t("s3_tp_trapping_rain", "S3", "two_pointers_sliding", 139, "Trapping Rain Water (LC 42)", "Two pointers or prefix max arrays.", "stretch"),
  t("s3_tp_valid_palindrome", "S3", "two_pointers_sliding", 140, "Valid Palindrome (LC 125)", "Two pointers skip non-alphanumeric."),
  t("s3_tp_two_sum_ii", "S3", "two_pointers_sliding", 141, "Two Sum II (LC 167)", "Sorted array two pointers."),
  t("s3_tp_remove_duplicates_sorted", "S3", "two_pointers_sliding", 142, "Remove Duplicates from Sorted Array (LC 26)", "Slow/fast write pointer."),
  t("s3_tp_sort_colors", "S3", "two_pointers_sliding", 143, "Sort Colors (LC 75)", "Dutch national flag three pointers."),
  t("s3_ll_reverse_ll", "S3", "linked_lists", 144, "Reverse Linked List (LC 206)", "Iterative three-pointer reversal."),
  t("s3_ll_merge_two_lists", "S3", "linked_lists", 145, "Merge Two Sorted Lists (LC 21)", "Dummy head merge pattern."),
  t("s3_ll_ll_cycle", "S3", "linked_lists", 146, "Linked List Cycle (LC 141)", "Floyd\'s tortoise and hare."),
  t("s3_ll_remove_nth_node", "S3", "linked_lists", 147, "Remove Nth Node From End (LC 19)", "Two pointers n-gap apart."),
  t("s3_ll_reorder_list", "S3", "linked_lists", 148, "Reorder List (LC 143)", "Find mid, reverse second half, merge.", "stretch"),
  t("s3_ll_add_two_numbers", "S3", "linked_lists", 149, "Add Two Numbers (LC 2)", "Digit-by-digit carry simulation."),
  t("s3_ll_intersection_ll", "S3", "linked_lists", 150, "Intersection of Two Linked Lists (LC 160)", "Pointer switch trick."),
  t("s3_ll_palindrome_ll", "S3", "linked_lists", 151, "Palindrome Linked List (LC 234)", "Find mid, reverse, compare halves."),
  t("s3_ll_middle_node", "S3", "linked_lists", 152, "Middle of the Linked List (LC 876)", "Slow/fast pointer to mid."),
  t("s3_ll_delete_node", "S3", "linked_lists", 153, "Delete Node in a Linked List (LC 237)", "Copy next value trick."),
  t("s3_tg_num_islands", "S3", "trees_graphs", 154, "Number of Islands (LC 200)", "DFS/BFS grid flood fill."),
  t("s3_tg_course_schedule", "S3", "trees_graphs", 155, "Course Schedule (LC 207)", "Topological sort cycle detection."),
  t("s3_tg_clone_graph", "S3", "trees_graphs", 156, "Clone Graph (LC 133)", "BFS/DFS with hash map of clones."),
  t("s3_tg_validate_bst", "S3", "trees_graphs", 157, "Validate Binary Search Tree (LC 98)", "Inorder or min/max bounds."),
  t("s3_tg_lca_bst", "S3", "trees_graphs", 158, "Lowest Common Ancestor of BST (LC 235)", "Use BST ordering property."),
  t("s3_tg_max_depth", "S3", "trees_graphs", 159, "Maximum Depth of Binary Tree (LC 104)", "Recursive depth count."),
  t("s3_tg_invert_tree", "S3", "trees_graphs", 160, "Invert Binary Tree (LC 226)", "Swap children recursively."),
  t("s3_tg_level_order", "S3", "trees_graphs", 161, "Binary Tree Level Order Traversal (LC 102)", "BFS queue by level."),
  t("s3_tg_same_tree", "S3", "trees_graphs", 162, "Same Tree (LC 100)", "Parallel recursive comparison."),
  t("s3_tg_subtree_of_tree", "S3", "trees_graphs", 163, "Subtree of Another Tree (LC 572)", "Match helper at each node."),
  t("s3_tg_rotting_oranges", "S3", "trees_graphs", 164, "Rotting Oranges (LC 994)", "Multi-source BFS on grid."),
  t("s3_tg_word_ladder", "S3", "trees_graphs", 165, "Word Ladder (LC 127)", "BFS shortest transformation.", "stretch"),
  t("s3_tg_pacific_atlantic", "S3", "trees_graphs", 166, "Pacific Atlantic Water Flow (LC 417)", "Reverse DFS from oceans.", "stretch"),
  t("s3_tg_graph_valid_tree", "S3", "trees_graphs", 167, "Graph Valid Tree (LC 261)", "Union-find or DFS cycle check.", "stretch"),
  t("s3_bs_binary_search", "S3", "binary_search", 168, "Binary Search (LC 704)", "Classic halving search space."),
  t("s3_bs_search_rotated", "S3", "binary_search", 169, "Search in Rotated Sorted Array (LC 33)", "Identify sorted half."),
  t("s3_bs_find_min_rotated", "S3", "binary_search", 170, "Find Minimum in Rotated Sorted Array (LC 153)", "Compare mid with right end."),
  t("s3_bs_first_last_position", "S3", "binary_search", 171, "Find First and Last Position (LC 34)", "Lower/upper bound binary search."),
  t("s3_bs_search_2d_matrix", "S3", "binary_search", 172, "Search a 2D Matrix (LC 74)", "Treat as flattened sorted array."),
  t("s3_bs_koko_eating_bananas", "S3", "binary_search", 173, "Koko Eating Bananas (LC 875)", "Binary search on answer.", "stretch"),
  t("s3_bs_median_two_arrays", "S3", "binary_search", 174, "Median of Two Sorted Arrays (LC 4)", "Partition binary search.", "stretch"),
  t("s3_bs_sqrt_x", "S3", "binary_search", 175, "Sqrt(x) (LC 69)", "Binary search on integer answer."),
  t("s3_stk_valid_parentheses", "S3", "stacks_queues", 176, "Valid Parentheses (LC 20)", "Stack matching open/close brackets."),
  t("s3_stk_min_stack", "S3", "stacks_queues", 177, "Min Stack (LC 155)", "Auxiliary stack or paired value."),
  t("s3_stk_daily_temperatures", "S3", "stacks_queues", 178, "Daily Temperatures (LC 739)", "Monotonic decreasing stack."),
  t("s3_stk_evaluate_rpn", "S3", "stacks_queues", 179, "Evaluate Reverse Polish Notation (LC 150)", "Stack operand evaluation."),
  t("s3_stk_generate_parentheses", "S3", "stacks_queues", 180, "Generate Parentheses (LC 22)", "Backtracking with open/close counts.", "stretch"),
  t("s3_stk_car_fleet", "S3", "stacks_queues", 181, "Car Fleet (LC 853)", "Monotonic stack on arrival times.", "stretch"),
  t("s3_stk_largest_rectangle", "S3", "stacks_queues", 182, "Largest Rectangle in Histogram (LC 84)", "Monotonic stack index tracking.", "stretch"),
  t("s3_stk_decode_string", "S3", "stacks_queues", 183, "Decode String (LC 394)", "Stack for nested brackets.", "stretch"),
  t("s3_stk_next_greater_element", "S3", "stacks_queues", 184, "Next Greater Element I (LC 496)", "Monotonic stack pattern intro."),
  t("s3_stk_implement_queue_stacks", "S3", "stacks_queues", 185, "Implement Queue using Stacks (LC 232)", "Two-stack queue design."),
  t("s3_dp_climbing_stairs", "S3", "basic_dp", 186, "Climbing Stairs (LC 70)", "Fibonacci-style 1/2 step DP."),
  t("s3_dp_house_robber", "S3", "basic_dp", 187, "House Robber (LC 198)", "Take/skip adjacent houses."),
  t("s3_dp_coin_change", "S3", "basic_dp", 188, "Coin Change (LC 322)", "Unbounded knapsack min coins."),
  t("s3_dp_lcs", "S3", "basic_dp", 189, "Longest Common Subsequence (LC 1143)", "2D DP table on strings."),
  t("s3_dp_word_break", "S3", "basic_dp", 190, "Word Break (LC 139)", "DP on prefix reachability.", "stretch"),
  t("s3_dp_unique_paths", "S3", "basic_dp", 191, "Unique Paths (LC 62)", "Grid path counting DP.", "stretch"),
  t("s3_dp_max_product_subarray", "S3", "basic_dp", 192, "Maximum Product Subarray (LC 152)", "Track min and max products.", "stretch"),
  t("s3_dp_decode_ways", "S3", "basic_dp", 193, "Decode Ways (LC 91)", "String partition DP.", "stretch"),
  t("s3_dp_palindromic_substrings", "S3", "basic_dp", 194, "Palindromic Substrings (LC 647)", "Expand around center or DP.", "stretch"),
  t("s3_dp_edit_distance", "S3", "basic_dp", 195, "Edit Distance (LC 72)", "Classic 2D DP — hard cap for BS23.", "stretch"),
  t("s3_cx_state_after_each", "S3", "complexity_explanation", 196, "State complexity after each solution", "After every problem, say time and space aloud before moving on."),
  t("s3_cx_compare_bruteforce", "S3", "complexity_explanation", 197, "Compare brute force vs optimal", "Briefly mention naive approach then optimized."),
  t("s3_cx_tradeoff_explanation", "S3", "complexity_explanation", 198, "Explain trade-offs", "When extra space buys time — justify choices."),
  t("s3_cx_recursion_stack_space", "S3", "complexity_explanation", 199, "Recursion stack space", "Depth × stack frame for recursive DFS."),
  t("s3_cx_amortized_analysis", "S3", "complexity_explanation", 200, "Amortized analysis intro", "Dynamic array doubling — optional stretch.", "stretch"),
  t("s3_paper_paper_two_sum", "S3", "paper_solving", 201, "Paper: Two Sum", "Write full solution on paper in 20 min; no IDE."),
  t("s3_paper_paper_reverse_ll", "S3", "paper_solving", 202, "Paper: Reverse Linked List", "Draw pointers step-by-step on paper."),
  t("s3_paper_paper_valid_paren", "S3", "paper_solving", 203, "Paper: Valid Parentheses", "Stack simulation written by hand."),
  t("s3_paper_paper_bfs_template", "S3", "paper_solving", 204, "Paper: BFS template", "Write generic BFS pseudocode from memory."),
  t("s3_paper_paper_binary_search", "S3", "paper_solving", 205, "Paper: Binary Search", "Write loop invariants and boundary checks."),
  t("s3_paper_paper_erd_to_query", "S3", "paper_solving", 206, "Paper: ERD to query", "Given mini schema, write SQL by hand.", "stretch"),
  t("s3_paper_paper_mock_1", "S3", "paper_solving", 207, "Paper mock set #1", "Two problems in 45 min — BS23 written format."),
  t("s3_paper_paper_mock_2", "S3", "paper_solving", 208, "Paper mock set #2", "Two problems in 45 min — mixed patterns."),
  t("s3_paper_paper_mock_3", "S3", "paper_solving", 209, "Paper mock set #3", "Two problems in 45 min — include one graph."),
  t("s3_paper_paper_complexity_writeup", "S3", "paper_solving", 210, "Paper: complexity writeup", "After mock, write time/space for each on paper."),
  t("s3_arr_majority_element", "S3", "arrays_strings", 211, "Majority Element (LC 169)", "Boyer-Moore vote or hash count."),
  t("s3_hash_longest_palindrome", "S3", "hashing", 212, "Longest Palindrome (LC 409)", "Character frequency — can form palindrome?"),
  t("s3_tp_max_area_histogram", "S3", "two_pointers_sliding", 213, "Max Consecutive Ones III (LC 1004)", "Sliding window with at most k flips.", "stretch"),
  t("s3_tg_serialize_tree", "S3", "trees_graphs", 214, "Serialize and Deserialize Binary Tree (LC 297)", "BFS/DFS encoding — stretch hard."),
  t("s3_paper_mock_4", "S3", "paper_solving", 215, "Paper mock set #4", "Two problems in 45 min — include DP or binary search."),
  t("s4_req_actors_constraints", "S4", "requirement_analysis", 216, "Identify actors and constraints", "List users, admin, payment gateway, time limits."),
  t("s4_req_functional_vs_nonfunctional", "S4", "requirement_analysis", 217, "Functional vs non-functional reqs", "Features vs performance, security, scalability."),
  t("s4_req_edge_cases_list", "S4", "requirement_analysis", 218, "Edge case brainstorming", "Empty cart, duplicate payment, session timeout."),
  t("s4_req_user_stories", "S4", "requirement_analysis", 219, "Write user stories", "As a [role], I want [goal], so that [benefit]."),
  t("s4_req_scope_mvp", "S4", "requirement_analysis", 220, "Define MVP scope", "Must-have vs nice-to-have for 30-min design."),
  t("s4_req_assumption_log", "S4", "requirement_analysis", 221, "Assumption log", "Document assumptions when requirements are vague."),
  t("s4_erd_ecommerce_erd", "S4", "erd_design", 222, "E-commerce ERD", "Users, products, orders, order_items, payments."),
  t("s4_erd_ticketing_erd", "S4", "erd_design", 223, "Event ticketing ERD", "Events, seats, bookings, tickets — BS23 classic."),
  t("s4_erd_library_erd", "S4", "erd_design", 224, "Library system ERD", "Books, members, loans, fines."),
  t("s4_erd_cardinality_notation", "S4", "erd_design", 225, "Cardinality notation", "1:1, 1:N, M:N with junction tables."),
  t("s4_erd_weak_entities", "S4", "erd_design", 226, "Weak entities", "OrderLine depends on Order — composite keys."),
  t("s4_erd_normalization_erd", "S4", "erd_design", 227, "Normalize your ERD", "Ensure 3NF unless denormalization justified."),
  t("s4_erd_erd_timed_30min", "S4", "erd_design", 228, "Timed ERD — 30 minutes", "Full ERD from prompt without computer."),
  t("s4_erd_erd_to_sql_preview", "S4", "erd_design", 229, "ERD → table list", "Translate entities to CREATE TABLE outline."),
  t("s4_arch_context_diagram", "S4", "architecture_flow", 230, "System context diagram", "System boundary, external actors, data flows."),
  t("s4_arch_component_diagram", "S4", "architecture_flow", 231, "Component diagram", "API, DB, cache, message queue blocks."),
  t("s4_arch_sequence_checkout", "S4", "architecture_flow", 232, "Sequence: checkout flow", "Client → API → DB → payment gateway."),
  t("s4_arch_deployment_sketch", "S4", "architecture_flow", 233, "Deployment sketch", "Web server, app server, DB — cloud boxes."),
  t("s4_arch_api_endpoints_list", "S4", "architecture_flow", 234, "REST endpoint list", "CRUD routes for core entities."),
  t("s4_arch_scalability_notes", "S4", "architecture_flow", 235, "Scalability talking points", "Horizontal scaling, read replicas — brief."),
  t("s4_flow_login_flowchart", "S4", "flowcharts", 236, "Login flowchart", "Credentials, JWT, error branches."),
  t("s4_flow_registration_flowchart", "S4", "flowcharts", 237, "Registration flowchart", "Validation, duplicate email, welcome email."),
  t("s4_flow_payment_flowchart", "S4", "flowcharts", 238, "Payment flowchart", "Success, failure, retry, refund paths."),
  t("s4_flow_decision_symbols", "S4", "flowcharts", 239, "Flowchart symbols", "Process, decision, terminator — exam notation."),
  t("s4_flow_loop_representation", "S4", "flowcharts", 240, "Loops in flowcharts", "While/retry loops with clear exit."),
  t("s4_flow_timed_flowchart", "S4", "flowcharts", 241, "Timed flowchart drill", "Draw registration flow in 15 min on paper."),
  t("s4_pseudo_rbac_pseudocode", "S4", "pseudocode", 242, "RBAC pseudocode", "Roles, permissions, check access function."),
  t("s4_pseudo_pagination_pseudocode", "S4", "pseudocode", 243, "Pagination pseudocode", "Offset/limit or cursor-based listing."),
  t("s4_pseudo_rate_limiter_pseudocode", "S4", "pseudocode", 244, "Rate limiter pseudocode", "Token bucket or sliding window outline."),
  t("s4_pseudo_search_filter_pseudocode", "S4", "pseudocode", 245, "Search/filter pseudocode", "Multi-field filter on product list."),
  t("s4_pseudo_idempotency_pseudocode", "S4", "pseudocode", 246, "Idempotent payment pseudocode", "Prevent double-charge on retry."),
  t("s4_pseudo_pseudocode_conventions", "S4", "pseudocode", 247, "Pseudocode conventions", "Clear blocks, no language-specific syntax."),
  t("s4_sql_select_join_erd", "S4", "sql_handwrite", 248, "SELECT with JOIN on your ERD", "Query spanning 2-3 tables you designed."),
  t("s4_sql_aggregate_report", "S4", "sql_handwrite", 249, "Aggregate report query", "GROUP BY sales by month."),
  t("s4_sql_subquery_erd", "S4", "sql_handwrite", 250, "Subquery on your ERD", "Customers who never ordered."),
  t("s4_sql_insert_update_handwrite", "S4", "sql_handwrite", 251, "Hand-write INSERT/UPDATE", "No autocomplete — correct syntax."),
  t("s4_sql_index_justification", "S4", "sql_handwrite", 252, "Index justification", "Which columns to index on your schema and why."),
  t("s4_sql_transaction_scenario", "S4", "sql_handwrite", 253, "Transaction scenario SQL", "Transfer funds with BEGIN/COMMIT."),
  t("s4_sql_second_highest_handwrite", "S4", "sql_handwrite", 254, "Second highest salary — paper", "Write query from memory."),
  t("s4_sql_erd_timed_sql_20min", "S4", "sql_handwrite", 255, "Timed SQL — 20 minutes", "5 queries against your own ERD."),
  t("s4_team_ownpath_roles", "S4", "teamwork_leadership", 256, "OwnPATH role assignment", "Owner, Architect, Developer, Tester, Handler — practice assigning."),
  t("s4_team_mock_team_design", "S4", "teamwork_leadership", 257, "Mock team design session", "45-min group design with assigned roles."),
  t("s4_team_conflict_resolution", "S4", "teamwork_leadership", 258, "Design disagreement handling", "How to disagree constructively in team exercise."),
  t("s4_team_timebox_facilitation", "S4", "teamwork_leadership", 259, "Timebox facilitation", "Keep team on track during design hour."),
  t("s4_team_note_taking_panel", "S4", "teamwork_leadership", 260, "Panel note-taking", "Capture decisions for presentation handoff."),
  t("s4_team_lead_without_dominating", "S4", "teamwork_leadership", 261, "Lead without dominating", "Balance speaking time in group assessment."),
  t("s4_pres_ten_min_structure", "S4", "presentation", 262, "10-minute pitch structure", "Problem, solution, ERD highlight, trade-offs, next steps."),
  t("s4_pres_whiteboard_erd_present", "S4", "presentation", 263, "Present ERD on whiteboard", "Explain entities while drawing."),
  t("s4_pres_q_and_a_prep", "S4", "presentation", 264, "Q&A preparation", "Anticipate panel questions on scale and security."),
  t("s4_pres_speak_to_diagram", "S4", "presentation", 265, "Speak to diagram", "Point at components while explaining flow."),
  t("s4_pres_mock_presentation_1", "S4", "presentation", 266, "Mock presentation #1", "Record 10-min team pitch; review pacing."),
  t("s4_pres_mock_presentation_2", "S4", "presentation", 267, "Mock presentation #2", "Second scenario — different domain."),
  t("s4_stack_java_core_15", "S4", "stack_specific_test", 268, "Java — 15 core questions", "Collections, exceptions, OOP — 20-min drill."),
  t("s4_stack_csharp_core_15", "S4", "stack_specific_test", 269, "C# — 15 core questions", "LINQ, async basics, OOP — if declared stack."),
  t("s4_stack_javascript_core_15", "S4", "stack_specific_test", 270, "JavaScript — 15 core questions", "Closures, promises, array methods — if declared."),
  t("s4_stack_stack_declare_choice", "S4", "stack_specific_test", 271, "Declare stack choice", "Pick Java, C#, or JavaScript and stick to it."),
  t("s4_stack_stack_cheat_sheet", "S4", "stack_specific_test", 272, "Stack one-page cheat sheet", "Syntax you might forget under pressure."),
  t("s4_stack_stack_timed_mock", "S4", "stack_specific_test", 273, "Stack timed mock", "20-min / 15 questions under exam rules."),
  t("s4_stamina_full_day", "S4", "full_day_stamina", 274, "Full-day simulation", "Run 8:30–18:00 schedule: MCQ review, design, SQL, presentation blocks."),
  t("s4_stamina_nutrition", "S4", "full_day_stamina", 275, "Day-long logistics plan", "Meals, hydration, commute to Mohakhali — reduce surprises.", "stretch"),
  t("s5_star_conflict_situation", "S5", "star_stories", 276, "STAR — Technical disagreement: Situation", "Write and rehearse the Situation beat for your technical disagreement story (30-60 sec)."),
  t("s5_star_conflict_task", "S5", "star_stories", 277, "STAR — Technical disagreement: Task", "Write and rehearse the Task beat for your technical disagreement story (30-60 sec)."),
  t("s5_star_conflict_action", "S5", "star_stories", 278, "STAR — Technical disagreement: Action", "Write and rehearse the Action beat for your technical disagreement story (30-60 sec)."),
  t("s5_star_conflict_result", "S5", "star_stories", 279, "STAR — Technical disagreement: Result", "Write and rehearse the Result beat for your technical disagreement story (30-60 sec)."),
  t("s5_star_deadline_situation", "S5", "star_stories", 280, "STAR — Missed deadline: Situation", "Write and rehearse the Situation beat for your missed deadline story (30-60 sec)."),
  t("s5_star_deadline_task", "S5", "star_stories", 281, "STAR — Missed deadline: Task", "Write and rehearse the Task beat for your missed deadline story (30-60 sec)."),
  t("s5_star_deadline_action", "S5", "star_stories", 282, "STAR — Missed deadline: Action", "Write and rehearse the Action beat for your missed deadline story (30-60 sec)."),
  t("s5_star_deadline_result", "S5", "star_stories", 283, "STAR — Missed deadline: Result", "Write and rehearse the Result beat for your missed deadline story (30-60 sec)."),
  t("s5_star_bug_situation", "S5", "star_stories", 284, "STAR — Hard bug: Situation", "Write and rehearse the Situation beat for your hard bug story (30-60 sec)."),
  t("s5_star_bug_task", "S5", "star_stories", 285, "STAR — Hard bug: Task", "Write and rehearse the Task beat for your hard bug story (30-60 sec)."),
  t("s5_star_bug_action", "S5", "star_stories", 286, "STAR — Hard bug: Action", "Write and rehearse the Action beat for your hard bug story (30-60 sec)."),
  t("s5_star_bug_result", "S5", "star_stories", 287, "STAR — Hard bug: Result", "Write and rehearse the Result beat for your hard bug story (30-60 sec)."),
  t("s5_star_learning_situation", "S5", "star_stories", 288, "STAR — Learning fast: Situation", "Write and rehearse the Situation beat for your learning fast story (30-60 sec)."),
  t("s5_star_learning_task", "S5", "star_stories", 289, "STAR — Learning fast: Task", "Write and rehearse the Task beat for your learning fast story (30-60 sec)."),
  t("s5_star_learning_action", "S5", "star_stories", 290, "STAR — Learning fast: Action", "Write and rehearse the Action beat for your learning fast story (30-60 sec)."),
  t("s5_star_learning_result", "S5", "star_stories", 291, "STAR — Learning fast: Result", "Write and rehearse the Result beat for your learning fast story (30-60 sec)."),
  t("s5_star_teamwork_situation", "S5", "star_stories", 292, "STAR — Teamwork under pressure: Situation", "Write and rehearse the Situation beat for your teamwork under pressure story (30-60 sec)."),
  t("s5_star_teamwork_task", "S5", "star_stories", 293, "STAR — Teamwork under pressure: Task", "Write and rehearse the Task beat for your teamwork under pressure story (30-60 sec)."),
  t("s5_star_teamwork_action", "S5", "star_stories", 294, "STAR — Teamwork under pressure: Action", "Write and rehearse the Action beat for your teamwork under pressure story (30-60 sec)."),
  t("s5_star_teamwork_result", "S5", "star_stories", 295, "STAR — Teamwork under pressure: Result", "Write and rehearse the Result beat for your teamwork under pressure story (30-60 sec)."),
  t("s5_why_company_research", "S5", "why_bs23", 296, "BS23 company research", "History, fintech clients, public listing, global offices."),
  t("s5_why_products_services", "S5", "why_bs23", 297, "Products and services", "Banking, insurance, ERP — name specific offerings."),
  t("s5_why_culture_values", "S5", "why_bs23", 298, "Culture and values", "OwnPATH, innovation, growth — tie to your style."),
  t("s5_why_career_growth", "S5", "why_bs23", 299, "Career growth angle", "Training, mentorship, international exposure."),
  t("s5_why_sixty_sec_script", "S5", "why_bs23", 300, "60-second Why BS23 script", "Rehearse aloud; specific, not generic praise."),
  t("s5_en_record_star", "S5", "english_fluency", 301, "Record STAR answer", "Listen for filler words (um, like, actually)."),
  t("s5_en_behavioral_list", "S5", "english_fluency", 302, "Behavioral question list", "Practice 10 common HR questions in English."),
  t("s5_en_technical_explain", "S5", "english_fluency", 303, "Explain project in English", "2-min elevator pitch for project #1."),
  t("s5_en_shadowing", "S5", "english_fluency", 304, "Shadow English tech talk", "Watch 2 conference talks; note pacing and vocabulary.", "stretch"),
  t("s5_fail_weakness_story", "S5", "failure_weakness", 305, "Failure story", "Real failure + what you learned + behavior change."),
  t("s5_fail_greatest_weakness", "S5", "failure_weakness", 306, "Greatest weakness answer", "Honest weakness that is not a humble brag."),
  t("s5_fail_improvement_plan", "S5", "failure_weakness", 307, "Improvement plan", "Concrete steps you are taking to improve weakness."),
  t("s5_salary_research", "S5", "salary_expectation", 308, "Research fresher salary band", "Check Glassdoor, peers, BS23 ranges for freshers."),
  t("s5_salary_script", "S5", "salary_expectation", 309, "Salary expectation script", "Give researched range; show flexibility on benefits."),
];

export function getTopicsByStage(stageId: Bs23StageId): Bs23TopicDef[] {
  return BS23_SYLLABUS.filter((topic) => topic.stageId === stageId).sort((a, b) => a.order - b.order);
}

export function getTopicsByCompetency(competencyId: string): Bs23TopicDef[] {
  return BS23_SYLLABUS.filter((topic) => topic.competencyId === competencyId).sort((a, b) => a.order - b.order);
}

function topicWeight(topic: Bs23TopicDef): number {
  return TIER_WEIGHT[topic.tier];
}

function isDone(status: Bs23TopicProgressMap[string] | undefined): boolean {
  return status === "done";
}

export function getNextUnfinishedTopics(
  progress: Bs23TopicProgressMap,
  limit = 10
): Bs23TopicDef[] {
  const unfinished = BS23_SYLLABUS.filter((topic) => !isDone(progress[topic.id]));
  return unfinished.slice(0, Math.max(0, limit));
}

export function computeCompetencyCoverage(
  progress: Bs23TopicProgressMap
): Bs23CompetencyCoverage[] {
  const competencyIds = [...new Set(BS23_SYLLABUS.map((topic) => topic.competencyId))];
  return competencyIds
    .map((competencyId) => {
      const competencyTopics = getTopicsByCompetency(competencyId);
      if (competencyTopics.length === 0) return undefined;

      let totalWeight = 0;
      let completedWeight = 0;
      let completedTopics = 0;
      let coreTopics = 0;
      let coreCompleted = 0;

      for (const topic of competencyTopics) {
        const weight = topicWeight(topic);
        totalWeight += weight;
        if (topic.tier === "core") coreTopics += 1;
        if (isDone(progress[topic.id])) {
          completedWeight += weight;
          completedTopics += 1;
          if (topic.tier === "core") coreCompleted += 1;
        }
      }

      const coverage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

      return {
        competencyId,
        stageId: competencyTopics[0].stageId,
        totalWeight,
        completedWeight,
        coverage,
        totalTopics: competencyTopics.length,
        completedTopics,
        coreTopics,
        coreCompleted,
      };
    })
    .filter((c): c is Bs23CompetencyCoverage => c !== undefined);
}

export function computeStageCoverageSummary(
  progress: Bs23TopicProgressMap
): Bs23StageCoverageSummary[] {
  const allCompetencies = computeCompetencyCoverage(progress);
  const byCompetency = new Map(allCompetencies.map((c) => [c.competencyId, c]));
  const stageIds = [...new Set(BS23_SYLLABUS.map((topic) => topic.stageId))];

  return stageIds.map((stageId) => {
    const stageTopics = getTopicsByStage(stageId);
    const competencyIds = [...new Set(stageTopics.map((topic) => topic.competencyId))];
    const competencies = competencyIds
      .map((id) => byCompetency.get(id))
      .filter((c): c is Bs23CompetencyCoverage => c !== undefined);

    let totalWeight = 0;
    let completedWeight = 0;

    for (const topic of stageTopics) {
      const weight = topicWeight(topic);
      totalWeight += weight;
      if (isDone(progress[topic.id])) completedWeight += weight;
    }

    return {
      stageId,
      totalWeight,
      completedWeight,
      coverage: totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0,
      competencies,
    };
  });
}
