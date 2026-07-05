/**
 * Generates src/lib/go-backend-resources/data.generated.ts
 * Run: node scripts/generate-go-backend-resources.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const { GO_BACKEND_PATH } = await import(
  pathToFileURL(join(root, "src/lib/go-backend-path.ts")).href
);

const L = (title, url, type, source) => ({ title, url, type, source });

/** Topic-level curated bundles (moduleIndex-topicIndex) */
const TOPIC_BUNDLES = {
  "0-0": [
    L("Process (computing)", "https://en.wikipedia.org/wiki/Process_(computing)", "doc", "Wikipedia"),
    L("How computers work (video)", "https://www.youtube.com/watch?v=EKWnGsjeIe8", "video", "Crash Course"),
  ],
  "0-1": [
    L("Linux command line basics", "https://ubuntu.com/tutorials/command-line-for-beginners", "doc", "Ubuntu"),
    L("Command line crash course", "https://www.youtube.com/watch?v=ZtqBQ68cfJc", "video", "freeCodeCamp"),
  ],
  "0-2": [
    L("Pro Git book", "https://git-scm.com/book/en/v2", "doc", "Git SCM"),
    L("Git & GitHub crash course", "https://www.youtube.com/watch?v=RGOj5yiz7l0", "video", "freeCodeCamp"),
  ],
  "0-3": [
    L("How the web works", "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works", "doc", "MDN"),
    L("HTTP overview", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", "doc", "MDN"),
  ],
  "0-4": [
    L("Cursor docs", "https://docs.cursor.com/welcome", "doc", "Cursor"),
    L("GitHub Copilot best practices", "https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot", "doc", "GitHub"),
    L("Claude Code overview", "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview", "doc", "Anthropic"),
  ],
  "1-0": [
    L("Install Go", "https://go.dev/doc/install", "doc", "go.dev"),
    L("Go modules reference", "https://go.dev/ref/mod", "doc", "go.dev"),
  ],
  "1-1": [
    L("Go basics", "https://go.dev/tour/basics/1", "doc", "A Tour of Go"),
    L("Effective Go", "https://go.dev/doc/effective_go", "doc", "go.dev"),
  ],
  "1-2": [
    L("Flow control in Go", "https://go.dev/tour/flowcontrol/1", "doc", "A Tour of Go"),
    L("Go by Example: if/for/switch", "https://gobyexample.com/if-else", "doc", "Go by Example"),
  ],
  "1-3": [
    L("Slices (official blog)", "https://go.dev/blog/slices-intro", "blog", "go.dev"),
    L("Go by Example: slices/maps", "https://gobyexample.com/slices", "doc", "Go by Example"),
  ],
  "1-4": [
    L("Functions in Go", "https://go.dev/tour/basics/4", "doc", "A Tour of Go"),
    L("Go by Example: functions", "https://gobyexample.com/functions", "doc", "Go by Example"),
  ],
  "1-5": [
    L("Methods and interfaces", "https://go.dev/tour/methods/1", "doc", "A Tour of Go"),
    L("Laws of Reflection", "https://go.dev/blog/laws-of-reflection", "blog", "go.dev"),
  ],
  "1-6": [
    L("Error handling in Go", "https://go.dev/blog/error-handling-and-go", "blog", "go.dev"),
    L("Go by Example: errors", "https://gobyexample.com/errors", "doc", "Go by Example"),
  ],
  "1-7": [
    L("Package names", "https://go.dev/blog/package-names", "blog", "go.dev"),
    L("Standard project layout", "https://github.com/golang-standards/project-layout", "doc", "golang-standards"),
  ],
  "1-8": [
    L("Generics tutorial", "https://go.dev/doc/tutorial/generics", "doc", "go.dev"),
    L("When to use generics", "https://go.dev/blog/intro-generics", "blog", "go.dev"),
  ],
  "2-0": [
    L("Concurrency in Go", "https://go.dev/tour/concurrency/1", "doc", "A Tour of Go"),
    L("Go concurrency patterns (video)", "https://www.youtube.com/watch?v=f6kdp27TYZs", "video", "Google I/O"),
  ],
  "2-1": [
    L("Channels", "https://go.dev/tour/concurrency/2", "doc", "A Tour of Go"),
    L("Go by Example: channels", "https://gobyexample.com/channels", "doc", "Go by Example"),
  ],
  "2-2": [
    L("sync package", "https://pkg.go.dev/sync", "doc", "pkg.go.dev"),
    L("Race detector", "https://go.dev/doc/articles/race_detector", "doc", "go.dev"),
  ],
  "2-3": [
    L("context package", "https://pkg.go.dev/context", "doc", "pkg.go.dev"),
    L("Go Concurrency Patterns: Context", "https://www.youtube.com/watch?v=LSzR0VEraLw", "video", "Google I/O"),
  ],
  "2-4": [
    L("Advanced Go concurrency", "https://go.dev/blog/pipelines", "blog", "go.dev"),
    L("Go by Example: worker pools", "https://gobyexample.com/worker-pools", "doc", "Go by Example"),
  ],
  "3-0": [
    L("Testing in Go", "https://go.dev/doc/tutorial/add-a-test", "doc", "go.dev"),
    L("Table-driven tests", "https://go.dev/wiki/TableDrivenTests", "doc", "go.dev wiki"),
  ],
  "3-1": [
    L("httptest package", "https://pkg.go.dev/net/http/httptest", "doc", "pkg.go.dev"),
    L("Testcontainers Go", "https://golang.testcontainers.org/", "doc", "Testcontainers"),
  ],
  "3-2": [
    L("Test-driven development", "https://martinfowler.com/bliki/TestDrivenDevelopment.html", "blog", "Martin Fowler"),
    L("Testify docs", "https://github.com/stretchr/testify", "doc", "GitHub"),
  ],
  "4-0": [
    L("HTTP reference", "https://developer.mozilla.org/en-US/docs/Web/HTTP", "doc", "MDN"),
    L("HTTP crash course", "https://www.youtube.com/watch?v=iYM2zFP3P0w", "video", "Traversy Media"),
  ],
  "4-1": [
    L("net/http package", "https://pkg.go.dev/net/http", "doc", "pkg.go.dev"),
    L("Writing Web Applications", "https://go.dev/doc/articles/wiki/", "doc", "go.dev"),
  ],
  "4-2": [
    L("REST API design", "https://restfulapi.net/", "doc", "restfulapi.net"),
    L("Microsoft REST guidelines", "https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md", "doc", "Microsoft"),
  ],
  "4-3": [
    L("Middleware pattern in Go", "https://www.alexedwards.net/blog/making-and-using-middleware", "blog", "Alex Edwards"),
    L("CORS explained", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", "doc", "MDN"),
  ],
  "4-4": [
    L("chi router", "https://go-chi.io/", "doc", "go-chi"),
    L("Gin framework docs", "https://gin-gonic.com/en/docs/", "doc", "Gin"),
  ],
  "4-5": [
    L("encoding/json", "https://pkg.go.dev/encoding/json", "doc", "pkg.go.dev"),
    L("Protocol Buffers overview", "https://protobuf.dev/overview/", "doc", "protobuf.dev"),
  ],
  "5-0": [
    L("Database design basics", "https://www.postgresql.org/docs/current/ddl.html", "doc", "PostgreSQL"),
    L("ER modeling intro", "https://www.lucidchart.com/pages/er-diagrams", "doc", "Lucidchart"),
  ],
  "5-1": [
    L("SQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html", "doc", "PostgreSQL"),
    L("SQLBolt interactive", "https://sqlbolt.com/", "course", "SQLBolt"),
  ],
  "5-2": [
    L("PostgreSQL documentation", "https://www.postgresql.org/docs/current/", "doc", "PostgreSQL"),
    L("Postgres transactions", "https://www.postgresql.org/docs/current/tutorial-transactions.html", "doc", "PostgreSQL"),
  ],
  "5-3": [
    L("database/sql tutorial", "https://go.dev/doc/tutorial/database-access", "doc", "go.dev"),
    L("pgx driver", "https://github.com/jackc/pgx", "doc", "GitHub"),
  ],
  "5-4": [
    L("golang-migrate", "https://github.com/golang-migrate/migrate", "doc", "GitHub"),
    L("DB migrations guide", "https://www.prisma.io/dataguide/types/relational/what-are-database-migrations", "doc", "Prisma"),
  ],
  "5-5": [
    L("Redis docs", "https://redis.io/docs/", "doc", "Redis"),
    L("Caching strategies", "https://aws.amazon.com/caching/best-practices/", "doc", "AWS"),
  ],
  "6-0": [
    L("OWASP Auth cheatsheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "doc", "OWASP"),
    L("JWT introduction", "https://jwt.io/introduction", "doc", "jwt.io"),
  ],
  "6-1": [
    L("Authorization cheatsheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html", "doc", "OWASP"),
    L("RBAC explained", "https://auth0.com/docs/manage-users/access-control/rbac", "doc", "Auth0"),
  ],
  "6-2": [
    L("OWASP Top 10", "https://owasp.org/www-project-top-ten/", "doc", "OWASP"),
    L("Web security fundamentals", "https://developer.mozilla.org/en-US/docs/Web/Security", "doc", "MDN"),
  ],
  "7-0": [
    L("Linux filesystem hierarchy", "https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html", "doc", "FHS"),
    L("File-system permissions", "https://en.wikipedia.org/wiki/File-system_permissions", "doc", "Wikipedia"),
  ],
  "7-1": [
    L("Manage Linux processes (ps/kill/nice)", "https://www.digitalocean.com/community/tutorials/how-to-use-ps-kill-and-nice-to-manage-processes-in-linux", "doc", "DigitalOcean"),
    L("File descriptors explained", "https://www.youtube.com/watch?v=6UZF3G0xP64", "video", "YouTube"),
  ],
  "7-2": [
    L("Manage systemd services", "https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units", "doc", "DigitalOcean"),
    L("cron guide", "https://crontab.guru/", "doc", "crontab.guru"),
  ],
  "7-3": [
    L("Vim interactive tutorial", "https://www.openvim.com/", "course", "OpenVim"),
    L("tmux cheat sheet", "https://tmuxcheatsheet.com/", "doc", "tmux"),
  ],
  "7-4": [
    L("SSH basics", "https://www.ssh.com/academy/ssh", "doc", "SSH Academy"),
    L("curl everything", "https://curl.se/docs/manual.html", "doc", "curl"),
  ],
  "7-5": [
    L("nginx beginner guide", "https://nginx.org/en/docs/beginners_guide.html", "doc", "nginx"),
    L("Reverse proxy with nginx", "https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy", "doc", "DigitalOcean"),
  ],
  "7-6": [
    L("tar manual", "https://man7.org/linux/man-pages/man1/tar.1.html", "doc", "man7"),
    L("Create & extract tar archives", "https://linuxize.com/post/how-to-create-and-extract-archives-using-the-tar-command-in-linux/", "doc", "Linuxize"),
  ],
  "7-7": [
    L("Bash scripting tutorial", "https://www.shellscript.sh/", "doc", "shellscript.sh"),
    L("Advanced Bash scripting", "https://tldp.org/LDP/abs/html/", "doc", "TLDP"),
  ],
  "8-0": [
    L("TCP/IP model", "https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/", "doc", "Cloudflare"),
    L("TCP vs UDP", "https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/", "doc", "Cloudflare"),
  ],
  "8-1": [
    L("How DNS works", "https://howdns.works/", "doc", "howdns.works"),
    L("TLS explained", "https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/", "doc", "Cloudflare"),
  ],
  "8-2": [
    L("HTTP/1.1 spec overview", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages", "doc", "MDN"),
    L("HTTP/2 explained", "https://www.cloudflare.com/learning/performance/http2-vs-http1.1/", "doc", "Cloudflare"),
  ],
  "8-3": [
    L("Load balancing intro", "https://www.nginx.com/resources/glossary/load-balancing/", "doc", "nginx"),
    L("Reverse proxies", "https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/", "doc", "Cloudflare"),
  ],
  "8-4": [
    L("WebSockets MDN", "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", "doc", "MDN"),
    L("gRPC concepts", "https://grpc.io/docs/what-is-grpc/core-concepts/", "doc", "gRPC"),
  ],
  "9-0": [
    L("Docker docs", "https://docs.docker.com/get-started/", "doc", "Docker"),
    L("Docker for Go apps", "https://docs.docker.com/language/golang/", "doc", "Docker"),
  ],
  "9-1": [
    L("Docker Compose", "https://docs.docker.com/compose/", "doc", "Docker"),
    L("Compose multi-container", "https://docs.docker.com/compose/gettingstarted/", "doc", "Docker"),
  ],
  "10-0": [
    L("Structured logging with slog", "https://go.dev/blog/slog", "blog", "go.dev"),
    L("Go slog package", "https://pkg.go.dev/log/slog", "doc", "pkg.go.dev"),
  ],
  "10-1": [
    L("Prometheus docs", "https://prometheus.io/docs/introduction/overview/", "doc", "Prometheus"),
    L("Four golden signals", "https://sre.google/sre-book/monitoring-distributed-systems/", "doc", "Google SRE"),
  ],
  "10-2": [
    L("OpenTelemetry Go", "https://opentelemetry.io/docs/languages/go/", "doc", "OpenTelemetry"),
    L("Health check patterns", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", "doc", "Kubernetes"),
  ],
  "10-3": [
    L("Background jobs in Go", "https://github.com/hibiken/asynq", "doc", "asynq"),
    L("Queue-based workloads", "https://aws.amazon.com/message-queue/", "doc", "AWS"),
  ],
  "10-4": [
    L("Kafka introduction", "https://kafka.apache.org/intro", "doc", "Apache Kafka"),
    L("NATS concepts", "https://docs.nats.io/nats-concepts/overview", "doc", "NATS"),
    L("Transactional outbox pattern", "https://microservices.io/patterns/data/transactional-outbox.html", "doc", "microservices.io"),
  ],
  "11-0": [
    L("Delve debugger", "https://github.com/go-delve/delve", "doc", "GitHub"),
    L("Debugging Go code", "https://go.dev/doc/diagnostics", "doc", "go.dev"),
  ],
  "11-1": [
    L("pprof profiling", "https://go.dev/blog/pprof", "blog", "go.dev"),
    L("Profiling Go programs", "https://go.dev/doc/diagnostics#profiling", "doc", "go.dev"),
  ],
  "11-2": [
    L("Benchmarking in Go", "https://pkg.go.dev/testing#hdr-Benchmarks", "doc", "pkg.go.dev"),
    L("Go performance tips", "https://github.com/dgryski/go-perfbook", "doc", "GitHub"),
  ],
  "12-0": [
    L("AWS cloud concepts", "https://aws.amazon.com/what-is-cloud-computing/", "doc", "AWS"),
    L("Shared responsibility", "https://aws.amazon.com/compliance/shared-responsibility-model/", "doc", "AWS"),
  ],
  "12-1": [
    L("AWS IAM", "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html", "doc", "AWS"),
    L("ECS on Fargate", "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html", "doc", "AWS"),
  ],
  "12-2": [
    L("Application Load Balancer", "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html", "doc", "AWS"),
    L("Route 53 overview", "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html", "doc", "AWS"),
  ],
  "12-3": [
    L("Terraform intro", "https://developer.hashicorp.com/terraform/tutorials/aws-get-started", "doc", "HashiCorp"),
    L("What is IaC", "https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac", "doc", "Red Hat"),
  ],
  "13-0": [
    L("CI/CD explained", "https://www.redhat.com/en/topics/devops/what-is-ci-cd", "doc", "Red Hat"),
    L("Continuous delivery", "https://martinfowler.com/bliki/ContinuousDelivery.html", "blog", "Martin Fowler"),
  ],
  "13-1": [
    L("GitHub Actions docs", "https://docs.github.com/en/actions", "doc", "GitHub"),
    L("Go CI workflow", "https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-go", "doc", "GitHub"),
  ],
  "13-2": [
    L("Deployment strategies", "https://martinfowler.com/bliki/BlueGreenDeployment.html", "blog", "Martin Fowler"),
    L("Feature flags", "https://martinfowler.com/articles/feature-toggles.html", "blog", "Martin Fowler"),
  ],
  "13-3": [
    L("AWS Secrets Manager", "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html", "doc", "AWS"),
    L("12-factor config", "https://12factor.net/config", "doc", "12factor"),
  ],
  "13-4": [
    L("golangci-lint", "https://golangci-lint.run/", "doc", "golangci-lint"),
    L("Go code review comments", "https://go.dev/wiki/CodeReviewComments", "doc", "go.dev wiki"),
  ],
  "14-0": [
    L("Kubernetes basics", "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "doc", "Kubernetes"),
    L("K8s concepts video", "https://www.youtube.com/watch?v=X48VuDVv0do", "video", "TechWorld with Nana"),
  ],
  "14-1": [
    L("ECS vs EKS", "https://aws.amazon.com/containers/services/", "doc", "AWS"),
    L("When to use Kubernetes", "https://kubernetes.io/docs/concepts/overview/", "doc", "Kubernetes"),
  ],
  "15-0": [
    L("Protocol Buffers", "https://protobuf.dev/programming-guides/proto3/", "doc", "protobuf.dev"),
    L("gRPC Go quickstart", "https://grpc.io/docs/languages/go/quickstart/", "doc", "gRPC"),
  ],
  "15-1": [
    L("gRPC Go tutorial", "https://grpc.io/docs/languages/go/basics/", "doc", "gRPC"),
    L("gRPC vs REST", "https://aws.amazon.com/compare/the-difference-between-grpc-and-rest/", "doc", "AWS"),
  ],
  "16-0": [
    L("Clean architecture", "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html", "blog", "Uncle Bob"),
    L("Go project structure", "https://go.dev/doc/modules/layout", "doc", "go.dev"),
  ],
  "16-1": [
    L("Scalability basics", "https://sre.google/sre-book/addressing-cascading-failures/", "doc", "Google SRE"),
    L("Caching best practices", "https://aws.amazon.com/caching/best-practices/", "doc", "AWS"),
  ],
  "16-2": [
    L("Timeouts and retries", "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", "doc", "AWS"),
    L("Circuit breaker pattern", "https://martinfowler.com/bliki/CircuitBreaker.html", "blog", "Martin Fowler"),
  ],
  "16-3": [
    L("System design primer", "https://github.com/donnemartin/system-design-primer", "doc", "GitHub"),
    L("System design (URL shortener)", "https://github.com/karanpratapsingh/system-design", "doc", "GitHub"),
  ],
  "17-0": [
    L("OpenAI API docs", "https://platform.openai.com/docs/api-reference", "doc", "OpenAI"),
    L("Anthropic API docs", "https://docs.anthropic.com/en/api/getting-started", "doc", "Anthropic"),
  ],
  "17-1": [
    L("Prompt engineering guide", "https://www.promptingguide.ai/", "doc", "promptingguide.ai"),
    L("OpenAI prompt best practices", "https://platform.openai.com/docs/guides/prompt-engineering", "doc", "OpenAI"),
  ],
  "17-2": [
    L("Embeddings guide", "https://platform.openai.com/docs/guides/embeddings", "doc", "OpenAI"),
    L("pgvector", "https://github.com/pgvector/pgvector", "doc", "GitHub"),
  ],
  "17-3": [
    L("Function calling", "https://platform.openai.com/docs/guides/function-calling", "doc", "OpenAI"),
    L("Model Context Protocol", "https://modelcontextprotocol.io/introduction", "doc", "MCP"),
  ],
  "17-4": [
    L("Building RAG apps", "https://www.pinecone.io/learn/retrieval-augmented-generation/", "blog", "Pinecone"),
    L("AI feature patterns", "https://martinfowler.com/articles/gen-ai-patterns/", "blog", "Martin Fowler"),
  ],
  "18-0": [
    L("Build-your-own-x (learn by reading)", "https://github.com/codecrafters-io/build-your-own-x", "doc", "GitHub"),
    L("Reading Go source", "https://go.dev/doc/contribute", "doc", "go.dev"),
  ],
  "18-1": [
    L("Go stdlib source", "https://cs.opensource.google/go/go/+/master:src/", "doc", "Google Source"),
    L("chi source code", "https://github.com/go-chi/chi", "doc", "GitHub"),
  ],
  "18-2": [
    L("Feynman learning technique", "https://fs.blog/feynman-technique/", "blog", "Farnam Street"),
    L("Zettelkasten method", "https://zettelkasten.de/introduction/", "blog", "Zettelkasten"),
  ],
  "19-0": [
    L("Technical writing course", "https://developers.google.com/tech-writing", "course", "Google"),
    L("Remote async communication", "https://about.gitlab.com/company/culture/all-remote/asynchronous/", "doc", "GitLab"),
  ],
  "19-1": [
    L("How to write a GitHub issue", "https://github.com/codecrafters-io/build-your-own-x/issues/1", "doc", "GitHub"),
    L("Writing good PRs", "https://github.blog/developer-skills/github/how-to-write-the-perfect-pull-request/", "blog", "GitHub"),
  ],
  "19-2": [
    L("RFC template", "https://github.com/golang/proposal/blob/master/design/TEMPLATE.md", "doc", "Go proposals"),
    L("Architecture decision records", "https://adr.github.io/", "doc", "ADR"),
  ],
  "19-3": [
    L("Effective remote communication", "https://about.gitlab.com/company/culture/all-remote/effective-communication/", "doc", "GitLab"),
    L("Giving technical demos", "https://speaking.io/", "blog", "speaking.io"),
  ],
  "20-0": [
    L("README best practices", "https://www.makeareadme.com/", "doc", "makeareadme"),
    L("Architecture decision records", "https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions", "blog", "Cognitect"),
  ],
  "20-1": [
    L("OpenAPI specification", "https://swagger.io/specification/", "doc", "OpenAPI"),
    L("swaggo for Go", "https://github.com/swaggo/swag", "doc", "GitHub"),
  ],
  "21-0": [
    L("First contributions", "https://firstcontributions.github.io/", "doc", "firstcontributions"),
    L("Up-for-grabs Go repos", "https://up-for-grabs.net/#/filters?language=Go", "doc", "Up For Grabs"),
  ],
  "21-1": [
    L("How to contribute to OSS", "https://opensource.guide/how-to-contribute/", "doc", "Open Source Guide"),
    L("Go contribution guide", "https://go.dev/doc/contribute", "doc", "go.dev"),
  ],
  "21-2": [
    L("PR tracking template", "https://github.com/othneildrew/Best-README-Template", "doc", "GitHub"),
    L("Open source metrics", "https://opensource.guide/metrics/", "doc", "Open Source Guide"),
  ],
  "22-0": [
    L("Software architecture guide", "https://martinfowler.com/architecture/", "blog", "Martin Fowler"),
    L("Mental models", "https://fs.blog/mental-models/", "blog", "Farnam Street"),
  ],
  "22-1": [
    L("JSON Web Token (JWT)", "https://en.wikipedia.org/wiki/JSON_Web_Token", "doc", "Wikipedia"),
    L("SQLite vs MySQL vs PostgreSQL", "https://www.digitalocean.com/community/tutorials/sqlite-vs-mysql-vs-postgresql-a-comparison-of-relational-database-management-systems", "doc", "DigitalOcean"),
  ],
  "22-2": [
    L("ADRs in practice", "https://github.com/joelparkerhenderson/architecture-decision-record", "doc", "GitHub"),
    L("Documenting decisions", "https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions", "blog", "Cognitect"),
  ],
  "23-0": [
    L("Developer resume examples", "https://github.com/resumejob/awesome-resume", "doc", "GitHub"),
    L("GitHub profile README", "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme", "doc", "GitHub"),
  ],
  "23-1": [
    L("Technical writing (overview)", "https://developers.google.com/tech-writing/overview", "course", "Google"),
    L("Building in public", "https://www.indiehackers.com/", "blog", "Indie Hackers"),
  ],
  "23-2": [
    L("Remote job boards", "https://remoteok.com/", "doc", "RemoteOK"),
    L("Wellfound jobs", "https://wellfound.com/", "doc", "Wellfound"),
  ],
  "23-3": [
    L("System design interview", "https://github.com/donnemartin/system-design-primer", "doc", "GitHub"),
    L("Go interview questions", "https://github.com/Devinterview-io/golang-interview-questions", "doc", "GitHub"),
  ],
};

/** Pattern-based primary links matched against subtopic text */
const PATTERNS = [
  { re: /git init|git clone/i, links: [L("git init", "https://git-scm.com/docs/git-init", "doc", "Git SCM")] },
  { re: /git add|commit|status|log|diff/i, links: [L("Recording changes", "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository", "doc", "Git SCM")] },
  { re: /branch|switch|merge/i, links: [L("Git branching", "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell", "doc", "Git SCM")] },
  { re: /push|pull|fetch|remote/i, links: [L("Working with remotes", "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes", "doc", "Git SCM")] },
  { re: /pull request|merge conflict/i, links: [L("GitHub flow", "https://docs.github.com/en/get-started/using-github/github-flow", "doc", "GitHub")] },
  { re: /pwd|`ls`|`\bcd\b`/i, links: [L("Navigation commands", "https://ubuntu.com/tutorials/command-line-for-beginners#1-overview", "doc", "Ubuntu")] },
  { re: /mkdir|touch|cp|mv|rm/i, links: [L("Linux command line for beginners", "https://ubuntu.com/tutorials/command-line-for-beginners", "doc", "Ubuntu")] },
  { re: /cat|less|head|tail/i, links: [L("View files (cat command)", "https://linuxhandbook.com/cat-command/", "doc", "Linux Handbook")] },
  { re: /pipe|redirection|`\|`|`>`/i, links: [L("Piping & redirection", "https://ryanstutorials.net/linuxtutorial/piping.php", "doc", "Ryan's Tutorials")] },
  { re: /grep|find/i, links: [L("grep manual", "https://man7.org/linux/man-pages/man1/grep.1.html", "doc", "man7")] },
  { re: /goroutine/i, links: [L("Goroutines", "https://go.dev/tour/concurrency/1", "doc", "A Tour of Go")] },
  { re: /channel/i, links: [L("Channels", "https://go.dev/tour/concurrency/2", "doc", "A Tour of Go")] },
  { re: /context/i, links: [L("context package", "https://pkg.go.dev/context", "doc", "pkg.go.dev")] },
  { re: /WaitGroup|Mutex|atomic|race/i, links: [L("sync package", "https://pkg.go.dev/sync", "doc", "pkg.go.dev")] },
  { re: /SELECT|INSERT|UPDATE|DELETE|JOIN/i, links: [L("SQL commands", "https://www.postgresql.org/docs/current/sql-commands.html", "doc", "PostgreSQL")] },
  { re: /postgres|psql|jsonb|ACID/i, links: [L("PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html", "doc", "PostgreSQL")] },
  { re: /redis/i, links: [L("Redis university", "https://university.redis.io/", "course", "Redis")] },
  { re: /JWT|bcrypt|session/i, links: [L("JWT handbook", "https://auth0.com/resources/ebooks/jwt-handbook", "doc", "Auth0")] },
  { re: /RBAC|AuthZ|AuthN/i, links: [L("RBAC", "https://en.wikipedia.org/wiki/Role-based_access_control", "doc", "Wikipedia")] },
  { re: /OWASP|XSS|CSRF|SQL injection/i, links: [L("OWASP cheatsheets", "https://cheatsheetseries.owasp.org/", "doc", "OWASP")] },
  { re: /docker|Dockerfile|compose/i, links: [L("Docker get started", "https://docs.docker.com/get-started/", "doc", "Docker")] },
  { re: /nginx/i, links: [L("nginx docs", "https://nginx.org/en/docs/", "doc", "nginx")] },
  { re: /systemd|journalctl|cron/i, links: [L("Understanding systemd units", "https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files", "doc", "DigitalOcean")] },
  { re: /ssh|scp|rsync/i, links: [L("SSH manual", "https://man.openbsd.org/ssh.1", "doc", "OpenBSD")] },
  { re: /vim|tmux/i, links: [L("Vim adventures", "https://vim-adventures.com/", "course", "Vim Adventures")] },
  { re: /prometheus|metrics|slog/i, links: [L("Prometheus Go client", "https://prometheus.io/docs/guides/go-application/", "doc", "Prometheus")] },
  { re: /pprof|Delve|profil/i, links: [L("Profiling Go", "https://go.dev/doc/diagnostics#profiling", "doc", "go.dev")] },
  { re: /terraform|CloudFormation|IaC/i, links: [L("Terraform learn", "https://developer.hashicorp.com/terraform/tutorials", "doc", "HashiCorp")] },
  { re: /GitHub Actions|workflow/i, links: [L("Actions quickstart", "https://docs.github.com/en/actions/quickstart", "doc", "GitHub")] },
  { re: /kubernetes|Pods|Ingress|Deployment/i, links: [L("K8s concepts", "https://kubernetes.io/docs/concepts/", "doc", "Kubernetes")] },
  { re: /gRPC|protobuf|\.proto/i, links: [L("gRPC Go", "https://grpc.io/docs/languages/go/", "doc", "gRPC")] },
  { re: /WebSocket/i, links: [L("WebSocket API", "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket", "doc", "MDN")] },
  { re: /DNS|TLS|TCP|UDP|NAT|HTTP/i, links: [L("Cloudflare Learning Center", "https://www.cloudflare.com/learning/", "doc", "Cloudflare")] },
  { re: /IAM|EC2|S3|RDS|ECS|CloudWatch|ALB|Route 53|ACM/i, links: [L("AWS documentation", "https://docs.aws.amazon.com/", "doc", "AWS")] },
  { re: /OpenAPI|Swagger|Postman/i, links: [L("OpenAPI guide", "https://swagger.io/docs/specification/about/", "doc", "Swagger")] },
  { re: /embedding|RAG|LLM|OpenAI|Anthropic/i, links: [L("OpenAI cookbook", "https://cookbook.openai.com/", "doc", "OpenAI")] },
  { re: /interface|generics|slice|map|struct|pointer/i, links: [L("Go by Example", "https://gobyexample.com/", "doc", "Go by Example")] },
  { re: /testing|benchmark|fuzz|httptest|Testify/i, links: [L("Go testing package", "https://pkg.go.dev/testing", "doc", "pkg.go.dev")] },
  { re: /net\/http|REST|middleware|chi|gin/i, links: [L("Building Go web apps", "https://go.dev/doc/articles/wiki/", "doc", "go.dev")] },
  { re: /database\/sql|sqlc|GORM|migration/i, links: [L("database/sql", "https://pkg.go.dev/database/sql", "doc", "pkg.go.dev")] },
];

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function resolveLinks(moduleIndex, topicIndex, subtopicName) {
  const key = `${moduleIndex}-${topicIndex}`;
  const bundle = TOPIC_BUNDLES[key] ?? [];
  const patternLinks = PATTERNS.flatMap((p) =>
    p.re.test(subtopicName) ? p.links : []
  );
  const primary = patternLinks[0] ?? bundle[0];
  const secondary = bundle.find((l) => l.url !== primary?.url) ?? bundle[1];
  const tertiary =
    bundle.find((l) => l.url !== primary?.url && l.url !== secondary?.url) ??
    L(
      "Go backend roadmap discussion",
      "https://www.reddit.com/r/golang/",
      "blog",
      "r/golang"
    );

  return dedupeLinks([primary, secondary, tertiary].filter(Boolean)).slice(0, 3);
}

const output = {};

GO_BACKEND_PATH.forEach((mod, mi) => {
  mod.topics.forEach((topic, ti) => {
    topic.subtopics.forEach((sub, si) => {
      const id = `m${mi}-t${ti}-s${si}`;
      output[id] = resolveLinks(mi, ti, sub);
    });
  });
});

const missing = Object.values(output).filter((links) => links.length === 0).length;
const total = Object.keys(output).length;

const fileContent = `// Auto-generated by scripts/generate-go-backend-resources.mjs — do not edit manually
import type { GoResourceLink } from "./types";

export const GO_BACKEND_RESOURCE_LINKS: Record<string, GoResourceLink[]> = ${JSON.stringify(output, null, 2)};
`;

writeFileSync(
  join(root, "src/lib/go-backend-resources/data.generated.ts"),
  fileContent,
  "utf8"
);

console.log(`Generated ${total} subtopic resource entries (${missing} empty).`);
