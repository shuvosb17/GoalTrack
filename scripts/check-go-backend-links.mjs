import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const { GO_BACKEND_RESOURCE_LINKS } = await import(
  pathToFileURL(join(root, "src/lib/go-backend-resources/data.generated.ts")).href
);

const urls = new Map(); // url -> {title, source}
for (const links of Object.values(GO_BACKEND_RESOURCE_LINKS)) {
  for (const link of links) {
    if (!urls.has(link.url)) urls.set(link.url, link);
  }
}

console.log(`Checking ${urls.size} unique URLs...\n`);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

async function check(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    let res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    clearTimeout(t);
    return res.status;
  } catch (e) {
    clearTimeout(t);
    return `ERR:${e.cause?.code || e.name || e.message}`;
  }
}

const entries = [...urls.entries()];
const results = [];
const CONCURRENCY = 8;

for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY);
  const settled = await Promise.all(
    batch.map(async ([url, meta]) => {
      const status = await check(url);
      return { url, meta, status };
    })
  );
  results.push(...settled);
  process.stdout.write(`  checked ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length}\r`);
}

console.log("\n");

const bad = results.filter(
  (r) => typeof r.status === "string" || r.status >= 400
);

if (bad.length === 0) {
  console.log("All links OK.");
} else {
  console.log(`BROKEN (${bad.length}):\n`);
  for (const b of bad.sort((a, b) => String(a.status).localeCompare(String(b.status)))) {
    console.log(`  [${b.status}] ${b.url}  (${b.meta.title} — ${b.meta.source})`);
  }
}
