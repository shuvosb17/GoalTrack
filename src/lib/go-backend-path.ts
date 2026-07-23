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

/** Bump when Development Go path curriculum shape changes (v3: PS course merge). */
export const GO_BACKEND_CURRICULUM_VERSION = 3;

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
          "[PS] Web server + PORT + IP address — how they work together",
          "[PS] Domain names and IP addresses (what localhost really is)",
          "[PS] Cloud systems intro: deploying a tiny server to a cloud lab (concept only)",
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
          "[PS] OOP pillars (encapsulation, abstraction, inheritance, polymorphism) — and how Go gets them via structs, interfaces, and composition",
          "[PS] Real-life interface & polymorphism use cases (swapping implementations behind one interface)",
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
          "[PS] Node's event loop vs Go's scheduler — single-threaded async vs goroutines (interview talking point)",
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
          "`ServeMux` + Go 1.22 routing (`GET /notes/{id}`)",
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
          "[PS] Query params vs path/route params — when to use which",
          "[PS] Anatomy of a POST endpoint (request body → validation → data flow → response)",
          "[PS] Response formatting: consistent envelopes and why they matter",
          "[PS] Offset pagination internals and its problems at scale",
          "[PS] Cursor-based pagination: how cursors work, implementation, offset vs cursor benchmarking",
          "[PS] PUT vs PATCH — semantics and when each is correct",
          "[PS] Soft delete vs hard delete; managing bulk updates",
          "[PS] ETag: what it is and how it enables caching/conditional requests",
        ],
      },
      {
        name: "Topic 4.4: Middleware",
        subtopics: [
          "Handler wrapping",
          "Logging, recovery, CORS",
          "Request/correlation ID",
          "Chaining",
          "[PS] Why routers and controllers exist — separating routing, handling, and business logic",
          "[PS] Rate-limiting middleware: algorithm families (fixed window, sliding window, token bucket)",
          "[PS] Audit logger middleware: recording who did what, when (build it in Go as a middleware exercise)",
          "[PS] CORS in detail: what the browser actually enforces, preflight requests, simulating CORS failures",
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
        name: "Topic 4.9: File Uploads [PS]",
        subtopics: [
          "[PS] How HTTP handles file upload (multipart/form-data, client → server flow)",
          "[PS] MIME types: what they are and why servers must validate them",
          "[PS] Building a file-upload endpoint (in Go: `r.ParseMultipartForm`, `FormFile`)",
          "[PS] Streaming uploads to third-party object storage (S3/DigitalOcean Spaces — ties to Module 12.8)",
          "[PS] Upload SLAs and rate limiting on upload endpoints",
          "[PS] Upload security: size limits, extension/MIME validation, never trusting client filenames",
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
          "[PS] Database design thinking: how to approach schema design from zero (requirements → entities → relations)",
          "[PS] Why multiple tables — the problems a naive one/two-table design creates",
          "[PS] Candidate key vs primary key vs composite key",
          "[PS] 2NF questions and edge cases (common interview traps)",
          "[PS] ERD practice: e-commerce ERD walkthrough + blog-post ERD as homework",
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
          "[PS] Subqueries and joins — why you need them, from an application point of view",
          "[PS] Altering a live table safely; generating fake data with SQL loops",
          "[PS] JSON data modeling: JSON flow from client → API → database (jsonb ties to Topic 5.3)",
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
          "[PS] Stateless HTTP and why cookies exist; making, saving, and reading cookies",
          "[PS] Custom session storage with cookies (build once to understand what libraries do)",
          "[PS] Problems with cookie-based auth; cookie use cases that still make sense",
          "[PS] Encoding vs encryption vs hashing — base64/Base64URL, signatures, and where each fits",
          "[PS] Password hashing + salting from first principles (why plain hashes fail)",
          "[PS] Production-grade JWT setup: RS256 private/public key signing, testing scope",
          "[PS] Role-based access control implemented inside JWT claims",
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
          "[PS] SQL injection deep-dive: how it happens, root-cause analysis, hands-on simulation",
          "[PS] Parameterized queries and defense in depth (maps to Go prepared statements, Topic 5.4)",
          "[PS] Vulnerable code patterns that reach production — and how attackers break authentication",
          "[PS] XSS protection in practice; CSP headers and HttpOnly cookies",
          "[PS] CSRF tokens: implementation and when SameSite is not enough",
          "[PS] SQL injection interview question bank (rehearse aloud)",
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
          "[PS] Domain → IP resolution end-to-end recap; server types and port mapping conventions (80/443/custom)",
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
          "[PS] Why `fmt.Println`/console logging fails in production (no levels, no structure, no routing)",
          "[PS] System architecture of a logger: transports, formatting, buffering, log levels as a design problem",
          "[PS] Winston vs Pino comparative study (awareness) — map the same trade-offs onto Go's `slog`/`zap`/`zerolog`",
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
        name: "Topic 10.5: Load Testing [PS]",
        subtopics: [
          "[PS] System latency fundamentals: what load testing measures and why",
          "[PS] Percentiles: finding and interpreting P95 / P99 of a system",
          "[PS] K6 for API load testing: scripting, virtual users, thresholds",
          "[PS] Load-testing a small project end-to-end (run K6 against your notes-api)",
          "[PS] Performance testing with Postman (quick checks vs proper load tests)",
          "[PS] Realistic latency targets: how to reason about \"fast enough\" in real scenarios",
          "Feed results back: use pprof (Module 11) on hotspots K6 exposes",
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
          "[PS] Object storage from the app side: streaming uploads from your API to S3-compatible storage (S3 / DigitalOcean Spaces — pairs with Topic 4.9)",
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
          "[PS] DI in depth: why it exists, basic → improved implementations, and how DI makes testing easy (maps to Go interface-based DI, Topic 3.2)",
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
          "Concurrency-safe inventory/stock system",
        ],
      },
      {
        name: "Topic 16.5: Software Design Patterns [PS]",
        subtopics: [
          "[PS] What design patterns are and when to reach for one",
          "[PS] Singleton: implementation and real use cases (in Go: `sync.Once`, package-level state trade-offs)",
          "[PS] Factory pattern: intro and implementation (in Go: constructor functions returning interfaces)",
          "[PS] Strategy pattern: factory vs strategy, use cases (in Go: injecting behavior via interfaces)",
          "[PS] Decorator pattern: wrapping behavior, logger decorator example (in Go: middleware is exactly this)",
          "[PS] Interview question bank: Singleton, DI, Factory, Strategy — practice answers aloud",
          "Implement each pattern once in Go inside notes-api or the capstone (small refactors, not new projects)",
        ],
      },
    ],
  },
  {
    name: "Module 17: AI Integration",
    topics: [
      {
        name: "Topic 17.1: LLM APIs",
        subtopics: [
          "Calling LLM APIs from Go (OpenAI/Anthropic-style)",
          "Streaming responses",
          "Tokens, cost, rate limits, error handling",
        ],
      },
      {
        name: "Topic 17.2: Prompt Engineering",
        subtopics: [
          "System vs user prompts",
          "Structured output (JSON)",
          "Guardrails and validation",
        ],
      },
      {
        name: "Topic 17.3: Embeddings & Retrieval",
        subtopics: [
          "Embeddings (what they are)",
          "Vector databases (pgvector, Pinecone — awareness)",
          "RAG (retrieval-augmented generation) pipeline",
        ],
      },
      {
        name: "Topic 17.4: Agents & Protocols",
        subtopics: [
          "AI agents (tools/function calling)",
          "Model Context Protocol (MCP) (what it is, why it matters)",
        ],
      },
      {
        name: "Topic 17.5: Building AI Features",
        subtopics: [
          "Adding an AI endpoint to a backend (e.g. semantic search, summarization)",
          "Caching AI responses, fallback handling",
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
      {
        name: "Topic 22.4: Requirement Analysis & Delivery Workflow [PS]",
        subtopics: [
          "[PS] Reading a PRD: extracting requirements before writing code",
          "[PS] Requirement analysis passes: features → constraints → open questions",
          "[PS] Technical grooming: turning requirements into technical tasks",
          "[PS] Finding the P0: prioritizing what to build first and why",
          "[PS] Testing endpoints as you deliver; automated API smoke tests (bash/scripts)",
          "Apply this workflow to every capstone milestone: write a mini-PRD before each module's project",
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
