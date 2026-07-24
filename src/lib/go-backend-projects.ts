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
      name: "jobtrackr-inmemory — 🚩 Flagship 1 begins",
      tier: "beginner",
      deliverables: [
        "CRUD REST API for companies, applications, and interview stages (in-memory store)",
        "JSON request/response; consistent error envelope",
        "Logging + recovery middleware; httptest for handlers",
        "Chi or stdlib ServeMux with Go 1.22 routing",
      ],
    },
    {
      name: "REST API Hardening Pass",
      tier: "medium",
      deliverables: [
        "Pagination (offset **and** cursor, benchmarked like the instructor's lesson), filtering, validation on jobtrackr-inmemory",
        "Request ID middleware; CORS configured correctly",
        "Rate-limiting + audit-logger middleware (instructor's Module: API Development Part Two, in Go)",
        "OpenAPI-style endpoint table in README",
      ],
    },
    {
      name: "API Client + Inbound Webhook Handler",
      tier: "medium",
      deliverables: [
        "Consume a real third-party API with a timeout-configured `http.Client`",
        "Context cancellation + retry with backoff on 5xx/429",
        "Inbound webhook endpoint with HMAC signature verification",
        "Idempotent event handling (dedupe by event ID); fast 2xx then async process",
        "Tests with `httptest` for both the client (mock server) and webhook receiver",
      ],
    },
  ],
  // Module 5: Databases & Persistence
  [
    {
      name: "jobtrackr (Postgres + Redis)",
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
      name: "Secure jobtrackr (JWT + RBAC)",
      tier: "medium",
      deliverables: [
        "bcrypt password hashing; register/login endpoints",
        "JWT access + refresh tokens; rotation strategy documented",
        "RBAC: admin / editor / viewer roles on application resources",
        "Login rate limiting; Redis blocklist for revoked tokens",
      ],
    },
    {
      name: "Security Hardening Checklist",
      tier: "advanced",
      deliverables: [
        "Input validation on all write endpoints",
        "Security headers middleware; HTTPS-only cookies if session used",
        "OWASP Top 10 self-audit checklist filled for jobtrackr",
      ],
    },
  ],
  // Module 7: Linux (Deep)
  [
    {
      name: "jobtrackr on Linux VM",
      tier: "advanced",
      deliverables: [
        "Deploy jobtrackr on WSL or free-tier Linux VM",
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
        "Tag and push the image to a registry (Docker Hub / GHCR)",
        "One-command `docker compose up` documented",
      ],
    },
    {
      name: "🚩 Flagship 2 — `vaultdrop` (File Sharing & Media Processing Service)",
      tier: "advanced",
      deliverables: [
        "Multipart upload handling → MIME validation → object storage (MinIO via compose now; S3 + presigned URLs in M12)",
        "Goroutine **worker pool** for async processing: thumbnails/resize, checksums (applies Module 2 for real)",
        "Expiring share links, download counters, per-user quotas, upload rate limiting + SLA (instructor's SLA lesson)",
        "Redis for hot metadata cache + rate limiter backing",
        "Full compose stack (app + Postgres + Redis + MinIO); multi-stage Dockerfile",
        "k6 load test (P95/P99 in README) — first use of instructor's Load Testing module",
      ],
    },
    {
      name: "Capstone Milestone — Containerize Platform",
      tier: "capstone",
      deliverables: [
        "taka-flow capstone app containerized with compose (when the capstone MVP starts in Phase B, apply this milestone)",
        "All services networked; secrets via env files (not committed)",
        "Smoke test script run in CI",
      ],
    },
  ],
  // Module 10: Observability & Reliability
  [
    {
      name: "Observability Upgrade (jobtrackr or capstone)",
      tier: "medium",
      deliverables: [
        "Structured logging with `slog` + correlation IDs; PII obfuscation on sensitive fields",
        "Prometheus `/metrics` (latency, errors, in-flight)",
        "Distributed tracing with OpenTelemetry exported to Jaeger (one request traced end-to-end)",
        "Background email/job worker with retries + dead-letter note",
        "`/healthz` and `/readyz` endpoints",
      ],
    },
    {
      name: "🚩 Flagship 3 — `hookrelay` (Webhook Delivery Platform)",
      tier: "advanced",
      deliverables: [
        "Accept events via API → durably queue → deliver to subscriber URLs with **retries + exponential backoff + jitter, dead-letter queue, HMAC signatures, idempotency keys**",
        "Postgres as durable queue first (`FOR UPDATE SKIP LOCKED`), then swap in Redis Streams/asynq — document the trade-off in DECISIONS.md",
        "Delivery dashboard endpoints: attempt logs, success rates, latency percentiles",
        "Full observability: `slog` + Prometheus (deliveries/sec, retry count, DLQ depth) + Grafana dashboard screenshot in README",
        "Deploys to AWS with CI/CD in M12–M13",
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
  // Module 12: Cloud & Deployment (AWS) — Hands-on
  [
    {
      name: "VPC + IAM Lab",
      tier: "medium",
      deliverables: [
        "Build a VPC with public and private subnets, route tables, and internet access",
        "Create least-privilege IAM roles/policies for a future app deploy",
        "Document the network diagram and cost notes (NAT vs public-only lab)",
        "No production secrets in the repo; use IAM roles, not committed keys",
      ],
    },
    {
      name: "Deploy the flagships to AWS (jobtrackr → vaultdrop → hookrelay)",
      tier: "advanced",
      deliverables: [
        "Preferred path: **ECS Fargate + ECR + ALB + RDS Postgres** (or EC2 + compose if cost-constrained)",
        "`jobtrackr` live on a public HTTPS URL (ACM) — Flagship 1 goes to AWS",
        "`vaultdrop` upgraded from MinIO to **S3 with presigned URLs** + least-privilege task role — Flagship 2 live",
        "`hookrelay` deployed with CloudWatch logs + alarms on DLQ depth/5xx — Flagship 3 live (CI/CD completes in M13)",
        "IAM least-privilege roles documented per service",
        "Optional: Route 53 custom domain; CloudFront in front of static assets",
      ],
    },
    {
      name: "Lambda Stretch (optional)",
      tier: "advanced",
      deliverables: [
        "One small API via API Gateway + Lambda (health check, webhook, or report trigger)",
        "CloudWatch logs; IAM role with least privilege",
        "Short DECISIONS.md: why this is Lambda vs part of the ECS service",
      ],
    },
    {
      name: "Capstone Milestone — AWS Production",
      tier: "capstone",
      deliverables: [
        "taka-flow platform deployed with HTTPS on custom or AWS domain",
        "VPC-aware layout: ALB public, app + RDS private where practical",
        "RDS Postgres + optional ElastiCache/Redis",
        "S3 for file uploads / reports; CloudWatch monitoring",
        "Runbook: deploy, rollback, scale, and estimated monthly cost",
      ],
    },
  ],
  // Module 13: CI/CD & Automation
  [
    {
      name: "Full GitHub Actions Pipeline",
      tier: "advanced",
      deliverables: [
        "Workflow: test → lint (golangci-lint) → security scan (govulncheck + gosec) → build image → deploy",
        "Cache Go modules; matrix or single job documented",
        "Dependabot enabled; build fails on high-severity vulnerabilities",
        "Secrets from GitHub/SSM; no keys in repo",
        "Rolling or blue-green deploy strategy noted",
      ],
    },
    {
      name: "🚩 Flagship 4 — `pulsewatch` (Uptime Monitoring & Status Page Platform)",
      tier: "advanced",
      deliverables: [
        "Scheduler running **thousands of concurrent HTTP/TCP checks** via goroutine pools; per-check intervals and timeouts (Module 2 at full power)",
        "Incident detection (N consecutive failures) + alerting via email/Telegram",
        "Public status pages with uptime history and latency graphs (Go templates + htmx — enough UI to demo, no frontend rabbit hole)",
        "Time-series storage strategy in Postgres (partitioning/aggregation) — write up the design in DECISIONS.md",
        "Soak test: how many checks/minute can one node sustain? Publish the number (Module 11 skills)",
        "Ships with the full toolkit: Docker, GitHub Actions CI/CD with security scans, AWS deploy, Prometheus/Grafana, tracing",
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
  // Module 14: Kubernetes (Interview-Level Only)
  [
    {
      name: "K8s Local Stretch (kind/minikube)",
      tier: "beginner",
      deliverables: [
        "Deployment + Service + Ingress for capstone or jobtrackr",
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
        "Unary RPC integrated into capstone (e.g. internal balance/ledger lookup service)",
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
        "Concurrency-safe wallet/ledger: idempotency + locking strategy (direct capstone prep)",
        "One-page diagrams per problem (Excalidraw or Mermaid in repo)",
      ],
    },
    {
      name: "Capstone Architecture RFC",
      tier: "capstone",
      deliverables: [
        "RFC: layered handler → service → store for taka-flow platform",
        "Monolith vs microservices decision with junior-scale rationale",
        "Failure modes: DB down, queue backlog, 10k RPS sketch",
      ],
    },
  ],
  // Module 17: AI Integration — Backend-First (what companies actually want)
  [
    {
      name: "jobtrackr AI Upgrade (Flagship 1 gets AI)",
      tier: "medium",
      deliverables: [
        "Paste a raw job posting → LLM extracts structured fields (company, role, stack, salary, deadline) via **strict JSON schema** → validated into your existing Postgres models; repair-loop on malformed output",
        "Match scoring: job requirements vs your skills profile, with the reasoning returned as citations",
        "Semantic search over saved applications (embeddings + **pgvector** in your existing DB)",
        "Cost controls: cache extractions by posting hash; cheap-model-first tiering; token/cost/latency exported to Prometheus",
        "Golden-set eval: 10 real job postings with expected extractions, run in CI",
      ],
    },
    {
      name: "`askvault` — RAG Document Q&A (Flagship 2 gets AI)",
      tier: "advanced",
      deliverables: [
        "Ingestion pipeline on upload (background workers — M10): extract text → chunk → embed → pgvector",
        "`/ask` endpoint: retrieve top-k chunks (per-user access control — users can only query their own files) → generate answer **with citations** → **stream via SSE**",
        "Retrieval evaluation: golden-question set, recall + groundedness measured and reported in the README",
        "Prompt-injection defense for retrieved content; PII-aware logging",
        "Full ops treatment like every flagship: metrics dashboard incl. token cost, k6 load test on the retrieval path, CI/CD, live URL",
        "DECISIONS.md: chunking strategy chosen and why; pgvector vs dedicated vector DB trade-off",
      ],
    },
    {
      name: "taka-flow AI Feature (capstone stretch)",
      tier: "advanced",
      deliverables: [
        "Natural-language finance assistant via **tool calling**: \"how much did I send to X last month?\" → model calls your typed `query_ledger` tool (read-only, allow-listed, user-scoped) → grounded answer from real ledger data",
        "Guardrails: the model never writes to the ledger; destructive/ambiguous requests are refused or escalated",
        "Demonstrates the agent-safety story interviewers probe: hallucinated tool inputs handled, every tool call logged and traced",
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
        "DECISIONS.md in cli-todo, jobtrackr, and capstone",
        "Answer trade-off bank: JWT vs sessions, Redis vs Postgres cache, etc.",
        "Record one 5-minute decision explanation (audio or written)",
      ],
    },
  ],
  // Module 23: Job Hunt & Interview Preparation
  [
    {
      name: "🚩 Flagship 5 — `taka-flow` (Digital Wallet & Ledger Platform)",
      tier: "capstone",
      deliverables: [
        "Auth JWT+refresh, RBAC (user/agent/admin), KYC-stub flow, audit logs",
        "**Double-entry ledger** with Postgres transactions + row locking (`FOR UPDATE`); append-only entries, derived balances",
        "P2P transfers with **idempotency keys** (safe retries — no double spend), cash-in/cash-out flows",
        "**Correctness proof:** a concurrent k6/load test hammering transfers, then a reconciliation query proving **no money was created or destroyed** — this single artifact carries entire interviews",
        "Background workers (transaction receipts, notification emails), S3 statement exports",
        "Prometheus metrics + Grafana, structured logging, OpenTelemetry tracing across one full transfer",
        "Docker compose, CI/CD with security scans, AWS live URL, OpenAPI docs + tests >70%",
        "AI feature (M17, Phase C if time allows, else final polish): tool-calling finance assistant — read-only, allow-listed `query_ledger` tool, agent-safety guardrails",
        "Stretch (Phase D / post-offer): split ledger into an internal gRPC service (M15); K8s deploy via kind/k3s (M14)",
      ],
    },
    {
      name: "Job Hunt Launch Kit",
      tier: "advanced",
      deliverables: [
        "1-page backend resume with trade-off-driven bullets",
        "LinkedIn headline: *\"Go Backend Engineer | Cloud-Native APIs on AWS | Open to Remote (UTC+6)\"* — recruiters filter on exactly these words; timezone shows you understand remote logistics",
        "GitHub pinned: all 5 flagships (`jobtrackr`, `vaultdrop`, `hookrelay`, `pulsewatch`, `taka-flow`)",
        "Portfolio page or README index linking live demos — including the **pulsewatch status page monitoring the other flagships live**",
        "Application tracker (run it on your own `jobtrackr` — a great story); 5–10 quality apps/week plan",
        "**Cold/warm outreach: 10 personalized messages/week** to engineering managers/founders at Go-using companies (2 lines: \"I built [live link] which solves [problem your team has]; 60s demo here\")",
        "2+ technical articles published (Dev.to/LinkedIn); the ledger-correctness write-up is your flagship post",
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
