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
        name: "Topic 0.5: AI-Assisted Development (workflow)",
        subtopics: [
          "Using AI coding tools (Cursor / Copilot / Claude Code) effectively",
          "Prompting for code: context, constraints, iterating",
          "Reviewing and verifying AI output before trusting it",
          "Never commit unreviewed AI code; understand what you ship",
          "Never paste secrets/keys/proprietary code into prompts",
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
          "Money handling: `numeric`/decimal type, never float; `shopspring/decimal`",
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
        subtopics: ["tar", "gzip", "`zip`/`unzip`"],
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
          "OpenTelemetry (awareness)",
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
        name: "Topic 10.5: Event-Driven & Messaging",
        subtopics: [
          "Queue vs pub/sub (when to use which)",
          "Kafka / NATS (awareness), consumer groups",
          "At-least-once vs exactly-once delivery",
          "The outbox pattern",
          "Idempotent consumers",
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
    name: "Module 12: Cloud & Deployment (AWS)",
    topics: [
      {
        name: "Topic 12.1: Cloud Fundamentals",
        subtopics: [
          "IaaS/PaaS/SaaS",
          "Regions, availability zones",
          "Shared responsibility model",
        ],
      },
      {
        name: "Topic 12.2: Core AWS",
        subtopics: [
          "IAM (users, roles, policies, least privilege)",
          "EC2 (security groups, SSH)",
          "S3 (buckets, objects)",
          "RDS (managed Postgres)",
          "ElastiCache (managed Redis — awareness)",
          "ECR (registry)",
          "ECS Fargate vs EC2",
          "ECS vs EKS (talking level)",
          "CloudWatch (logs/metrics)",
        ],
      },
      {
        name: "Topic 12.3: Networking & Delivery",
        subtopics: [
          "Reverse proxy (nginx — ties to Module 8)",
          "ALB",
          "Route 53 basics",
          "TLS certificates (ACM)",
        ],
      },
      {
        name: "Topic 12.4: Infrastructure as Code (awareness)",
        subtopics: [
          "What IaC is",
          "Terraform basics",
          "CloudFormation (awareness)",
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
          "Pipeline stages: build → test → lint → package → deploy",
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
    ],
  },
  {
    name: "Module 14: Kubernetes (Interview-Level Only)",
    topics: [
      {
        name: "Topic 14.1: Core Concepts",
        subtopics: ["Pods", "Deployments", "Services", "Ingress"],
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
          "Concurrency-safe inventory/stock system",
        ],
      },
    ],
  },
  {
    name: "Module 17: AI Integration",
    ongoing: false,
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
          'Weekly note: "what I read, what I learned, one pattern I\'ll reuse"',
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
          "Kafka vs Redis queue?",
          "Float vs decimal for money?",
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
          '2 articles (e.g. "Why JWT over sessions", "Preventing double stock deduction")',
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
          'Failure-mode questions ("what breaks at 10k RPS?", "how to debug a 500?")',
          "Concurrency Q&A",
          "SQL + transactions",
          "System design basics",
          "Mock interviews (record + review)",
        ],
      },
    ],
  },
];
