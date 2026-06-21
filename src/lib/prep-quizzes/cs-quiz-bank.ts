import type { PrepQuizQuestion } from "./types";

function q(
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string
): PrepQuizQuestion {
  return { question, options, correctIndex, explanation };
}

export const CS_QUIZ_BANK: Record<string, PrepQuizQuestion[]> = {
  "oop::encapsulation — data hiding and access modifiers": [
    q(
      "What is the primary purpose of encapsulation in OOP?",
      [
        "To hide internal state and expose behavior through a controlled interface",
        "To allow a class to inherit from multiple parent classes",
        "To convert objects into JSON for serialization",
        "To guarantee that all methods are static",
      ],
      0,
      "Encapsulation bundles data with the methods that operate on it and restricts direct access to internal fields, typically via access modifiers (private/protected/public)."
    ),
    q(
      "In Java, which access modifier most strongly supports encapsulation for instance fields?",
      [
        "private",
        "protected",
        "package-private (default)",
        "public",
      ],
      0,
      "Private fields cannot be accessed outside the declaring class, forcing callers to use getters/setters or public methods that enforce invariants."
    ),
    q(
      "A class exposes a deposit() method that validates amounts before updating balance, but keeps balance private. This demonstrates:",
      [
        "Data hiding with behavioral control",
        "Multiple inheritance",
        "Compile-time polymorphism only",
        "Structural typing",
      ],
      0,
      "Encapsulation is not just hiding data—it ensures state changes go through validated code paths, preserving object invariants."
    ),
    q(
      "Which is a common violation of encapsulation?",
      [
        "Returning a mutable internal collection directly from a getter",
        "Using private fields with public accessors",
        "Validating input in a setter",
        "Exposing read-only views of internal data",
      ],
      0,
      "Returning a live mutable reference lets external code modify internal state without going through the class's methods, breaking the abstraction."
    ),
    q(
      "How does encapsulation improve maintainability?",
      [
        "Internal representation can change without breaking callers if the public API stays stable",
        "It eliminates the need for unit tests",
        "It forces all classes to be final",
        "It requires every field to be public for transparency",
      ],
      0,
      "Callers depend on the public interface, not internal details—so you can refactor internals (e.g., swap a list for a map) without widespread code changes."
    ),
  ],

  "oop::inheritance — is-a relationships and code reuse": [
    q(
      "Inheritance is most appropriate when the relationship between classes is:",
      [
        "IS-A (a subtype is a specialized kind of its parent)",
        "HAS-A (one object contains another)",
        "USES-A (temporary collaboration)",
        "COPIES-A (duplicate implementation)",
      ],
      0,
      "Inheritance models specialization: a Dog IS-A Animal. HAS-A relationships are better expressed through composition."
    ),
    q(
      "What is a key risk of deep inheritance hierarchies?",
      [
        "Fragile base class problem—changes in a parent can break distant subclasses",
        "Guaranteed faster runtime performance",
        "Automatic thread safety",
        "Elimination of code duplication in all cases",
      ],
      0,
      "Subclasses depend on parent implementation details; a change in a base class can unexpectedly break behavior in subclasses far down the tree."
    ),
    q(
      "Which keyword typically prevents a class from being subclassed?",
      [
        "final (Java) / sealed or final (C#)",
        "static",
        "volatile",
        "abstract",
      ],
      0,
      "Marking a class final/sealed blocks inheritance—useful when subclassing would violate invariants (e.g., String in Java)."
    ),
    q(
      "Method overriding requires:",
      [
        "Same method signature in subclass with compatible return type and runtime dispatch",
        "Different method name in subclass",
        "Static methods in both parent and child",
        "private visibility in the subclass method",
      ],
      0,
      "Overriding replaces parent behavior for instance methods; the JVM/CLR resolves the call at runtime based on the actual object type."
    ),
    q(
      "When is inheritance preferred over composition for code reuse?",
      [
        "When there is a true IS-A relationship and Liskov substitution holds",
        "Whenever two classes share any method name",
        "When you need to reuse code but the relationship is HAS-A",
        "When you want to avoid defining interfaces",
      ],
      0,
      "Inheritance shares interface and implementation along a type hierarchy; it works when the subtype genuinely substitutes for the parent everywhere."
    ),
  ],

  "oop::polymorphism — runtime vs compile-time": [
    q(
      "Runtime (dynamic) polymorphism is achieved through:",
      [
        "Method overriding and virtual dispatch on object references",
        "Method overloading in the same class",
        "Using final classes exclusively",
        "Compile-time template expansion only",
      ],
      0,
      "When a parent reference points to a child object, the overridden method in the child is invoked at runtime."
    ),
    q(
      "Compile-time (static) polymorphism is exemplified by:",
      [
        "Method overloading—resolver picks the best match at compile time",
        "Virtual method tables at runtime",
        "Interface default methods only",
        "Reflection-based invocation",
      ],
      0,
      "Overloading resolves based on parameter types at compile time; no virtual dispatch is involved."
    ),
    q(
      "In Java, which enables polymorphic behavior via a common supertype?",
      [
        "Interfaces and abstract classes",
        "Only primitive types",
        "package-private classes only",
        "Static imports",
      ],
      0,
      "Code can accept an interface/abstract type and work with any concrete implementation, enabling plug-in architectures."
    ),
    q(
      "What does the Liskov Substitution Principle require for polymorphism?",
      [
        "Subtypes must be usable anywhere the base type is expected without breaking correctness",
        "Subtypes must add new public fields",
        "Subtypes must override every parent method",
        "Subtypes must not implement interfaces",
      ],
      0,
      "Polymorphism only holds if substituting a subclass does not alter program correctness—violations (e.g., Square/Rectangle) break the contract."
    ),
    q(
      "Which call uses runtime polymorphism?",
      [
        "animal.speak() where animal references a Dog instance at runtime",
        "Math.max(3, 7) with int arguments",
        "Overloaded println(int) vs println(String)",
        "A generic method call where T is inferred at compile time",
      ],
      0,
      "The declared type is the parent, but the JVM dispatches to Dog.speak() based on the actual object type."
    ),
  ],

  "oop::abstraction — interfaces vs abstract classes": [
    q(
      "What does abstraction primarily hide from the client?",
      [
        "Implementation details while exposing essential behavior",
        "All method names",
        "The existence of objects",
        "Type information at compile time",
      ],
      0,
      "Abstraction defines what an object does (contract) without exposing how it does it."
    ),
    q(
      "A key difference between an interface and an abstract class is:",
      [
        "A class can implement multiple interfaces but typically extends one abstract class",
        "Abstract classes cannot have any implemented methods",
        "Interfaces can only contain static fields in all languages",
        "Interfaces support multiple inheritance of state",
      ],
      0,
      "Interfaces define pure contracts (in classic form); abstract classes can share code and state but single inheritance limits their use as mixins."
    ),
    q(
      "When should you prefer an interface over an abstract class?",
      [
        "When unrelated classes need to share a contract without sharing implementation",
        "When you need protected fields shared by subclasses",
        "When you must provide a constructor chain",
        "When you want to prevent all polymorphism",
      ],
      0,
      "Interfaces decouple capability from hierarchy—any class can implement PaymentProcessor regardless of its inheritance tree."
    ),
    q(
      "Abstract classes are useful when:",
      [
        "Subclasses share substantial common code and partial implementation",
        "You need zero shared implementation",
        "You require multiple inheritance of implementation",
        "All methods must be public and concrete",
      ],
      0,
      "Template method pattern often uses abstract classes: common workflow is implemented, specific steps are abstract."
    ),
    q(
      "From a design perspective, programming to an abstraction means:",
      [
        "Depending on interfaces/abstract types rather than concrete classes",
        "Avoiding all interfaces",
        "Making every class concrete and final",
        "Using only global variables",
      ],
      0,
      "High-level modules depend on abstractions, not concretions—this is the Dependency Inversion Principle in practice."
    ),
  ],

  "oop::composition vs inheritance — when to use each": [
    q(
      "Composition is often favored over inheritance because it:",
      [
        "Avoids tight coupling and fragile base class issues",
        "Always runs faster",
        "Eliminates the need for interfaces",
        "Requires deeper class hierarchies",
      ],
      0,
      "Favor composition: behavior is assembled from parts; you can change collaborators without rewriting an inheritance chain."
    ),
    q(
      "A Car HAS-A Engine rather than IS-A Engine. This suggests:",
      [
        "Composition is the appropriate relationship",
        "Inheritance from Engine",
        "Multiple inheritance of Engine",
        "Making Car an interface",
      ],
      0,
      "HAS-A relationships model ownership/containment; the car delegates to an engine rather than being a type of engine."
    ),
    q(
      "The 'favor composition over inheritance' guideline addresses:",
      [
        "Rigid hierarchies that are hard to change and test in isolation",
        "Lack of access modifiers",
        "Inability to use polymorphism",
        "Excessive use of dependency injection frameworks",
      ],
      0,
      "Inheritance fixes structure at compile time; composition lets you swap strategies, decorators, and collaborators at runtime or construction time."
    ),
    q(
      "Delegation in composition means:",
      [
        "The outer object forwards work to an internal component",
        "The outer object copies all fields from the parent class",
        "The outer object cannot expose any public methods",
        "The inner object inherits from the outer object",
      ],
      0,
      "Delegation implements behavior by calling methods on composed objects—classic example: Stack wrapping a List."
    ),
    q(
      "When might inheritance still be the right choice?",
      [
        "When framework hooks require extending a base class (e.g., Servlet, Activity)",
        "When objects are unrelated",
        "When you need runtime swapping of all behavior",
        "When Liskov substitution is known to fail",
      ],
      0,
      "Some frameworks mandate extension points; use inheritance when IS-A is real and the framework pattern requires it—but don't default to it."
    ),
  ],

  "oop::method overloading vs overriding": [
    q(
      "Method overloading occurs when:",
      [
        "Multiple methods share the same name but differ in parameter list within one class",
        "A subclass replaces a parent method with the same signature",
        "A method is marked static in the subclass",
        "Two unrelated classes define the same method name",
      ],
      0,
      "Overloading is resolved at compile time based on argument types/count."
    ),
    q(
      "Method overriding requires:",
      [
        "Same name, parameter list, and compatible return type in a subclass",
        "Different parameter list from the parent method",
        "private access in the subclass",
        "A static method in the parent",
      ],
      0,
      "Override replaces instance behavior; visibility cannot be more restrictive in most languages."
    ),
    q(
      "Which is resolved at compile time?",
      [
        "Overloading",
        "Overriding with virtual dispatch",
        "Interface default method calls through a subtype reference",
        "Dynamic proxy invocation",
      ],
      0,
      "The compiler picks the best overload; overriding involves runtime vtable lookup."
    ),
    q(
      "Can you overload based on return type alone in Java?",
      [
        "No—signature is name plus parameter types; return type alone is insufficient",
        "Yes—return type is the only discriminator",
        "Yes—but only for static methods",
        "No—overloading is not allowed in Java",
      ],
      0,
      "Two methods with identical parameter lists but different return types cause a compile error—ambiguous call sites."
    ),
    q(
      "The @Override annotation helps by:",
      [
        "Causing a compile error if the parent does not declare a matching method",
        "Forcing runtime polymorphism off",
        "Making the method static",
        "Allowing different parameter lists from the parent",
      ],
      0,
      "It catches typos or signature mismatches when you intended to override but accidentally overloaded or defined a new method."
    ),
  ],

  "oop::solid principles (srp, ocp, lsp, isp, dip)": [
    q(
      "Single Responsibility Principle (SRP) states:",
      [
        "A class should have only one reason to change",
        "A class must have exactly one method",
        "A module must never use interfaces",
        "Each class must be a singleton",
      ],
      0,
      "SRP is about cohesion: one axis of change per class (e.g., separate reporting from business logic)."
    ),
    q(
      "Open/Closed Principle (OCP) encourages:",
      [
        "Open for extension, closed for modification",
        "Open for modification, closed for extension",
        "Never adding new classes",
        "Making all methods public",
      ],
      0,
      "Add behavior via new types (strategies, plugins) rather than editing existing, tested code."
    ),
    q(
      "Liskov Substitution Principle (LSP) is violated when:",
      [
        "A subclass breaks expectations of the base type (e.g., strengthens preconditions)",
        "A subclass adds new methods",
        "A class implements an interface",
        "Two classes share a method name",
      ],
      0,
      "Clients of the base type must not need to know they have a subclass—behavioral contracts must remain valid."
    ),
    q(
      "Interface Segregation Principle (ISP) means:",
      [
        "Clients should not depend on methods they do not use—prefer small, focused interfaces",
        "All classes must implement every interface",
        "One giant interface per application",
        "Interfaces cannot have default methods",
      ],
      0,
      "Fat interfaces force implementers to stub unrelated methods; split into Role-specific interfaces."
    ),
    q(
      "Dependency Inversion Principle (DIP) advocates:",
      [
        "High-level modules depend on abstractions, not low-level concretions",
        "Low-level modules depend on high-level UI code",
        "Avoiding dependency injection entirely",
        "Using only concrete classes in constructors",
      ],
      0,
      "Both sides depend on interfaces; details (DB, email) are injected, enabling test doubles and swapping implementations."
    ),
  ],

  "dbms::normalization — 1nf, 2nf, 3nf, bcnf": [
    q(
      "First Normal Form (1NF) requires:",
      [
        "Atomic (indivisible) column values and no repeating groups",
        "No transitive dependencies",
        "Every determinant is a candidate key",
        "No partial dependencies on composite keys",
      ],
      0,
      "1NF eliminates arrays in cells and repeating column groups—each field holds a single value."
    ),
    q(
      "Second Normal Form (2NF) eliminates:",
      [
        "Partial dependencies of non-key attributes on part of a composite primary key",
        "All foreign keys",
        "Multi-valued dependencies only",
        "Redundant indexes",
      ],
      0,
      "2NF applies when there is a composite key—every non-key attribute must depend on the whole key, not just a portion."
    ),
    q(
      "Third Normal Form (3NF) eliminates:",
      [
        "Transitive dependencies: non-key attributes depending on other non-key attributes",
        "All joins between tables",
        "Primary keys",
        "Nullable columns",
      ],
      0,
      "If A → B and B → C where B is not a key, C is transitively dependent on A—decompose to remove redundancy."
    ),
    q(
      "BCNF is stricter than 3NF because:",
      [
        "Every functional determinant must be a superkey",
        "It allows repeating groups",
        "It removes all denormalization",
        "It requires exactly two tables",
      ],
      0,
      "BCNF handles cases where a non-key attribute determines part of a key—3NF might miss some anomalies."
    ),
    q(
      "A motivation for normalization is:",
      [
        "Reduce update/insert/delete anomalies by eliminating redundant data",
        "Maximize disk usage",
        "Eliminate the need for indexes",
        "Force all data into one wide table",
      ],
      0,
      "Redundancy causes inconsistent updates; normalization splits data so each fact is stored once."
    ),
  ],

  "dbms::sql joins — inner, left, right, full": [
    q(
      "INNER JOIN returns rows when:",
      [
        "There is a matching row in both tables based on the join condition",
        "The left table has a row regardless of the right",
        "All rows from both tables are always included",
        "Only unmatched rows are returned",
      ],
      0,
      "INNER JOIN keeps intersections—non-matching rows from either side are dropped."
    ),
    q(
      "LEFT (OUTER) JOIN includes:",
      [
        "All rows from the left table and matched rows from the right (NULLs if no match)",
        "Only rows that exist in the right table",
        "The Cartesian product of both tables",
        "Only rows with no matches",
      ],
      0,
      "Unmatched left rows appear with NULL columns from the right—useful for 'all X, whether or not they have Y'."
    ),
    q(
      "FULL OUTER JOIN differs from LEFT JOIN by:",
      [
        "Also preserving unmatched rows from the right table",
        "Excluding NULLs entirely",
        "Being identical to INNER JOIN",
        "Requiring an equi-join only on primary keys",
      ],
      0,
      "FULL OUTER JOIN returns all rows from both sides, matching where possible and padding with NULLs elsewhere."
    ),
    q(
      "A RIGHT OUTER JOIN is equivalent to:",
      [
        "Swapping tables and performing a LEFT JOIN",
        "An INNER JOIN with DISTINCT",
        "A CROSS JOIN with a WHERE clause",
        "A self-join on the same alias",
      ],
      0,
      "RIGHT JOIN is less common syntactically; reversing table order and using LEFT JOIN yields the same result."
    ),
    q(
      "Joining without an ON/WHERE correlation condition on related keys typically produces:",
      [
        "A Cartesian product (cross join)—often unintended and expensive",
        "An empty result set",
        "Only primary key matches",
        "Automatically deduplicated rows",
      ],
      0,
      "Missing join predicates combine every left row with every right row—O(n×m) explosion."
    ),
  ],

  "dbms::indexing — b-tree, hash, composite indexes": [
    q(
      "B-tree indexes are well-suited for:",
      [
        "Range queries and ordered scans (>, <, BETWEEN, ORDER BY)",
        "Only equality on low-cardinality boolean columns",
        "Full table scans",
        "Storing duplicate rows",
      ],
      0,
      "B-trees keep keys sorted, supporting range lookups and prefix matching on composite indexes."
    ),
    q(
      "Hash indexes excel at:",
      [
        "Point lookups with equality (=) on exact keys",
        "Range queries on timestamps",
        "Sorting entire tables",
        "LIKE 'prefix%' pattern scans",
      ],
      0,
      "Hash indexes map keys to buckets—fast O(1) equality, but no ordering for ranges."
    ),
    q(
      "A composite index on (last_name, first_name) can efficiently support:",
      [
        "WHERE last_name = 'Smith' AND first_name = 'Ann'",
        "WHERE first_name = 'Ann' alone (leading column rule)",
        "Any query regardless of column order in the predicate",
        "Only INSERT operations",
      ],
      0,
      "Composite indexes are left-prefix useful—queries must filter on leading columns for the index to be used effectively."
    ),
    q(
      "A downside of too many indexes is:",
      [
        "Slower writes (INSERT/UPDATE/DELETE) due to index maintenance",
        "Faster writes always",
        "Guaranteed deadlock elimination",
        "Automatic normalization",
      ],
      0,
      "Each index must be updated on write—balance read acceleration against write overhead and storage."
    ),
    q(
      "When might the query optimizer ignore an index?",
      [
        "When a large fraction of rows would be returned (full scan may be cheaper)",
        "When the column is indexed",
        "When statistics are up to date",
        "When the query uses a primary key",
      ],
      0,
      "Selectivity matters—if an index would touch most rows, sequential scan can outperform random I/O."
    ),
  ],

  "dbms::acid properties and isolation levels": [
    q(
      "In ACID, 'Atomicity' means:",
      [
        "A transaction's operations all succeed or all are rolled back",
        "Transactions run in parallel without locking",
        "Data is always denormalized",
        "Queries are cached forever",
      ],
      0,
      "Atomicity treats the transaction as one unit—partial failure triggers rollback to the prior consistent state."
    ),
    q(
      "'Isolation' in ACID ensures:",
      [
        "Concurrent transactions do not interfere in ways that violate defined isolation guarantees",
        "All transactions commit instantly",
        "No locks are ever taken",
        "Data is replicated across regions automatically",
      ],
      0,
      "Isolation levels trade consistency for concurrency—controlling phenomena like dirty reads and phantom reads."
    ),
    q(
      "READ UNCOMMITTED allows:",
      [
        "Dirty reads—seeing uncommitted changes from other transactions",
        "No concurrency anomalies whatsoever",
        "Serializable execution only",
        "Automatic deadlock prevention",
      ],
      0,
      "It is the weakest level—transactions may read data that gets rolled back."
    ),
    q(
      "SERIALIZABLE isolation aims to:",
      [
        "Make concurrent execution equivalent to some serial order",
        "Allow dirty and non-repeatable reads",
        "Disable all indexes",
        "Commit without logging",
      ],
      0,
      "Serializable is the strongest ANSI level—phantom reads are prevented, often via range locks or SSI."
    ),
    q(
      "A 'phantom read' occurs when:",
      [
        "Another transaction inserts rows that match your repeated query predicate",
        "You read uncommitted data",
        "The database crashes mid-transaction",
        "A primary key is duplicated",
      ],
      0,
      "Within one transaction, running the same query twice returns different row sets due to concurrent inserts/deletes."
    ),
  ],

  "dbms::transactions — commit, rollback, deadlocks": [
    q(
      "COMMIT in a transaction:",
      [
        "Makes all changes permanent and releases locks held by the transaction",
        "Undoes all changes since BEGIN",
        "Starts a new savepoint only",
        "Disables isolation",
      ],
      0,
      "Commit persists the transaction's writes to the durable log and ends the transaction boundary."
    ),
    q(
      "ROLLBACK:",
      [
        "Reverts the transaction to the state before BEGIN (or to a savepoint)",
        "Makes changes visible to other sessions immediately",
        "Creates a new index",
        "Forces SERIALIZABLE mode",
      ],
      0,
      "Rollback uses the undo log to restore prior values and signals failure of the logical unit of work."
    ),
    q(
      "A deadlock typically arises when:",
      [
        "Two transactions hold locks the other needs, in circular wait",
        "A single SELECT runs too slowly",
        "An index is missing",
        "A transaction commits too quickly",
      ],
      0,
      "Classic cycle: T1 locks A waits for B, T2 locks B waits for A—DBMS detects and aborts one victim."
    ),
    q(
      "How do most databases handle detected deadlocks?",
      [
        "Abort (rollback) one transaction—the 'victim'—so the other can proceed",
        "Wait forever",
        "Commit both transactions",
        "Shut down the server",
      ],
      0,
      "Victim selection minimizes cost (e.g., least work done); the aborted client can retry."
    ),
    q(
      "A SAVEPOINT allows:",
      [
        "Partial rollback within a transaction without aborting the whole transaction",
        "Permanent commit of half the statements",
        "Bypassing ACID entirely",
        "Cross-database two-phase commit only",
      ],
      0,
      "Savepoints mark intermediate states—ROLLBACK TO SAVEPOINT undoes work after that point while keeping earlier changes."
    ),
  ],

  "dbms::primary, foreign, and composite keys": [
    q(
      "A PRIMARY KEY constraint ensures:",
      [
        "Uniqueness and NOT NULL for the identifying column(s)",
        "Only referential integrity to another table",
        "Automatic indexing is never created",
        "Duplicate values are allowed",
      ],
      0,
      "Primary keys uniquely identify rows; most RDBMSs cluster or index them automatically."
    ),
    q(
      "A FOREIGN KEY enforces:",
      [
        "Referential integrity—child values must match parent keys or be NULL (if allowed)",
        "Uniqueness in the child table only",
        "Automatic denormalization",
        "Encryption at rest",
      ],
      0,
      "FKs prevent orphan rows—deletes/updates on the parent may CASCADE, RESTRICT, or SET NULL per policy."
    ),
    q(
      "A COMPOSITE PRIMARY KEY:",
      [
        "Uses multiple columns together to uniquely identify a row",
        "Must be a single auto-increment integer only",
        "Cannot be referenced by foreign keys",
        "Always violates 1NF",
      ],
      0,
      "Junction tables often use (order_id, product_id) as a composite key for the many-to-many link."
    ),
    q(
      "Can a table have multiple foreign keys?",
      [
        "Yes—referencing different parent tables or the same table (self-reference)",
        "No—only one FK per table",
        "Only if there is no primary key",
        "Only in NoSQL databases",
      ],
      0,
      "Tables commonly reference several parents—e.g., employee references department and manager."
    ),
    q(
      "ON DELETE CASCADE means:",
      [
        "Deleting a parent row automatically deletes dependent child rows",
        "Child deletes block parent deletes",
        "Parent keys are set to NULL in children",
        "Deletes are rolled back always",
      ],
      0,
      "Cascade propagates deletes—convenient but dangerous without understanding dependency graphs."
    ),
  ],

  "dbms::group by, having, and aggregate functions": [
    q(
      "GROUP BY is used to:",
      [
        "Collapse rows sharing grouping column values and compute aggregates per group",
        "Filter individual rows before grouping (like WHERE on aggregates)",
        "Sort results without aggregation",
        "Join two tables on primary keys only",
      ],
      0,
      "GROUP BY partitions rows; SELECT may include grouping columns and aggregate functions (COUNT, SUM, AVG)."
    ),
    q(
      "HAVING differs from WHERE because:",
      [
        "HAVING filters groups after aggregation; WHERE filters rows before grouping",
        "HAVING runs before FROM",
        "WHERE can reference aggregate functions freely",
        "They are interchangeable",
      ],
      0,
      "Use WHERE for row-level predicates; HAVING for conditions on COUNT(*) > 5, etc."
    ),
    q(
      "Which query is valid standard SQL?",
      [
        "SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING COUNT(*) > 10",
        "SELECT dept, COUNT(*) FROM emp HAVING COUNT(*) > 10",
        "SELECT dept, salary FROM emp GROUP BY dept",
        "SELECT COUNT(*) FROM emp GROUP BY dept WHERE COUNT(*) > 10",
      ],
      0,
      "Non-aggregated SELECT columns must appear in GROUP BY; aggregate filters belong in HAVING."
    ),
    q(
      "COUNT(*) vs COUNT(column) differs because:",
      [
        "COUNT(column) ignores NULLs; COUNT(*) counts all rows in the group",
        "They are always identical",
        "COUNT(*) ignores NULLs only",
        "COUNT(column) counts NULLs twice",
      ],
      0,
      "COUNT(col) tallies non-NULL values; COUNT(*) includes rows even if columns are NULL."
    ),
    q(
      "AVG(salary) with NULL salaries:",
      [
        "NULLs are excluded from the average calculation",
        "NULLs are treated as zero",
        "The query fails",
        "NULLs double the average",
      ],
      0,
      "Aggregate functions except COUNT(*) ignore NULL inputs—AVG sums non-null values divided by their count."
    ),
  ],

  "dbms::subqueries vs joins — when to use each": [
    q(
      "A correlated subquery:",
      [
        "References columns from the outer query and executes per outer row",
        "Runs once and returns a constant",
        "Cannot appear in WHERE",
        "Is always faster than a join",
      ],
      0,
      "Correlated subqueries depend on outer context—optimizer may rewrite as joins or apply nested loops."
    ),
    q(
      "EXISTS is often preferred over IN for subqueries when:",
      [
        "Checking presence without needing returned values—can short-circuit on first match",
        "You need all columns from the subquery",
        "The subquery returns millions of rows to materialize",
        "You want a Cartesian product",
      ],
      0,
      "EXISTS returns boolean; semantically handles NULLs in anti-join patterns better than IN in some cases."
    ),
    q(
      "Joins are generally preferred over subqueries when:",
      [
        "You need columns from multiple tables in the result set efficiently",
        "You only need a scalar aggregate unrelated to outer rows",
        "You want to avoid the optimizer entirely",
        "The subquery is uncorrelated and tiny",
      ],
      0,
      "Modern optimizers often flatten subqueries to joins—but explicit joins clarify intent when combining many tables."
    ),
    q(
      "A subquery in FROM (derived table) is useful for:",
      [
        "Staging intermediate aggregations before further filtering/joining",
        "Replacing all indexes",
        "Enforcing foreign keys",
        "Disabling transactions",
      ],
      0,
      "Inline views let you aggregate first, then join—readable multi-step logic in one statement."
    ),
    q(
      "Anti-join pattern 'rows in A not in B' can be written as:",
      [
        "LEFT JOIN B ON ... WHERE B.key IS NULL, or NOT EXISTS subquery",
        "INNER JOIN only",
        "CROSS JOIN",
        "UNION ALL without conditions",
      ],
      0,
      "LEFT JOIN null-check and NOT EXISTS are idiomatic; NOT IN fails with NULLs in B's column."
    ),
  ],

  "ds::big-o of array, hash map, heap, tree operations": [
    q(
      "Average-case lookup in a hash map is:",
      [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
      ],
      0,
      "With a good hash function and load factor, buckets give constant expected time; worst case O(n) with collisions."
    ),
    q(
      "Insert/delete at the end of a dynamic array (amortized) is:",
      [
        "O(1) amortized",
        "O(log n)",
        "O(n) always",
        "O(1) worst case always",
      ],
      0,
      "Appending is usually O(1); occasional resize copies elements—amortized O(1). Insert at front is O(n)."
    ),
    q(
      "Search in a balanced binary search tree is:",
      [
        "O(log n)",
        "O(1)",
        "O(n)",
        "O(n²)",
      ],
      0,
      "BST height is logarithmic when balanced (AVL/red-black); each step halves the search space."
    ),
    q(
      "Extract-min from a binary min-heap is:",
      [
        "O(log n)",
        "O(1)",
        "O(n)",
        "O(n log n)",
      ],
      0,
      "Min is at root O(1) to read; extract requires swap with last leaf and sift-down—O(log n)."
    ),
    q(
      "Insert into an unordered array (at end) vs sorted array:",
      [
        "Unordered end insert O(1); sorted insert O(n) to shift elements",
        "Both O(log n)",
        "Unordered O(n); sorted O(1)",
        "Both O(1)",
      ],
      0,
      "Maintaining sorted order on insert requires shifting—tradeoff between fast append and fast binary search."
    ),
  ],

  "ds::hashing — collision resolution, load factor": [
    q(
      "Load factor in a hash table is:",
      [
        "occupied slots / total buckets—higher means more collisions",
        "The hash code bit length",
        "Number of hash functions used",
        "CPU cache line size",
      ],
      0,
      "As load factor grows, chains lengthen or probing clusters form—resize/rehash when threshold (e.g., 0.75) is hit."
    ),
    q(
      "Chaining collision resolution:",
      [
        "Stores colliding keys in linked lists (or trees) at each bucket",
        "Always uses linear probing only",
        "Deletes the second inserted key",
        "Requires sorted buckets",
      ],
      0,
      "Separate chaining decouples bucket count from stored elements—Java HashMap uses chaining (treeify long chains)."
    ),
    q(
      "Linear probing disadvantage:",
      [
        "Primary clustering—consecutive probes form long runs",
        "Cannot find any keys",
        "Uses more memory than chaining always",
        "Requires keys to be sorted",
      ],
      0,
      "Clusters grow as tables fill; quadratic/double hashing spread probes to reduce clustering."
    ),
    q(
      "A good hash function should:",
      [
        "Distribute keys uniformly across buckets to minimize collisions",
        "Return constant value for all keys",
        "Depend on bucket count in a way that changes after resize only",
        "Sort keys alphabetically",
      ],
      0,
      "Uniform distribution keeps chains short; cryptographic hashing is overkill—speed and spread matter."
    ),
    q(
      "Rehashing is triggered when:",
      [
        "Load exceeds threshold or table size must grow—recompute bucket indices",
        "Every lookup occurs",
        "A collision happens once",
        "Keys are deleted",
      ],
      0,
      "Resize to larger array and reinsert elements with mod/new capacity—amortized cost of inserts."
    ),
  ],

  "ds::tree properties — bst invariants, heap ordering": [
    q(
      "BST invariant:",
      [
        "Left subtree keys < node key < right subtree keys (for strict BST)",
        "Every node has exactly two children",
        "Root is always the median",
        "All leaves are at the same depth",
      ],
      0,
      "In-order traversal of a BST yields sorted order—search/insert average O(log n) if balanced."
    ),
    q(
      "Min-heap property:",
      [
        "Parent key ≤ children keys (for each node)",
        "Left child ≥ parent always",
        "In-order traversal is sorted",
        "All levels are completely filled always",
      ],
      0,
      "Heaps are complete binary trees with ordering suited for priority queues—not sorted overall."
    ),
    q(
      "An unbalanced BST degenerates to:",
      [
        "A linked list—O(n) operations",
        "A heap",
        "O(log n) guaranteed height",
        "A hash table",
      ],
      0,
      "Sorted insert order into a plain BST creates a chain—use balanced variants (red-black, AVL)."
    ),
    q(
      "Heap insert operation:",
      [
        "Add at next leaf position and sift up (bubble up)",
        "Insert at root and sift down",
        "Sort entire tree",
        "Rotate like AVL always",
      ],
      0,
      "Complete tree shape preserved by filling left-to-right; sift-up restores heap property in O(log n)."
    ),
    q(
      "BST vs heap for finding minimum:",
      [
        "BST: go left until null O(log n) balanced; min-heap: root O(1)",
        "Both require O(n)",
        "BST minimum is always root",
        "Heap requires in-order traversal for min",
      ],
      0,
      "Heap optimizes extract-min; BST supports ordered range queries heaps do not provide efficiently."
    ),
  ],

  "ds::array vs linked list — tradeoffs": [
    q(
      "Arrays excel at:",
      [
        "Random access by index in O(1)",
        "O(1) insert at front",
        "No memory overhead per element",
        "Dynamic growth without copying",
      ],
      0,
      "Contiguous memory enables cache-friendly index access; front insert is O(n) due to shifting."
    ),
    q(
      "Linked lists excel at:",
      [
        "O(1) insert/delete at a known node position (with pointer)",
        "Binary search in O(log n)",
        "Cache locality better than arrays",
        "Less memory per element than arrays",
      ],
      0,
      "Lists avoid shifting on insert/delete but lack O(1) random access—must traverse from head/tail."
    ),
    q(
      "Memory overhead of linked lists includes:",
      [
        "Pointer(s) per node plus potential allocator fragmentation",
        "Zero overhead",
        "Only the data payload",
        "Hash table buckets only",
      ],
      0,
      "Each node stores next/prev pointers—higher per-element cost and worse cache locality than arrays."
    ),
    q(
      "For iterating sequentially, arrays often outperform linked lists because:",
      [
        "Contiguous layout improves CPU cache utilization",
        "Linked lists have no pointer chasing",
        "Arrays require sorting first",
        "Linked lists are always smaller",
      ],
      0,
      "Cache misses dominate linked list traversal; arrays benefit from prefetching sequential memory."
    ),
    q(
      "Dynamic arrays (e.g., ArrayList) handle growth by:",
      [
        "Allocating larger backing array and copying elements—amortized O(1) append",
        "Linking new nodes only",
        "Halving size on every insert",
        "Using a heap structure internally",
      ],
      0,
      "Geometric growth (double capacity) keeps append amortized constant despite occasional O(n) copies."
    ),
  ],

  "ds::stack vs queue — use cases": [
    q(
      "A stack follows:",
      [
        "LIFO—last in, first out",
        "FIFO—first in, first out",
        "Priority ordering only",
        "Random access ordering",
      ],
      0,
      "Push/pop from one end—used for call stacks, undo, DFS, parenthesis matching."
    ),
    q(
      "A queue follows:",
      [
        "FIFO—first in, first out",
        "LIFO",
        "Sorted order always",
        "Largest element first only",
      ],
      0,
      "Enqueue at rear, dequeue at front—BFS, task scheduling, buffering."
    ),
    q(
      "Call stack in recursion is an example of:",
      [
        "Stack—each call pushed, returns pop",
        "Queue",
        "Priority queue only",
        "Hash map",
      ],
      0,
      "Activation records are pushed on call and popped on return—LIFO matches nested call structure."
    ),
    q(
      "BFS level-order traversal typically uses:",
      [
        "Queue",
        "Stack only",
        "Binary heap only",
        "Union-find",
      ],
      0,
      "FIFO processes nodes in discovery order—level by level wavefront."
    ),
    q(
      "Deque (double-ended queue) allows:",
      [
        "Insert/remove at both ends—useful for sliding window monotonic queue",
        "Only push/pop one end",
        "Only priority extraction",
        "No iteration",
      ],
      0,
      "Deque generalizes stack/queue—monotonic deque optimizes sliding window min/max problems."
    ),
  ],

  "ds::bfs vs dfs — when to use each": [
    q(
      "BFS on an unweighted graph finds:",
      [
        "Shortest path in number of edges from source",
        "Always the lexicographically smallest path",
        "Only paths through leaves",
        "Minimum spanning tree",
      ],
      0,
      "BFS explores layer by layer—first time you reach a node is via fewest edges in unweighted graphs."
    ),
    q(
      "DFS is often preferred for:",
      [
        "Detecting cycles, topological sort, exhaustive path exploration with backtracking",
        "Shortest path in unweighted graphs always",
        "Level-order printing only",
        "Dijkstra's algorithm",
      ],
      0,
      "DFS goes deep first—natural for recursion, connectivity, and maze exploration with stack."
    ),
    q(
      "BFS space complexity on a tree with branching factor b and depth d can be:",
      [
        "O(b^d) worst case for frontier queue at last level",
        "O(1) always",
        "O(log n) only",
        "O(d) always regardless of branching",
      ],
      0,
      "The queue holds an entire frontier—wide shallow trees can make BFS memory-heavy."
    ),
    q(
      "DFS space (recursive) on a tree is:",
      [
        "O(h) where h is height—call stack depth",
        "O(n) always worse than BFS",
        "O(1) for all graphs",
        "O(b^d) always",
      ],
      0,
      "Deep skinny trees: DFS stack depth h may beat BFS frontier; wide trees favor DFS for space."
    ),
    q(
      "For connected components in an undirected graph:",
      [
        "Both BFS and DFS work—visit all nodes in each component",
        "Only BFS works",
        "Only DFS works",
        "Neither works without Dijkstra",
      ],
      0,
      "Run BFS/DFS from each unvisited node to label components—choice depends on path/space needs."
    ),
  ],

  "ds::sorting algorithms — time/space complexity": [
    q(
      "Merge sort guarantees:",
      [
        "O(n log n) time and O(n) auxiliary space",
        "O(n²) worst case",
        "O(1) space in-place always",
        "O(n) best case only",
      ],
      0,
      "Divide-and-conquer stable sort—predictable performance, extra array for merging."
    ),
    q(
      "Quick sort average vs worst case:",
      [
        "Average O(n log n); worst O(n²) with bad pivots",
        "Always O(n log n) worst case without tuning",
        "Always O(n²)",
        "O(n) average",
      ],
      0,
      "Pivot choice matters—randomized/median-of-three mitigates adversarial inputs; in-place but not stable typically."
    ),
    q(
      "Heap sort provides:",
      [
        "O(n log n) worst-case in-place sorting",
        "O(n) worst case",
        "Stable sort always",
        "O(n²) best case",
      ],
      0,
      "Build heap O(n), n extract-max operations O(log n) each—not stable but guaranteed O(n log n)."
    ),
    q(
      "Counting sort is suitable when:",
      [
        "Keys are integers in a small bounded range k—O(n + k) time",
        "Keys are arbitrary strings with no bound",
        "Memory must be O(1)",
        "Stability is impossible",
      ],
      0,
      "Non-comparison sort—linear when range is modest; not general-purpose for unbounded keys."
    ),
    q(
      "Timsort (used in Python/Java) combines:",
      [
        "Merge sort stability with insertion sort on small runs—adaptive on real data",
        "Bubble sort only",
        "Heap sort only",
        "O(n²) guaranteed always",
      ],
      0,
      "Hybrid exploits partially ordered input—O(n log n) worst case, fast on nearly sorted arrays."
    ),
  ],
};
