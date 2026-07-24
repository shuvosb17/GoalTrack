export type GoProjectTier = "beginner" | "medium" | "advanced" | "capstone";

export interface GoPathProject {
  name: string;
  tier: GoProjectTier;
  deliverables: string[];
}

export interface GoPathTopic {
  name: string;
  subtopics: string[];
}

export interface GoPathModule {
  name: string;
  ongoing?: boolean;
  topics: GoPathTopic[];
  projects?: GoPathProject[];
}

export const GO_BACKEND_PATH_MARKER =
  "Module 0: Developer Environment & Foundations";

/** Bump when Development Go path curriculum shape changes (v5: [PS] topics aligned to instructor course modules). */
export const GO_BACKEND_CURRICULUM_VERSION = 5;

/** Bengali Git & GitHub curriculum (Topic 0.3 subtopics). */
export const GIT_GITHUB_SUBTOPICS = [
  // শুরু
  "00 কিছু কথা",
  "01 গিট কি?",
  "02 গিটহাব কি?",
  // গিট
  "00 গিট সেটআপ",
  "01 গিট কনফিগার",
  "02 গিট রিপোজিটরি সেটআপ",
  "03 স্ট্যাটাস চেক করা",
  "04 স্টেজিং এরিয়াতে নেওয়া",
  "05 ফাইল কমিট করা",
  "06 ফাইল মডিফাই করে আবার কমিট",
  "07 পুনরায় মডিফাই করে কমিট",
  "08 কমিট লগ চেক",
  "09 পূর্বের ভার্শনে যাওয়া",
  "10 ব্রাঞ্চ তৈরি",
  "11 ব্রাঞ্চ এ চেকআউট",
  "12 নতুন ব্রাঞ্চে মডিফিকেশন",
  "13 ব্রাঞ্চ মেইনে মার্জ",
  "14 কমিটের সাথে কমিটের পার্থক্য",
  // গিটহাব
  "00 গিটহাবের সাথে লিঙ্ক",
  "01 গিটহাবে পুশ",
  "02 SSH কী সেটআপ",
  "03 গিটহাব থেকে পুল",
  "04 নিজের প্রোজেক্টে পুল রিকোয়েস্ট",
  "05 গিটহাব থেকে প্রোজেক্ট ক্লোন",
  "06 অন্য প্রোজেক্টে পুল রিকোয়েস্ট",
  // প্রোজেক্টে কন্ট্রিবিউট
  "00 প্রোজেক্ট খোঁজা",
  "01 প্রোজেক্ট ফর্ক",
  "02 কন্ট্রিবিউট",
  "03 এখনো শেষ হয়নি",
  "04 সেলিব্রেট 🎉",
  // এক্সপ্লোর গিট
  "00 গিট রিস্টোর",
  "01 গিট স্ট্যাশ",
  "02 গিট রিসেট",
  "03 গিট রিভার্ট",
  "04 গিট রিবেস",
  "05 গিট চেরিপিক",
] as const;

