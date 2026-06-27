import type { GoPathProject } from "./go-backend-path";

/** Projects per module index (0–23). At least 1–2 per module; beginner → advanced progression. */
export const GO_BACKEND_MODULE_PROJECTS: GoPathProject[][] = [
  // Module 0: Developer Environment & Foundations
  [
    {
      name: "GitHub Profile & First Repo",
      tier: "beginner",
      deliverables: [
        "Profile README with bio, stack, and pinned repos plan",
        "Public repo initialized with `.gitignore` and license",
        "Meaningful commit history with conventional messages",
        "LinkedIn/GitHub cross-linked for recruiter discovery",
      ],
    },
    {
      name: "Git Workflow Practice Repo",
      tier: "beginner",
      deliverables: [
        "≥10 commits across ≥2 branches",
        "One self-opened PR with description and review checklist",
        "Intentional merge conflict created and resolved",
        "Trunk-based or GitFlow workflow documented in README",
      ],
    },
  ],
  // Module 1: Go Language Fundamentals
  [
    {
      name: "cli-todo",
      tier: "beginner",
      deliverables: [
        "Add/list/complete/delete tasks via CLI flags or subcommands",
        "JSON or text file persistence between runs",
        "`go mod init`, tests with table-driven cases",
        "README with install, usage, and design notes",
      ],
    },
    {
      name: "unit-converter & word-counter",
      tier: "beginner",
      deliverables: [
        "unit-converter: length/weight/temp with clear error messages",
        "word-counter: stdin/file input, line/word/char stats",
        "Both use `flag` or cobra; `go vet` and `go test` clean",
      ],
    },
    {
      name: "Generic Stack[T] & Queue[T]",
      tier: "medium",
      deliverables: [
        "Type-parameter stack with Push/Pop/Peek/Len",
        "Type-parameter queue with Enqueue/Dequeue",
        "Table-driven tests; benchmark Push/Pop vs slice-only baseline",
        "Short blog-style comment on when generics help vs hurt",
      ],
    },
  ],
  // Module 2: Concurrency in Go
  [
    {
      name: "concurrent-fetcher",
      tier: "medium",
      deliverables: [
        "Fetch N URLs concurrently with worker pool",
        "Configurable concurrency limit and timeout per request",
        "Aggregate status codes, timings, and errors",
        "`go test -race` clean; document leak avoidance",
      ],
    },
    {
      name: "rate-limiter library",
      tier: "medium",
      deliverables: [
        "Token-bucket or sliding-window limiter package",
        "Examples: HTTP middleware + CLI demo",
        "Benchmarks; README with complexity and trade-offs",
      ],
    },
    {
      name: "parallel-file-processor",
      tier: "advanced",
      deliverables: [
        "Walk directory; hash or transform files in parallel pipeline",
        "Graceful shutdown on SIGINT using context",
        "Fan-out/fan-in with errgroup; structured error reporting",
      ],
    },
  ],
  // Module 3: Testing & Quality
  [
    {
      name: "Test Suite Retrofit (prior projects)",
      tier: "medium",
      deliverables: [
        "Add table-driven tests to cli-todo and concurrent-fetcher",
        ">70% coverage on concurrent-fetcher (report in README)",
        "Subtests for edge cases; `-coverprofile` artifact in repo",
      ],
    },
    {
      name: "Testify & Mock Exercise",
      tier: "beginner",
      deliverables: [
        "Small service with interface + mock implementation (testify/mock)",
        "HTTP handler tested with httptest",
        "Document red-green-refactor cycle used on one feature",
      ],
    },
  ],
  // Module 4: HTTP & REST API Development
  [
    {
      name: "notes-api-inmemory",
      tier: "beginner",
      deliverables: [
        "CRUD REST API for notes (in-memory store)",
        "JSON request/response; consistent error envelope",
        "Logging + recovery middleware; httptest for handlers",
        "Chi or stdlib ServeMux with Go 1.22 routing",
      ],
    },
    {
      name: "REST API Hardening Pass",
      tier: "medium",
      deliverables: [
        "Pagination, filtering, validation on notes-api-inmemory",
        "Request ID middleware; CORS configured correctly",
        "OpenAPI-style endpoint table in README",
      ],
    },
  ],
  // Module 5: Databases & Persistence
  [
    {
      name: "notes-api (Postgres + Redis)",
      tier: "medium",
      deliverables: [
        "Postgres schema with migrations (golang-migrate)",
        "CRUD via database/sql or pgx; connection pool tuned",
        "Redis cache-aside for hot reads or session store",
        "docker-compose for local dev; integration tests",
      ],
    },
    {
      name: "E-commerce Schema Design",
      tier: "advanced",
      deliverables: [
        "ER diagram: users, products, orders, order_items, inventory",
        "Normalization notes + intentional denormalization choices",
        "Sample SQL: JOINs, aggregates, index recommendations",
        "DECISIONS.md with Postgres vs MySQL rationale",
      ],
    },
  ],
  // Module 6: Authentication, Authorization & Security
  [
    {
      name: "Secure notes-api (JWT + RBAC)",
      tier: "medium",
      deliverables: [
        "bcrypt password hashing; register/login endpoints",
        "JWT access + refresh tokens; rotation strategy documented",
        "RBAC: admin / editor / viewer roles on note resources",
        "Login rate limiting; Redis blocklist for revoked tokens",
      ],
    },
    {
      name: "Security Hardening Checklist",
      tier: "advanced",
      deliverables: [
        "Input validation on all write endpoints",
        "Security headers middleware; HTTPS-only cookies if session used",
        "OWASP Top 10 self-audit checklist filled for notes-api",
      ],
    },
  ],
  // Module 7: Linux (Deep)
  [
    {
      name: "notes-api on Linux VM",
      tier: "advanced",
      deliverables: [
        "Deploy notes-api on WSL or free-tier Linux VM",
        "systemd unit file; service survives reboot",
        "nginx reverse proxy with TLS (self-signed or Let's Encrypt)",
        "Bash deploy script: build, migrate, restart, health check",
      ],
    },
    {
      name: "Linux Ops Runbook",
      tier: "medium",
      deliverables: [
        "Document: permissions fix, log locations, restart procedure",
        "journalctl queries for debugging 5xx errors",
        "tmux session recipe for long-running dev on SSH",
      ],
    },
  ],
  // Module 8: Networking
  [
    {
      name: "Network Labs Bundle",
      tier: "medium",
      deliverables: [
        "Inspect TLS handshake with `openssl s_client` (notes in repo)",
        "Tiny WebSocket echo server in Go",
        "nginx L7 load balancer over 2 app instances",
        "Diagram: request path client → nginx → app → DB",
      ],
    },
    {
      name: "url-shortener",
      tier: "medium",
      deliverables: [
        "Short-code generation; redirect endpoint",
        "Postgres persistence; collision handling",
        "Rate limit creation endpoint; analytics optional",
        "Second pinned repo quality README + live demo optional",
      ],
    },
  ],
  // Module 9: Containers & Local Orchestration
  [
    {
      name: "Full Docker Compose Stack",
      tier: "advanced",
      deliverables: [
        "Multi-stage Dockerfile (static Go binary)",
        "compose: app + Postgres + Redis + healthchecks",
        "Volumes for data; `.dockerignore` optimized for layer cache",
        "One-command `docker compose up` documented",
      ],
    },
    {
      name: "Capstone Milestone — Containerize Platform",
      tier: "capstone",
      deliverables: [
        "Inventory/capstone app containerized with compose",
        "All services networked; secrets via env files (not committed)",
        "Smoke test script run in CI",
      ],
    },
  ],
  // Module 10: Observability & Reliability
  [
    {
      name: "Observability Upgrade (notes-api or capstone)",
      tier: "medium",
      deliverables: [
        "Structured logging with `slog` + correlation IDs",
        "Prometheus `/metrics` (latency, errors, in-flight)",
        "Background email/job worker with retries + dead-letter note",
        "`/healthz` and `/readyz` endpoints",
      ],
    },
    {
      name: "Capstone Milestone — Metrics Dashboard",
      tier: "capstone",
      deliverables: [
        "Prometheus metrics on capstone; Grafana screenshot or config",
        "Alert-worthy SLO defined (e.g. p99 latency, error rate)",
      ],
    },
  ],
  // Module 11: Debugging & Profiling
  [
    {
      name: "pprof Bottleneck Hunt & Fix",
      tier: "advanced",
      deliverables: [
        "Introduce deliberate CPU or alloc hotspot in a service",
        "Capture CPU + heap profiles via net/http/pprof",
        "Flame graph or `go tool pprof` analysis in docs",
        "Before/after benchmark numbers after fix",
      ],
    },
    {
      name: "Delve Debugging Exercise",
      tier: "beginner",
      deliverables: [
        "Reproduce bug; fix using Delve breakpoints",
        "Document panic stack trace reading steps",
        "Goroutine dump analysis write-up (SIGQUIT)",
      ],
    },
  ],
  // Module 12: Cloud & Deployment (AWS)
  [
    {
      name: "Deploy notes-api to AWS",
      tier: "advanced",
      deliverables: [
        "Live public URL (ECS Fargate + RDS, or EC2 + compose)",
        "IAM least-privilege roles documented",
        "S3 bucket for uploads or static assets (if applicable)",
        "CloudWatch logs/metrics wired",
      ],
    },
    {
      name: "Capstone Milestone — AWS Production",
      tier: "capstone",
      deliverables: [
        "Capstone deployed with HTTPS on custom or AWS domain",
        "RDS Postgres + optional ElastiCache/Redis",
        "Runbook: deploy, rollback, scale",
      ],
    },
  ],
  // Module 13: CI/CD & Automation
  [
    {
      name: "Full GitHub Actions Pipeline",
      tier: "advanced",
      deliverables: [
        "Workflow: test → lint (golangci-lint) → build image → deploy",
        "Cache Go modules; matrix or single job documented",
        "Secrets from GitHub/SSM; no keys in repo",
        "Rolling or blue-green deploy strategy noted",
      ],
    },
    {
      name: "Capstone Milestone — CI/CD Complete",
      tier: "capstone",
      deliverables: [
        "Capstone pipeline green on main; deploy on tag or merge",
        "Pre-commit hooks locally mirroring CI checks",
        "Badges in README: build, coverage, deploy status",
      ],
    },
  ],
  // Module 14: Kubernetes (Interview-Level)
  [
    {
      name: "K8s Local Stretch (kind/minikube)",
      tier: "beginner",
      deliverables: [
        "Deployment + Service + Ingress for capstone or notes-api",
        "Local image load or registry push documented",
        "Talking points doc: Pods vs Deployments vs Services",
      ],
    },
  ],
  // Module 15: gRPC & Inter-Service Communication
  [
    {
      name: "Internal gRPC Service (capstone)",
      tier: "advanced",
      deliverables: [
        "`.proto` definition + generated Go stubs",
        "Unary RPC integrated into capstone (e.g. inventory lookup)",
        "Interceptor for logging/auth; gRPC vs REST trade-off in DECISIONS.md",
      ],
    },
  ],
  // Module 16: System Design & Architecture
  [
    {
      name: "System Design Exercise Pack",
      tier: "medium",
      deliverables: [
        "URL shortener: API + storage + scale notes (extend M8 project)",
        "Rate limiter design doc: token bucket at edge vs app",
        "Concurrency-safe inventory/stock: idempotency + locking strategy",
        "One-page diagrams per problem (Excalidraw or Mermaid in repo)",
      ],
    },
    {
      name: "Capstone Architecture RFC",
      tier: "capstone",
      deliverables: [
        "RFC: layered handler → service → store for Inventory Platform",
        "Monolith vs microservices decision with junior-scale rationale",
        "Failure modes: DB down, queue backlog, 10k RPS sketch",
      ],
    },
  ],
  // Module 17: AI Integration
  [
    {
      name: "Capstone AI Feature",
      tier: "advanced",
      deliverables: [
        "One AI endpoint (semantic search via embeddings + pgvector, or summarization)",
        "Prompt templates + structured JSON output validation",
        "Cost/rate-limit handling; cache repeated queries",
        "Fallback when model unavailable",
      ],
    },
  ],
  // Module 18: Reading Existing Code [Ongoing]
  [
    {
      name: "Weekly Code Reading Log",
      tier: "beginner",
      deliverables: [
        "Week 1: trace one request through `net/http` or chi",
        "Week 2: read tests in an OSS repo to infer behavior",
        "Template: what I read → what I learned → pattern to reuse",
        "Minimum 2h/week logged in GoalTrack",
      ],
    },
  ],
  // Module 19: Communication & Remote Work [Ongoing]
  [
    {
      name: "Communication Templates Pack",
      tier: "beginner",
      deliverables: [
        "GitHub issue template (repro, expected, actual, logs)",
        "PR template (why, what, how to test, screenshots)",
        "3-minute capstone architecture script (record or written)",
        "One RFC or design doc peer-reviewed (self-review checklist)",
      ],
    },
  ],
  // Module 20: API Documentation
  [
    {
      name: "Capstone Documentation Suite",
      tier: "medium",
      deliverables: [
        "OpenAPI/Swagger spec generated and served",
        "Postman collection with example requests/responses",
        "README: setup, architecture diagram, env vars, decisions",
        "DECISIONS.md with ≥5 trade-off entries",
      ],
    },
  ],
  // Module 21: Open Source Contribution [Ongoing]
  [
    {
      name: "Meaningful OSS Contributions",
      tier: "medium",
      deliverables: [
        "PR tracker spreadsheet: repo, type, status, link",
        "3–5 merged or in-review PRs (no typo-only)",
        "At least one test improvement or bug fix in a Go repo",
        "Review one external PR with constructive comments",
      ],
    },
  ],
  // Module 22: Engineering Mindset & Trade-offs [Ongoing]
  [
    {
      name: "DECISIONS.md Everywhere",
      tier: "beginner",
      deliverables: [
        "DECISIONS.md in cli-todo, notes-api, and capstone",
        "Answer trade-off bank: JWT vs sessions, Redis vs Postgres cache, etc.",
        "Record one 5-minute decision explanation (audio or written)",
      ],
    },
  ],
  // Module 23: Job Hunt & Interview Preparation
  [
    {
      name: "Inventory Management Platform (Capstone)",
      tier: "capstone",
      deliverables: [
        "Auth JWT+refresh, RBAC admin/manager/viewer, audit logs",
        "Background workers, email notifications, S3 file uploads",
        "Reports export, Prometheus metrics, structured logging",
        "Docker compose, CI/CD, AWS live URL, OpenAPI + tests >70%",
        "Stretch: gRPC service + AI feature",
      ],
    },
    {
      name: "Job Hunt Launch Kit",
      tier: "advanced",
      deliverables: [
        "1-page backend resume with trade-off-driven bullets",
        "GitHub pinned: capstone + url-shortener + best CLI project",
        "Portfolio page or README index linking live demos",
        "Application tracker; 5–10 quality apps/week plan",
        "2 technical articles published (Dev.to/LinkedIn)",
        "Mock interview recording reviewed with notes",
      ],
    },
  ],
];

export const GO_BACKEND_PROJECT_TOPIC_PREFIX = "Project:";

export function formatGoProjectTopicName(project: GoPathProject): string {
  const tier =
    project.tier === "capstone"
      ? "Capstone"
      : project.tier.charAt(0).toUpperCase() + project.tier.slice(1);
  return `${GO_BACKEND_PROJECT_TOPIC_PREFIX} [${tier}] ${project.name}`;
}

export function goProjectTierToDifficulty(
  tier: GoPathProject["tier"]
): "easy" | "medium" | "hard" | "expert" {
  switch (tier) {
    case "beginner":
      return "easy";
    case "medium":
      return "medium";
    case "advanced":
      return "hard";
    case "capstone":
      return "expert";
  }
}

/** Attach projects array to each module in the path. */
export function withGoBackendProjects<T extends { projects?: GoPathProject[] }>(
  modules: T[]
): (T & { projects: GoPathProject[] })[] {
  return modules.map((mod, i) => ({
    ...mod,
    projects: GO_BACKEND_MODULE_PROJECTS[i] ?? mod.projects ?? [],
  }));
}