export const GO_BACKEND_PATH: GoPathModule[] = [
  {
    name: "Module 0: Developer Environment & Foundations",
    topics: [
      {
        name: "Topic 0.1: Computer & OS Basics",
        subtopics: [
          "CPU, RAM, disk, process, thread (conceptual)",
          "Client–server model",
          "Compiled vs interpreted (where Go fits)",
          "Editors vs IDEs (set up VS Code / Cursor)",
        ],
      },
      {
        name: "Topic 0.2: The Command Line (intro — deep Linux is Module 7)",
        subtopics: [
          "Navigation: `pwd`, `ls`, `cd`",
          "File ops: `mkdir`, `touch`, `cp`, `mv`, `rm`",
          "Viewing: `cat`, `less`, `head`, `tail`",
          "Pipes & redirection: `|`, `>`, `>>`, `<`",
          "Environment variables",
          "Searching: `grep`, `find`",
        ],
      },
      {
        name: "Topic 0.3: Git & GitHub",
        subtopics: [...GIT_GITHUB_SUBTOPICS],
      },
      {
        name: "Topic 0.4: How the Web Works (conceptual; deep dive in Module 8)",
        subtopics: [
          "What a server is",
          "IP, ports, DNS (intro)",
          "Request/response cycle",
          "What an API is",
        ],
      },
      {
        name: "Topic 0.PS1: [PS] Welcome To Software Engineering Course",
        subtopics: [
          "[PS] Welcome To Software Engineering Course",
          "[PS] Welcome to SWE Course",
          "[PS] কিভাবে আপনি এই কোর্স করলে সব চাইলে বেশি বেনিফিট পাবেন ?",
          "[PS] এই কোর্স কিভাবে নেয়া হবে ? কিছু প্ল্যান",
          "[PS] Setup Environment: Mind map and Tools",
          "[PS] Understanding the environment",
          "[PS] Connecting the dots",
          "[PS] Installing Node JS in windows",
          "[PS] Installing vs Code: IDE - (Intigrated Development Environment)",
          "[PS] Installing Git and Introduction to GitHub :",
          "[PS] Webserver Introduction: Tools - Mind Maps and Environment",
          "[PS] How to open HTML files?",
        ],
      },
      {
        name: "Topic 0.PS2: [PS] Introduction to webservers",
        subtopics: [
          "[PS] Webserver , Localhosts and Cloud systems for Backend",
          "[PS] How to open one HTML file?",
          "[PS] How to open html using vs code plugin web server ?",
          "[PS] Defination of a web server",
          "[PS] How Domain names and IP address works Together?",
          "[PS] What is LOCALHOST?",
          "[PS] Introduction to web server : What is it and How Does it works ?",
          "[PS] Making a simple node js web server",
          "[PS] How does PORT + Web server + IP address works together?",
          "[PS] How to serve html page with node js server?",
          "[PS] Introduction to web servers",
          "[PS] Introduction to cloud systems and webservers in cloud system",
          "[PS] ক্লাউড ল্যাব এ NODE JS ডেপলয় করা",
          "[PS] ক্লাউড ল্যাব এ NODE JS ডেপলয় করা : ডকুমেন্ট",
          "[PS] এই মডিউল শেষ করার পরে এই টপিক গুলোর উত্তর দিতে পারতে হবে!",
        ],
      },
      {
        name: "Topic 0.PS3: [PS] Introduction To Backend Systems",
        subtopics: [
          "[PS] Node js as Backend system",
          "[PS] আমরা এই কোর্স এ ব্যাকএন্ড এর কি কই টুলস আর ফ্রেমওয়ার্ক শিখবো ? কিভাবে সেগুলো প্র্যাকটিস করবো",
          "[PS] Why do we need tools like Node js for backend",
          "[PS] Purpose of core modules in backend system",
          "[PS] Type of servers and port mapping for them",
          "[PS] Conclusion",
        ],
      },
    ],
  },
  {
    name: "Module 1: Go Language Fundamentals",
    topics: [
      {
        name: "Topic 1.1: Getting Started",
        subtopics: [
          "Install Go, `go version`",
          "Modules: `go mod init`, `go.mod`, `go.sum`",
          "First program: `package main`, `func main()`",
          "Tooling: `go run/build/fmt/vet/test`",
        ],
      },
      {
        name: "Topic 1.2: Basic Syntax & Types",
        subtopics: [
          "Variables: `var`, `:=`, zero values",
          "Constants and `iota`",
          "Basic types: `int`, `float64`, `bool`, `string`, `byte`, `rune`",
          "Type conversion",
          "Operators",
          "Comments",
        ],
      },
      {
        name: "Topic 1.3: Control Flow",
        subtopics: [
          "`if`/`else`, `if` with init statement",
          "`for` (all forms)",
          "`switch` (expression, type, fallthrough)",
          "`break`, `continue`, labels",
          "`defer` (execution order)",
        ],
      },
      {
        name: "Topic 1.4: Composite Types",
        subtopics: [
          "Arrays",
          "Slices: `append`, `len`, `cap`, slicing, copy, backing array",
          "Maps: access, comma-ok, delete, iterate",
          "Strings: immutability, runes vs bytes, UTF-8, `strings`, `strconv`",
          "Structs: literals, embedding/composition",
          "Pointers: `&`, `*`, nil pointers",
        ],
      },
      {
        name: "Topic 1.5: Functions",
        subtopics: [
          "Params, returns, multiple returns, named returns",
          "Variadic functions",
          "First-class functions",
          "Closures",
          "Recursion",
        ],
      },
      {
        name: "Topic 1.6: Methods & Interfaces",
        subtopics: [
          "Value vs pointer receivers (and when to use each)",
          "Interfaces, implicit satisfaction",
          "Empty interface (`any`)",
          "Type assertions, type switches",
          "Common interfaces: `Stringer`, `error`, `io.Reader`, `io.Writer`",
          "Interface composition, polymorphism",
        ],
      },
      {
        name: "Topic 1.7: Error Handling",
        subtopics: [
          "The `error` type",
          "`errors.New`, `fmt.Errorf`, `%w` wrapping",
          "`errors.Is`, `errors.As`",
          "Sentinel and custom errors",
          "`panic` / `recover` (and when not to)",
          "Errors-as-values philosophy",
        ],
      },
      {
        name: "Topic 1.8: Packages & Project Structure",
        subtopics: [
          "Creating packages",
          "Exported vs unexported",
          "`import`, aliases",
          "`init()`",
          "Layout: `cmd/`, `internal/`, `pkg/`",
          "Doc comments / `go doc`",
        ],
      },
      {
        name: "Topic 1.9: Generics",
        subtopics: [
          "Type parameters `[T any]`",
          "Constraints (`comparable`, custom)",
          "Generic functions/types",
          "When generics help vs hurt",
        ],
      },
      {
        name: "Topic 1.PS1: [PS] Javascript with Node JS and ExpressJS (skim)",
        subtopics: [
          "[PS] Javascript Inside NODE JS",
          "[PS] Introduction to the Module",
          "[PS] Javascript Basics for NodeJS",
          "[PS] What is callback ? how callback works ?",
          "[PS] Use of let var and Const in JS",
          "[PS] Express JS Setup with Clients like postman and Thunder",
          "[PS] Get api and Query param vs Path/Route Paramerets",
          "[PS] Backend service as Client [Calling backend from other Backend]",
          "[PS] FAST API vs Express JS : How they are almost same?",
          "[PS] Code Links",
        ],
      },
      {
        name: "Topic 1.PS2: [PS] Async JS inside NodeJS (skim)",
        subtopics: [
          "[PS] Async VS Sync code in Node JS",
          "[PS] Introduction to async code in node js - Nature of Javascript",
          "[PS] Async code in Node JS Part 2",
          "[PS] Event Looop and CallBack how they are related ?",
          "[PS] Event Loop Promise and Asyinc await - How They are related?",
          "[PS] Use of async await inside a node js project",
          "[PS] How git add , commit and push pull works together ?",
          "[PS] Working with multiple Files in Node JS || Require vs Import",
          "[PS] Free Related Learning Material : YouTube",
        ],
      },
      {
        name: "Topic 1.PS3: [PS] JS Essentials For API development (skim)",
        subtopics: [
          "[PS] JS Essentials For Backend Development",
          "[PS] Module Introduction",
          "[PS] JS Data Types and Objects",
          "[PS] Javascript Objects In Real Life",
          "[PS] Array and Array Of Objects",
          "[PS] De-Structuring in Array and In Objects",
          "[PS] Array In Real Life",
          "[PS] Some External Learning sources 1",
          "[PS] Javascript Array and Object Text Lesson Part One",
          "[PS] Common Backend Pattern with Array Filters and JSON",
        ],
      },
      {
        name: "Topic 1.PS4: [PS] Process (skim)",
        subtopics: [
          "[PS] Process in NODE JS application",
          "[PS] What is Process? How Do find a node JS Process in windows PC ?",
        ],
      },
      {
        name: "Topic 1.PS5: [PS] Typescript with OOP (skim)",
        subtopics: [
          "[PS] Typescript - Why do we need this",
          "[PS] Why do we need Typescript?",
          "[PS] Running typescript enabled node js || https://github.com/HabibulHH/type-basic",
          "[PS] Typescript in express js applications|| GITHUB [https://github.com/HabibulHH/typescript]",
          "[PS] OOP In Typescript : Hands On",
          "[PS] Introduction to Object Orientation: Why do we need Types?",
          "[PS] Introduction to OOP",
          "[PS] Encapsulation : First Pillar Of OOP",
          "[PS] Encapsulation Recap",
          "[PS] Abstraction - OOP",
          "[PS] What is a Class? Basics of Class",
          "[PS] Inheritance in OPP",
        ],
      },
      {
        name: "Topic 1.PS6: [PS] Interface And Polymorphism (skim)",
        subtopics: [
          "[PS] Polymorphism",
          "[PS] Introduction to Polymorphism",
          "[PS] Example with class",
          "[PS] Real life use case of Interface and Polymorphism",
        ],
      },
    ],
  },
  {
    name: "Module 2: Concurrency in Go",
    topics: [
      {
        name: "Topic 2.1: Goroutines",
        subtopics: [
          "Goroutine vs OS thread",
          "Launching with `go`",
          "The scheduler (conceptual)",
          "Goroutine leaks",
        ],
      },
      {
        name: "Topic 2.2: Channels",
        subtopics: [
          "Send/receive, unbuffered vs buffered",
          "Channel direction",
          "Closing, ranging",
          "`nil` channel behavior",
        ],
      },
      {
        name: "Topic 2.3: Synchronization",
        subtopics: [
          "`select`, `select` with `default`",
          "Timeouts with `time.After`",
          "`sync.WaitGroup`, `Mutex`, `RWMutex`, `Once`",
          "`sync/atomic`",
          "Race conditions + race detector (`-race`)",
        ],
      },
      {
        name: "Topic 2.4: context Package",
        subtopics: [
          "Why context exists",
          "`Background`, `TODO`",
          "`WithCancel`, `WithTimeout`, `WithDeadline`",
          "`WithValue` (and caveats)",
          "Propagation through call chains",
        ],
      },
      {
        name: "Topic 2.5: Concurrency Patterns",
        subtopics: [
          "Worker pool",
          "Fan-out / fan-in",
          "Pipelines",
          "Rate limiting (ticker, token bucket)",
          "Graceful shutdown (context + signals)",
          "`errgroup`",
        ],
      },
    ],
  },
  {
    name: "Module 3: Testing & Quality",
    topics: [
      {
        name: "Topic 3.1: Unit Testing",
        subtopics: [
          "`testing`, `*_test.go`",
          "`t.Error` vs `t.Fatal`",
          "Table-driven tests, subtests (`t.Run`)",
          "Coverage",
        ],
      },
      {
        name: "Topic 3.2: Advanced Testing",
        subtopics: [
          "`TestMain`, setup/teardown",
          "Mocking via interfaces + dependency injection",
          "`httptest`",
          "Integration tests with real DB",
          "Test containers (Postgres)",
          "Benchmarks, fuzzing, golden files",
        ],
      },
      {
        name: "Topic 3.3: TDD",
        subtopics: [
          "Red-green-refactor",
          "Testify (`assert`, `require`, `mock`)",
        ],
      },
    ],
  },
  {
    name: "Module 4: HTTP & REST API Development",
    topics: [
      {
        name: "Topic 4.1: HTTP Fundamentals",
        subtopics: [
          "Methods (GET/POST/PUT/PATCH/DELETE)",
          "Status codes (know common ones cold)",
          "Headers, body, content negotiation",
          "Idempotency & safety",
          "Cookies vs headers",
          "HTTPS/TLS (intro; deep in Module 8)",
        ],
      },
      {
        name: "Topic 4.2: net/http",
        subtopics: [
          "`http.Server`, `ListenAndServe`",
          "Handlers, `HandlerFunc`",
          "`ServeMux` + Go 1.22 routing (`GET /applications/{id}`)",
          "Reading params/body",
          "JSON responses (`encoding/json`)",
          "Server timeouts, graceful shutdown",
        ],
      },
      {
        name: "Topic 4.3: REST API Design",
        subtopics: [
          "REST principles, resources",
          "URL design & versioning",
          "Validation",
          "Consistent error responses",
          "Pagination, filtering, sorting",
          "Status-code selection",
        ],
      },
      {
        name: "Topic 4.4: Middleware",
        subtopics: [
          "Handler wrapping",
          "Logging, recovery, CORS",
          "Request/correlation ID",
          "Chaining",
        ],
      },
      {
        name: "Topic 4.5: Routers/Frameworks",
        subtopics: [
          "`chi` (in depth)",
          "`gin`, `echo` (awareness)",
          "Framework vs stdlib trade-offs",
        ],
      },
      {
        name: "Topic 4.6: Serialization",
        subtopics: [
          "JSON tags, custom marshaling",
          "Optional/unknown fields",
          "Protobuf (awareness)",
        ],
      },
      {
        name: "Topic 4.7: HTTP Clients & Consuming APIs",
        subtopics: [
          "`http.Client` (never use the default client with no timeout)",
          "Building requests: `http.NewRequestWithContext`, methods, query params",
          "Timeouts, context cancellation, connection reuse (keep-alive)",
          "Auth to third-party APIs: API keys, Bearer tokens, headers",
          "Parsing responses: status-code handling, decoding JSON, error bodies",
          "Retries with backoff and jitter; which requests are safe to retry",
          "Handling upstream pagination and rate limits (429 + `Retry-After`)",
        ],
      },
      {
        name: "Topic 4.8: Webhooks",
        subtopics: [
          "What webhooks are (inbound HTTP callbacks vs polling)",
          "Receiving and routing webhook events",
          "Signature verification (HMAC shared secret) and replay protection",
          "Idempotency and deduplication via event IDs",
          "Respond fast (2xx) then process async (hand off to a worker/queue)",
          "Retries and out-of-order delivery from providers",
        ],
      },
      {
        name: "Topic 4.PS1: [PS] API - Development Part One",
        subtopics: [
          "[PS] Fundamentals of API Development",
          "[PS] Status code in API : How to use status code in API?",
          "[PS] Routing system in ExpressJS application",
          "[PS] Anatomy of a POST Request End Point",
          "[PS] Data modeling and Data flow in a Backend Application",
          "[PS] Data validation in a Backend Application",
          "[PS] Assignment: One API Development",
        ],
      },
      {
        name: "Topic 4.PS2: [PS] API Development Part Two",
        subtopics: [
          "[PS] Api development In Details",
          "[PS] Module Recap and New Module Introduction",
          "[PS] Why Do We need router? Implementing Routers",
          "[PS] Introduction to Controller - Why and How to Implement This",
          "[PS] Introduction to middleware.",
          "[PS] Middleware Project one",
          "[PS] Module Recap with rate Limiting middleware",
          "[PS] Audit Logger Project",
          "[PS] Type of Rate limiting Algorithm you can explore using youtube",
          "[PS] Module Codebase Link",
          "[PS] Assignments",
        ],
      },
      {
        name: "Topic 4.PS3: [PS] Data Modeling Part One",
        subtopics: [
          "[PS] Introduction to Data Modeling Part One",
          "[PS] Introduction to Object Oriented Programming",
          "[PS] Object Oriented Coding In Real Life",
          "[PS] JSON Data Modeling",
          "[PS] Introduction to JSON why how and when ?",
          "[PS] Data flow: JSON DATA from frontend to Backend-Understanding The flow",
          "[PS] How to Approach for API design? Keeping Data Modeling in mind ?",
          "[PS] Real life e-commerce Product api design and JSON data modeling",
          "[PS] Accessing and Manipulating JSON data",
          "[PS] Array JSON and Higher Order Functions in Javascript",
        ],
      },
      {
        name: "Topic 4.PS4: [PS] Beyond CRUD: Understanding HTTP PUT and DELETE Methods",
        subtopics: [
          "[PS] Understanding PUT PATCH & DELETE",
          "[PS] PUT operations",
          "[PS] Patch Operations",
          "[PS] .PUT VS PATCH- Understanding the difference",
          "[PS] Soft delete vs hard delete",
          "[PS] How to manage bulk update ?",
          "[PS] ETAG",
          "[PS] What is ETAG?",
          "[PS] Interview Questions",
          "[PS] HTTP PUT, PATCH & DELETE — Interview Questions & Answers",
          "[PS] HTTP PUT, PATCH & DELETE — Interview Questions & Answers (Continued)",
          "[PS] HTTP PUT, PATCH & DELETE — Interview Questions & Answers (Continued)",
        ],
      },
      {
        name: "Topic 4.PS5: [PS] response Formatting & Pagination : Offset and Cursor",
        subtopics: [
          "[PS] Response formatting",
          "[PS] What is . Response Formatting and why it is important?",
          "[PS] Common response formatting",
          "[PS] Pagination: Introduction to paginations and internals",
          "[PS] Pagination Introduction",
          "[PS] What is offset",
          "[PS] Problems of offset based pagination",
          "[PS] Documentations added",
          "[PS] Cursor Pagination",
          "[PS] Intro to cursor based pagination",
          "[PS] Cursor details how it works",
          "[PS] Transition",
          "[PS] Implementation in code: Hands On",
          "[PS] Benchmarking",
          "[PS] Offset vs Cursor: Benchmarking and Testing",
        ],
      },
      {
        name: "Topic 4.PS6: [PS] Api Security: CORS",
        subtopics: [
          "[PS] CORS In Details",
          "[PS] Introduction to CORS",
          "[PS] System Defination of CORS",
          "[PS] Cors Hands on",
          "[PS] CORS Simulation",
        ],
      },
    ],
  },
  {
    name: "Module 5: Databases & Persistence",
    topics: [
      {
        name: "Topic 5.1: Relational Fundamentals",
        subtopics: [
          "Tables, rows, columns, types",
          "Keys, relationships (1-1, 1-many, many-many)",
          "Normalization (1NF–3NF), when to denormalize",
          "ER modeling",
        ],
      },
      {
        name: "Topic 5.2: SQL",
        subtopics: [
          "`SELECT/WHERE/ORDER BY/LIMIT/OFFSET`",
          "`INSERT/UPDATE/DELETE`",
          "JOINs, `GROUP BY`, `HAVING`, aggregates",
          "Subqueries, CTEs",
          "Indexes (types, cost)",
          "`EXPLAIN` / query plans",
        ],
      },
      {
        name: "Topic 5.3: PostgreSQL",
        subtopics: [
          "Running locally + Docker, `psql`",
          "Types (`jsonb`, arrays, `uuid`, timestamptz)",
          "Constraints, sequences",
          "Transactions, ACID, isolation levels",
          "Row locking (`FOR UPDATE`), deadlocks",
          "Connection pooling",
          "Postgres vs MySQL (trade-offs)",
        ],
      },
      {
        name: "Topic 5.4: Go + Database",
        subtopics: [
          "`database/sql`, drivers (`pgx`/`lib/pq`)",
          "`QueryRow/Query/Exec`, scanning, `ErrNoRows`",
          "Prepared statements, SQL injection prevention",
          "Transactions in Go (`defer` rollback)",
          "Pool tuning",
          "`sqlc`, GORM (trade-offs)",
        ],
      },
      {
        name: "Topic 5.5: Migrations",
        subtopics: [
          "Why migrations exist",
          "`golang-migrate` up/down",
          "Versioning + running in CI/deploy",
        ],
      },
      {
        name: "Topic 5.6: Redis & Caching",
        subtopics: [
          "In-memory KV store",
          "Data types (string, hash, list, set, zset)",
          "TTL/expiration",
          "Use cases: cache, sessions, rate limit, queues",
          "Cache-aside, write-through",
          "Invalidation problems",
          "`go-redis`",
          "Redis vs querying Postgres (trade-offs)",
        ],
      },
      {
        name: "Topic 5.PS1: [PS] Introduction to Database",
        subtopics: [
          "[PS] Database and Backend Applicatio Connection",
          "[PS] Introduction to database systems",
          "[PS] Install a Database Engine in windows",
          "[PS] How to connect database ina. Fullstack application ?",
          "[PS] Fullstack Application Part 2",
          "[PS] 🧠 What is SQL?",
          "[PS] GitHub",
        ],
      },
      {
        name: "Topic 5.PS2: [PS] Database Schema and SQL Inroduction",
        subtopics: [
          "[PS] How to Approach for Database Design",
          "[PS] Thinking approach for Database design. start from zero",
          "[PS] Schema Design Basics",
          "[PS] How to alter a live table",
          "[PS] How to loop in SQL and Generate Fake data using loop",
        ],
      },
      {
        name: "Topic 5.PS3: [PS] Database Read Query Fundamentals",
        subtopics: [
          "[PS] SQL Read Query || Basci to Advance",
          "[PS] Introduction to select Query",
          "[PS] Filter data using where query",
          "[PS] Large complex query using select where groupby and order by",
          "[PS] SQL and Programming language similarities",
        ],
      },
      {
        name: "Topic 5.PS4: [PS] Database Fundamentals: Entity Relationship",
        subtopics: [
          "[PS] Relationship among Tables (Entities)",
          "[PS] Module Intro: What is relationship",
          "[PS] Working with DB : OOP Point of view",
          "[PS] Why we need multiple table?",
          "[PS] Problem with current two table design",
          "[PS] Implementing one to many/ many to many relationship",
          "[PS] More on One to Many, One to One Relationship",
          "[PS] Subqueries and Joins || Why do we need them",
          "[PS] Relationship Type One to Many : With real life example",
          "[PS] Many to many : Relationship with Real Life Example",
          "[PS] Database Normalization: Inroduction",
          "[PS] First Normal Form in Action",
          "[PS] Candidate key and Primary key & composite key",
          "[PS] Questions related to 2nf",
          "[PS] Second Normal form in detail Part 1",
          "[PS] Second Normal Form in Details PART 2",
          "[PS] Third form of normalization",
        ],
      },
      {
        name: "Topic 5.PS5: [PS] ERD - Basics",
        subtopics: [
          "[PS] Database Design Thinking",
          "[PS] Database Design Concepts",
          "[PS] E - commerce ERD",
          "[PS] Homework: ERD for Blogpost",
        ],
      },
    ],
  },
  {
    name: "Module 6: Authentication, Authorization & Security",
    topics: [
      {
        name: "Topic 6.1: Authentication",
        subtopics: [
          "bcrypt hashing, salt, cost",
          "Session-based auth (cookies)",
          "JWT structure, signing (HS256/RS256)",
          "Access vs refresh tokens",
          "Expiry & revocation (Redis blocklist)",
          "JWT vs sessions (trade-offs)",
        ],
      },
      {
        name: "Topic 6.2: Authorization",
        subtopics: [
          "AuthN vs AuthZ",
          "RBAC",
          "Ownership checks",
          "Permissions/scopes",
          "Middleware-based authz",
        ],
      },
      {
        name: "Topic 6.3: Web Security Essentials",
        subtopics: [
          "OWASP Top 10 (awareness)",
          "SQL injection, XSS, CSRF",
          "Input validation/sanitization",
          "Rate limiting / brute-force protection",
          "Secrets management",
          "HTTPS/TLS, secure headers, CORS done right",
        ],
      },
      {
        name: "Topic 6.PS1: [PS] Cookies and Session",
        subtopics: [
          "[PS] Session Cookies with HTTP",
          "[PS] Stateless HTTP nature and introduction to Cookie",
          "[PS] Understanding Cookies: How to make and Save them",
          "[PS] Simple login and protected route using Cookie",
          "[PS] Implementing Session with Cookies : Custom Session Storage",
          "[PS] Using third party library for Session storage and Cookie",
          "[PS] Session and Cookie Recap",
          "[PS] Session VS Cookie",
          "[PS] Problem with cookie based auth system",
          "[PS] Cookie Use Cases",
        ],
      },
      {
        name: "Topic 6.PS2: [PS] JWT",
        subtopics: [
          "[PS] JWT - For Authentication",
          "[PS] Introduction to JWT",
          "[PS] Idea of hashing",
          "[PS] Hashing username and Password",
          "[PS] JWT - The better approach for authenticate client",
          "[PS] JWT - Hands on",
          "[PS] 🧪 Assignment: Build a Personal To-Do Manager with Authentication (No Database)",
          "[PS] Assignment: Build Personal To-Do Manager with JWT in Go (no database — warm-up before Secure jobtrackr)",
        ],
      },
      {
        name: "Topic 6.PS3: [PS] Authentication & Authorization with JWT Indetails",
        subtopics: [
          "[PS] Before Jumping into JWT : Some Basic fundamentals",
          "[PS] Basics",
          "[PS] Idea of data Encoding",
          "[PS] What is base64",
          "[PS] URL আর Base64URL — পার্থক্য কি?",
          "[PS] Idea Of Data Encryption",
          "[PS] Process of making signature",
          "[PS] Password Hashing and Salting",
          "[PS] What is password hashing and salting",
          "[PS] Password Hashing আর Salting",
          "[PS] Interview Experience",
          "[PS] JWT Hands on",
          "[PS] JWT hands on",
          "[PS] JWT in small project",
          "[PS] Production grade JWT setup",
          "[PS] Testing scope",
          "[PS] Role base Access controll in JWT",
          "[PS] Private key public key in JWT",
          "[PS] github link.",
          "[PS] JWT implementaton in a Fullstack Application",
        ],
      },
      {
        name: "Topic 6.PS4: [PS] API Security",
        subtopics: [
          "[PS] SQL Injection",
          "[PS] Introduction",
          "[PS] How SQL injection happens",
          "[PS] Root cause analysis for this",
          "[PS] Hands on simulation for SQL injection",
          "[PS] Conslusion",
          "[PS] Github Links",
          "[PS] Github Links",
          "[PS] SQL Injection In Details",
          "[PS] SQL Injection: From Zero to Production-Grade Security",
          "[PS] Password Field e Ki Match Korte Hobe ?",
          "[PS] Attack Mechanics and How Hackers Break Authentication",
          "[PS] Vulnerable Code Patterns in Production",
          "[PS] Parameterized Queries and Defense in Depth",
          "[PS] Real-World Application and Wider Perspective",
          "[PS] SQL Injection Interview Question Bank for Backend Engineers",
          "[PS] XSS - Cross-Site Scripting (XSS)",
          "[PS] Cross-Site Scripting (XSS) Protection — In Easy Words",
          "[PS] CSP Headers and HttpOnly Cookies — What Are They?",
          "[PS] CSRF Token Implementation & Helmet.js",
        ],
      },
    ],
  },
  {
    name: "Module 7: Linux (Deep)",
    topics: [
      {
        name: "Topic 7.1: Core Linux",
        subtopics: [
          "Filesystem hierarchy",
          "Permissions (`chmod`, `chown`, rwx, octal)",
          "Users, groups, `sudo`",
          "Package manager (`apt`)",
          "Set up WSL or a free-tier Linux VM",
        ],
      },
      {
        name: "Topic 7.2: Processes & Files",
        subtopics: [
          "Processes: `ps`, `top`/`htop`, `kill`, signals (SIGTERM/SIGINT/SIGKILL)",
          "File descriptors (stdin/stdout/stderr, limits, `lsof`)",
          "Redirection deep dive",
        ],
      },
      {
        name: "Topic 7.3: Services & Scheduling",
        subtopics: [
          "systemd / systemctl (writing a unit file to run your Go service)",
          "journalctl (reading service logs)",
          "cron (scheduled jobs)",
        ],
      },
      {
        name: "Topic 7.4: Editors & Multiplexers",
        subtopics: [
          "vim basics (modes, edit, save/quit, search/replace)",
          "tmux (sessions, windows, panes — essential for SSH work)",
        ],
      },
      {
        name: "Topic 7.5: Networking & Remote Access",
        subtopics: [
          "ssh + ssh-agent + key management",
          "`scp`, `rsync`",
          "curl mastery (methods, headers, data, auth, following redirects, timing)",
          "`jq` for parsing/filtering JSON responses on the command line",
          "`wget`, `netstat`/`ss`, `ping`",
        ],
      },
      {
        name: "Topic 7.6: Web Server / Proxy",
        subtopics: [
          "nginx config (server blocks, reverse proxy to your Go app, TLS, static files)",
        ],
      },
      {
        name: "Topic 7.7: Archiving & Compression",
        subtopics: [
          "tar",
          "gzip",
          "`zip`/`unzip`",
        ],
      },
      {
        name: "Topic 7.8: Shell Scripting",
        subtopics: [
          "Variables, conditionals, loops",
          "Writing deploy/util scripts",
        ],
      },
    ],
  },
  {
    name: "Module 8: Networking",
    topics: [
      {
        name: "Topic 8.1: The Stack",
        subtopics: [
          "OSI/TCP-IP layers (conceptual)",
          "TCP vs UDP (when each is used)",
          "NAT (private vs public IPs, port forwarding)",
        ],
      },
      {
        name: "Topic 8.2: Naming & Security",
        subtopics: [
          "DNS (records, resolution, caching)",
          "TLS handshake (certificates, SNI, what actually happens)",
        ],
      },
      {
        name: "Topic 8.3: HTTP in Depth",
        subtopics: [
          "HTTP/1.1 (connections, methods, headers)",
          "Keep-Alive and connection reuse",
          "HTTP/2 (multiplexing, vs HTTP/1.1)",
          "Status codes & caching headers",
        ],
      },
      {
        name: "Topic 8.4: Delivery & Routing",
        subtopics: [
          "Reverse proxy (concept + nginx)",
          "Load balancers (L4 vs L7, algorithms)",
        ],
      },
      {
        name: "Topic 8.5: Real-time & RPC Transport",
        subtopics: [
          "WebSockets (handshake, use cases)",
          "gRPC transport (HTTP/2 based — connects to Module 15)",
        ],
      },
    ],
  },
  {
    name: "Module 9: Containers & Local Orchestration",
    topics: [
      {
        name: "Topic 9.1: Docker",
        subtopics: [
          "Containers vs VMs",
          "Images vs containers",
          "Dockerfile: `FROM/WORKDIR/COPY/RUN/CMD/ENTRYPOINT/EXPOSE`",
          "Building, tags",
          "Running: ports, volumes, env",
          "Multi-stage builds (static Go binaries)",
          "`.dockerignore`, layers & caching",
          "`docker exec` / shell into containers; logs & debugging",
          "Publish images to a registry (Docker Hub / GHCR / ECR) with `docker push`",
          "Why containerize (trade-offs)",
        ],
      },
      {
        name: "Topic 9.2: Docker Compose",
        subtopics: [
          "`docker-compose.yml`",
          "Multi-service (app + Postgres + Redis)",
          "Networks, volumes, health checks",
          "`depends_on` / startup ordering",
        ],
      },
      {
        name: "Topic 9.PS1: [PS] File Uploader Project: POST api & Upload Handling",
        subtopics: [
          "[PS] Module introduction",
          "[PS] File uploader system introduction",
          "[PS] Github Link",
          "[PS] Implementations",
          "[PS] File uploader system part one",
          "[PS] File uploaded system extensions",
          "[PS] Uploading files to Third party",
          "[PS] Digital ocean object storage",
          "[PS] Post api fiel uploader SLA and rate limiting",
          "[PS] Assignment",
          "[PS] File uploader Topic Details",
          "[PS] What is MIME TYPE",
          "[PS] What is multer",
          "[PS] Multer alternatives in all Frameworks",
          "[PS] How HTTP Handles File Upload (Client → Server)",
          "[PS] Interview Questions",
          "[PS] Interview Questions",
        ],
      },
    ],
  },
  {
    name: "Module 10: Observability & Reliability",
    topics: [
      {
        name: "Topic 10.1: Logging",
        subtopics: [
          "Structured logging (`slog`)",
          "Levels, correlation IDs",
          "What not to log (secrets/PII)",
          "Log storage & routing: console, files, syslog; rotation for long-running services",
          "Log security: PII filtering/obfuscation, safe error-response logging, encryption at rest",
        ],
      },
      {
        name: "Topic 10.2: Metrics & Monitoring",
        subtopics: [
          "Counter, gauge, histogram",
          "Prometheus + `/metrics`",
          "Instrumenting Go",
          "Grafana (awareness)",
          "Four golden signals",
        ],
      },
      {
        name: "Topic 10.3: Tracing & Health",
        subtopics: [
          "Distributed tracing concepts: spans, trace IDs, context propagation",
          "OpenTelemetry SDK in Go: instrument HTTP handlers and outbound calls",
          "Export traces to Jaeger; read a trace to find the latency bottleneck",
          "`/healthz`, `/readyz`",
          "Graceful degradation",
        ],
      },
      {
        name: "Topic 10.4: Background Workers & Queues",
        subtopics: [
          "Why background jobs",
          "In-process workers",
          "Redis-backed queues (`asynq`)",
          "Retries, idempotency, dead-letter",
        ],
      },
      {
        name: "Topic 10.PS1: [PS] Loggers",
        subtopics: [
          "[PS] Designing Implementing and Comparing logger systems",
          "[PS] Introduction to logger system",
          "[PS] System architecrture of a logger system",
          "[PS] Problem of logging with console log",
          "[PS] Introduction to wiston logger",
          "[PS] Pino as a logger system",
          "[PS] Running pino JS",
          "[PS] Winstone vs Pino a comparative study",
        ],
      },
    ],
  },
  {
    name: "Module 11: Debugging & Profiling",
    topics: [
      {
        name: "Topic 11.1: Debugging",
        subtopics: [
          "Delve (Go debugger): breakpoints, stepping, inspecting variables",
          "Stack traces: reading them",
          "Panic analysis: interpreting panic output",
          "Goroutine dumps (`SIGQUIT`, full goroutine stack)",
        ],
      },
      {
        name: "Topic 11.2: Profiling with pprof",
        subtopics: [
          "CPU profile",
          "Heap / memory profile",
          "Goroutine profile",
          "Memory profiling for leaks",
          "Capturing via `net/http/pprof`",
          "Visualizing (`go tool pprof`, flame graphs)",
        ],
      },
      {
        name: "Topic 11.3: Finding Bottlenecks",
        subtopics: [
          "Benchmark + profile workflow",
          "Identifying hot paths",
          "Common Go performance pitfalls (allocations, copying)",
        ],
      },
      {
        name: "Topic 11.4: Load Testing (k6)",
        subtopics: [
          "Latency fundamentals: P50/P95/P99, why averages lie",
          "k6 scripts: virtual users, stages, thresholds",
          "Load vs stress vs soak testing",
          "Finding your service's breaking point, then profiling the bottleneck (ties 11.2 + 11.3 together)",
          "Publishing honest numbers in READMEs (\"sustains X req/s at P95 < Y ms on Z hardware\")",
        ],
      },
      {
        name: "Topic 11.PS1: [PS] Load Testing",
        subtopics: [
          "[PS] API Load Testing with K6",
          "[PS] System Latency Fundamentals of load testing",
          "[PS] System Latency :Ideal Approach in real life secnerio",
          "[PS] How to find P95 P99 of a System",
          "[PS] Using K6 for Load testing",
          "[PS] Using k6 for small project load testing",
          "[PS] Performance testing using postman",
        ],
      },
    ],
  },
  {
    name: "Module 12: Cloud & Deployment (AWS) — Hands-on",
    topics: [
      {
        name: "Topic 12.1: Cloud Computing",
        subtopics: [
          "IaaS / PaaS / SaaS and where AWS fits",
          "AWS accounts, Free Tier, and billing alerts",
          "Regions, availability zones, and latency trade-offs",
          "Shared responsibility model",
          "Cost models: on-demand vs reserved vs spot (awareness)",
          "Cost traps for beginners (idle EC2, public data transfer, NAT Gateway)",
        ],
      },
      {
        name: "Topic 12.2: Networking — VPCs",
        subtopics: [
          "VPC, CIDR blocks, and isolation",
          "Public vs private subnets",
          "Route tables, Internet Gateway, NAT Gateway (when you need it)",
          "Security groups vs network ACLs (conceptual)",
          "Why apps sit in private subnets behind a public load balancer",
          "Building a VPC suitable for a secure app deployment",
          "Diagram: client → ALB → app subnet → RDS subnet",
        ],
      },
      {
        name: "Topic 12.3: IAM — Identity and Access Management",
        subtopics: [
          "Root account hygiene (MFA; never use root for daily work)",
          "IAM users, groups, roles, and policies",
          "Least-privilege policies for deployed apps",
          "Instance / task roles vs long-lived access keys",
          "Cross-service access patterns (ECS → S3, Lambda → RDS)",
          "Documenting who can do what in your project README",
        ],
      },
      {
        name: "Topic 12.4: EC2 — Elastic Compute Cloud",
        subtopics: [
          "AMIs, instance types, key pairs",
          "Launching and connecting via SSH (ties to M7)",
          "Security groups as instance firewalls",
          "User data / bootstrap scripts for Go binaries",
          "Elastic IPs and when not to use them",
          "Scaling concepts (manual → ASG awareness)",
          "Production workflow: build → deploy → health check → rollback",
        ],
      },
      {
        name: "Topic 12.5: RDS — Relational Database Service",
        subtopics: [
          "Managed PostgreSQL on RDS (matches M5)",
          "Instance sizing, storage, and Multi-AZ (awareness)",
          "Automated backups and restore basics",
          "Security: private subnet, security groups, no public DB",
          "Connecting a Go app (`database/sql` / pgx) to RDS",
          "Parameter groups and connection limits (awareness)",
        ],
      },
      {
        name: "Topic 12.6: Monitoring — CloudWatch",
        subtopics: [
          "Metrics, logs, and alarms",
          "Shipping application logs from EC2/ECS",
          "Alerts for CPU, 5xx, and disk/memory (where available)",
          "Dashboards for a healthy production system",
          "Ties to M10 (Prometheus locally vs CloudWatch on AWS)",
        ],
      },
      {
        name: "Topic 12.7: DNS — Route 53",
        subtopics: [
          "Hosted zones and common record types (A, CNAME, ALIAS)",
          "Pointing a domain at ALB or CloudFront",
          "Health checks and simple failover (awareness)",
          "Reliable user access to apps hosted on AWS",
        ],
      },
      {
        name: "Topic 12.8: S3 — Simple Storage Service",
        subtopics: [
          "Buckets, objects, prefixes, and regions",
          "Object permissions and bucket policies",
          "Block Public Access and least-privilege access",
          "Production patterns: app uploads, static assets, backups",
          "Capstone use case: file uploads / report exports",
        ],
      },
      {
        name: "Topic 12.9: CDN — CloudFront",
        subtopics: [
          "Why a CDN (latency, caching, TLS at the edge)",
          "CloudFront in front of S3 and/or ALB",
          "Cache behaviors and invalidation basics",
          "Speeding up global delivery of static assets and APIs (where appropriate)",
        ],
      },
      {
        name: "Topic 12.10: ECS — Elastic Container Service",
        subtopics: [
          "Containers on AWS without deep Kubernetes (ties to M9)",
          "ECR: build, tag, push Go images",
          "Task definitions, services, and desired count",
          "ECS on EC2 vs **Fargate** (choose one primary path; know both)",
          "Application Load Balancer (ALB) in front of ECS services",
          "Health checks, rolling updates, and scaling services",
          "ECS vs EKS (talking level — deep K8s waits for M14 / on the job)",
          "ElastiCache (managed Redis) — awareness for cache/rate-limit in prod",
        ],
      },
      {
        name: "Topic 12.11: Serverless Functions — Lambda",
        subtopics: [
          "When Lambda fits vs always-on ECS (trade-offs)",
          "Deploying a Go or managed-runtime function",
          "API Gateway → Lambda for small production APIs",
          "Triggers, timeouts, cold starts (awareness)",
          "IAM roles for Lambda; CloudWatch logs",
          "Optional for first junior backend role — do after ECS is solid",
        ],
      },
      {
        name: "Topic 12.12: Delivery & TLS Extras",
        subtopics: [
          "Reverse proxy with nginx on EC2 (ties to M7 / M8)",
          "TLS certificates with ACM",
          "HTTPS end-to-end: Route 53 → CloudFront/ALB → service",
          "Comparing nginx-on-EC2 vs ALB+ECS for your apps",
        ],
      },
      {
        name: "Topic 12.13: Infrastructure as Code (awareness)",
        subtopics: [
          "What IaC is and why click-ops does not scale",
          "Terraform basics (resources, state — awareness)",
          "CloudFormation (awareness)",
          "Goal: be able to discuss IaC in interviews; automate later in M13",
        ],
      },
    ],
  },
  {
    name: "Module 13: CI/CD & Automation",
    topics: [
      {
        name: "Topic 13.1: Concepts",
        subtopics: [
          "CI vs CD (delivery vs deployment)",
          "Pipeline stages: build → test → lint → security scan → package → deploy",
        ],
      },
      {
        name: "Topic 13.2: GitHub Actions",
        subtopics: [
          "Workflow YAML, triggers, jobs, steps, runners",
          "Caching deps",
          "`go test/vet`, linters",
          "Build + push Docker image",
          "Secrets in CI",
          "Deploy step to AWS",
        ],
      },
      {
        name: "Topic 13.3: Deployment Strategies",
        subtopics: [
          "Rolling deployments",
          "Blue-green deployments",
          "Feature flags",
          "Rollbacks",
        ],
      },
      {
        name: "Topic 13.4: Secrets Management",
        subtopics: [
          "Env-based secrets",
          "AWS Secrets Manager / SSM Parameter Store",
          "Never commit secrets; rotation basics",
        ],
      },
      {
        name: "Topic 13.5: Code Quality Automation",
        subtopics: [
          "`golangci-lint`",
          "`gofmt`/`goimports` checks",
          "Pre-commit hooks",
        ],
      },
      {
        name: "Topic 13.6: Security in CI",
        subtopics: [
          "`govulncheck` (known vulnerabilities in dependencies and the stdlib)",
          "`gosec` static analysis (SAST) for common Go security issues",
          "Dependency scanning and automated updates (Dependabot)",
          "Secret scanning to block committed credentials",
          "Fail the build on high-severity findings; triage and suppression workflow",
        ],
      },
    ],
  },
  {
    name: "Module 14: Kubernetes (Interview-Level Only)",
    topics: [
      {
        name: "Topic 14.1: Core Concepts",
        subtopics: [
          "Pods",
          "Deployments",
          "Services",
          "Ingress",
        ],
      },
      {
        name: "Topic 14.2: Talking Points",
        subtopics: [
          "Why orchestration exists",
          "ECS vs EKS (revisit)",
          "What you'd learn next professionally",
        ],
      },
    ],
  },
  {
    name: "Module 15: gRPC & Inter-Service Communication",
    topics: [
      {
        name: "Topic 15.1: Protocol Buffers",
        subtopics: [
          "`.proto`, messages, services",
          "Code generation (`protoc`)",
        ],
      },
      {
        name: "Topic 15.2: gRPC in Go",
        subtopics: [
          "Unary RPCs",
          "Streaming (awareness)",
          "gRPC vs REST (trade-offs)",
          "Interceptors",
        ],
      },
    ],
  },
  {
    name: "Module 16: System Design & Architecture",
    topics: [
      {
        name: "Topic 16.1: Architecture Patterns",
        subtopics: [
          "Layered (handler → service → store)",
          "Clean architecture / dependency direction",
          "Monolith vs microservices (junior-scale trade-offs)",
          "Dependency injection (manual, idiomatic)",
        ],
      },
      {
        name: "Topic 16.2: Scalability",
        subtopics: [
          "Stateless services + horizontal scaling",
          "Caching layers",
          "Read replicas (awareness)",
          "Load balancing",
          "Queues for decoupling",
        ],
      },
      {
        name: "Topic 16.3: Reliability & Failure",
        subtopics: [
          "Behavior under heavy load",
          "Timeouts, retries, circuit breakers (awareness)",
          "Idempotency keys",
          "Graceful shutdown / zero-downtime deploys",
        ],
      },
      {
        name: "Topic 16.4: Design Practice",
        subtopics: [
          "URL shortener",
          "Rate limiter",
          "Concurrency-safe wallet/ledger system (feeds the capstone: no money created or destroyed, ever)",
        ],
      },
      {
        name: "Topic 16.PS1: [PS] Software Design Patterns - Theory with Implementations",
        subtopics: [
          "[PS] Software Design Patterns",
          "[PS] What is Design Pattern and what is singleton",
          "[PS] Implementing Singleton",
          "[PS] Use-Cases Of Singleton",
          "[PS] Software Design Patterns - DI (Dependency Injection)",
          "[PS] Introduction to DI",
          "[PS] Implementing Basic Dependency Injection",
          "[PS] Improving DI further",
          "[PS] Testing and DI - How it helps to test software",
          "[PS] Factory Design Pattern",
          "[PS] Introduction to factory Design Pattern",
          "[PS] Implementing Factory Design Pattern",
          "[PS] Strategy Design Pattern",
          "[PS] Strategy Design Pattern Paart One: Factory vs Strategy",
          "[PS] Strategy Design Pattern - Part 2",
          "[PS] Strategy Pattern Use Cases",
          "[PS] Interview Questions",
          "[PS] Interview Questions: Strategy, Factory, Singleton, DI",
          "[PS] Decorator Pattern",
          "[PS] Decorator Pattern Introduction",
          "[PS] What is esdecorator ? Who gives us decorator functions?",
          "[PS] Using Decorator with logger",
          "[PS] Conclusion",
          "[PS] Learning Sources : Generics",
          "[PS] Interview Questions",
          "[PS] Decorator In TS",
        ],
      },
      {
        name: "Topic 16.PS2: [PS] NEST JS Project One",
        subtopics: [
          "[PS] Process focus — skip NestJS/TypeORM hands-on; mirror handler → service → store in Go",
          "[PS] Project Requirements",
          "[PS] Requirement analysis Part 2",
          "[PS] Technical Grooming and Project Bootstrap",
          "[PS] Finding P0 task and hands on details.mp4",
          "[PS] Preparing DTO and Repository Layer",
          "[PS] Service and Controller",
          "[PS] Testing End Points",
          "[PS] Product Development PRD analysis and Development scope discussion",
          "[PS] Automated Testing API with bash file",
        ],
      },
    ],
  },
  {
    name: "Module 17: AI Integration — Backend-First (what companies actually want)",
    topics: [
      {
        name: "Topic 17.1: LLM APIs from Go (the plumbing)",
        subtopics: [
          "Calling LLM APIs from Go (OpenAI/Anthropic-style; provider-agnostic client design behind an interface — vendor abstraction is a listed job requirement)",
          "Streaming responses (SSE) end-to-end: provider → your Go service → client",
          "Tokens: what they are, context-window limits, counting/estimating",
          "Cost & latency engineering: caching identical/similar requests, model tiering (cheap model first), timeouts + retries with backoff (your M4.7 skills apply directly)",
          "Rate limits (429 + `Retry-After`), graceful degradation and fallbacks when the model is down",
          "AWS Bedrock awareness (managed LLMs — ties to M12; commonly listed alongside OpenAI/Anthropic)",
        ],
      },
      {
        name: "Topic 17.2: Prompt Engineering & Structured Output",
        subtopics: [
          "System vs user messages; few-shot examples; when chain-of-thought helps",
          "**Structured output**: strict JSON schema constraints, parsing into Go structs, validate-and-repair loops when the model returns garbage",
          "Prompt templates as versioned artifacts (in git, like migrations — prompt versioning is a listed job skill)",
          "Context-window management: fitting retrieved content in intelligently, not stuffing",
        ],
      },
      {
        name: "Topic 17.3: Embeddings & RAG (the #1 asked-for skill)",
        subtopics: [
          "Embeddings: what they are, choosing a model, generating them in a pipeline (background workers — M10 skills)",
          "**pgvector**: vector columns in the Postgres you already run; ANN indexes (HNSW/IVFFlat awareness)",
          "Chunking strategies: fixed-size vs semantic; why bad chunking is the most common RAG failure",
          "The full RAG pipeline: ingest → chunk → embed → store → retrieve → rerank (awareness) → generate **with citations**",
          "Hybrid retrieval (keyword + vector) awareness",
          "**Retrieval evaluation**: recall/precision on a golden set, groundedness — \"does it return something\" is not a metric",
          "Retrieval-time access control (users must not retrieve documents they can't read — a security requirement in real job posts)",
        ],
      },
      {
        name: "Topic 17.4: Tool/Function Calling, Agents & MCP",
        subtopics: [
          "Tool/function calling with **strict JSON schemas**; validating and sandboxing tool inputs (models hallucinate arguments — handle it)",
          "Agent loops: multi-step workflows with state, retries, idempotency (your `hookrelay` patterns apply directly)",
          "Safe tool execution boundaries: allow-lists, permissions, constrained actions, human approval for destructive ops",
          "Model Context Protocol (MCP): what it is, why it's becoming the standard interface (awareness + one hands-on)",
          "Orchestration frameworks (LangChain/LangGraph-style) — awareness only; know what they solve so you can discuss them, but build your first ones by hand in Go to understand the loop",
        ],
      },
      {
        name: "Topic 17.5: Evals & AI Observability (what separates pros from demo-builders)",
        subtopics: [
          "Offline evals: a golden set of input → expected-output pairs, run in CI like tests",
          "Metrics that matter: task completion, groundedness/hallucination rate, tool-call accuracy",
          "LLM observability: log prompts/completions (PII-aware), trace multi-step chains, export token count / cost / latency as Prometheus metrics into your existing Grafana (M10)",
          "Regression testing prompts: eval suite must pass before a prompt change ships",
        ],
      },
      {
        name: "Topic 17.6: AI Security",
        subtopics: [
          "Prompt injection (direct + via retrieved documents) and mitigations",
          "Data exfiltration risks from tool-calling agents",
          "PII handling: what never goes to a third-party model; masking pipelines",
          "Secrets hygiene for provider API keys (SSM/Secrets Manager — M13.4)",
        ],
      },
    ],
  },
  {
    name: "Module 18: Reading Existing Code [Ongoing]",
    ongoing: true,
    topics: [
      {
        name: "Topic 18.1: How to Read Code",
        subtopics: [
          "Start from entry points (`main`)",
          "Follow a single request end-to-end",
          "Read tests to understand behavior",
          "Take notes / draw the architecture",
        ],
      },
      {
        name: "Topic 18.2: What to Read (rotate)",
        subtopics: [
          "Go standard library (`net/http`, `io`, `sync`)",
          "High-quality open-source Go (`chi`, `golang-migrate`, `testify`)",
          "Docker, Prometheus, Kubernetes (selected packages)",
        ],
      },
      {
        name: "Topic 18.3: Output",
        subtopics: [
          "Weekly note: \"what I read, what I learned, one pattern I'll reuse\"",
        ],
      },
    ],
  },
  {
    name: "Module 19: Communication & Remote Work [Ongoing]",
    ongoing: true,
    topics: [
      {
        name: "Topic 19.1: Technical Writing",
        subtopics: [
          "Clear, concise written English",
          "Writing for an async remote audience",
        ],
      },
      {
        name: "Topic 19.2: GitHub Communication",
        subtopics: [
          "Writing good GitHub issues (repro, context, expected vs actual)",
          "Writing good pull requests (description, why, screenshots)",
          "Code review etiquette (giving + receiving feedback)",
        ],
      },
      {
        name: "Topic 19.3: Design Communication",
        subtopics: [
          "Writing RFCs / design docs",
          "Explaining architecture clearly",
          "Giving demos",
        ],
      },
      {
        name: "Topic 19.4: Spoken & Interpersonal",
        subtopics: [
          "Speaking English (practice explaining aloud)",
          "Asking questions professionally",
          "Conflict resolution in a team",
        ],
      },
    ],
  },
  {
    name: "Module 20: API Documentation",
    topics: [
      {
        name: "Topic 20.1: Code & Repo Docs",
        subtopics: [
          "Writing excellent READMEs (setup, architecture, decisions)",
          "`DECISIONS.md` per project",
        ],
      },
      {
        name: "Topic 20.2: API Docs",
        subtopics: [
          "Swagger / OpenAPI (generate + serve)",
          "API versioning strategy",
          "Postman collections",
          "Rich API examples (curl + sample requests/responses)",
        ],
      },
    ],
  },
  {
    name: "Module 21: Open Source Contribution [Ongoing]",
    ongoing: true,
    topics: [
      {
        name: "Topic 21.1: Getting Started",
        subtopics: [
          "Finding beginner-friendly Go repos",
          "Reading CONTRIBUTING.md",
          "Fork + local dev setup",
        ],
      },
      {
        name: "Topic 21.2: Meaningful Contributions",
        subtopics: [
          "Bug fixes",
          "Test improvements",
          "Small features",
          "Reviewing PRs",
          "Good PR descriptions + responding to feedback",
        ],
      },
      {
        name: "Topic 21.3: Tracking",
        subtopics: [
          "PR tracker (repo, type, status, link)",
          "Target: 3–5 PRs during program; 10–20 over time (no typo-only PRs)",
        ],
      },
    ],
  },
  {
    name: "Module 22: Engineering Mindset & Trade-offs [Ongoing]",
    ongoing: true,
    topics: [
      {
        name: "Topic 22.1: The Trade-off Habit",
        subtopics: [
          "Why this? Why not the alternative?",
          "What are the trade-offs?",
          "What happens under heavy load?",
          "How does it fail? How would I debug it?",
        ],
      },
      {
        name: "Topic 22.2: Trade-off Question Bank",
        subtopics: [
          "JWT vs sessions?",
          "Postgres vs MySQL?",
          "Redis vs querying Postgres?",
          "Why containerize?",
          "RBAC vs ownership checks?",
          "Append-only ledger for stock?",
          "Background worker for emails?",
          "Connection pooling — what if exhausted?",
        ],
      },
      {
        name: "Topic 22.3: Documentation Practice",
        subtopics: [
          "`DECISIONS.md` everywhere",
          "Explain every decision aloud (recorded)",
        ],
      },
    ],
  },
  {
    name: "Module 23: Job Hunt & Interview Preparation",
    topics: [
      {
        name: "Topic 23.1: Professional Profile",
        subtopics: [
          "1-page backend resume (trade-off-driven bullets)",
          "GitHub pinned repos + READMEs",
          "LinkedIn headline/about + build-in-public",
          "Portfolio page",
        ],
      },
      {
        name: "Topic 23.2: Technical Articles",
        subtopics: [
          "2 articles (e.g. \"Why JWT over sessions\", \"Preventing double stock deduction\")",
          "Publish on Dev.to / LinkedIn",
        ],
      },
      {
        name: "Topic 23.3: Applications",
        subtopics: [
          "Boards: Remote Rocketship, Wellfound, Remotive, RemoteOK, web3.career, WeWorkRemotely, LinkedIn",
          "Filter worldwide/anywhere + intern/junior",
          "Application tracker",
          "Tailored notes linking the live capstone",
          "5–10 quality applications/week",
        ],
      },
      {
        name: "Topic 23.4: Interview Prep",
        subtopics: [
          "3-minute project pitch",
          "Defend 3 `DECISIONS.md` entries",
          "Failure-mode questions (\"what breaks at 10k RPS?\", \"how to debug a 500?\")",
          "Concurrency Q&A",
          "SQL + transactions",
          "System design basics",
          "Mock interviews (record + review)",
        ],
      },
    ],
  },
];
