# Growth OS — Personal Learning Command Center

A premium Personal Growth Operating System for long-term skill development.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (Free)

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Framework: **Next.js** (auto-detected) → Deploy
4. Your app will be live at `https://your-app.vercel.app`

### After deploying — restore your data

Data is stored in the **browser** (IndexedDB), not on Vercel servers.

1. In your **old browser** (where you have progress): **Settings → Export Full Backup**
2. On **Vercel** (or any new browser): **Settings → Import Backup**

## Keep Your Data Safe

| Environment | Storage |
|-------------|---------|
| Chrome | Separate IndexedDB |
| Edge | Separate IndexedDB |
| Cursor browser | Separate IndexedDB |
| localhost vs vercel.app | Separate IndexedDB |

- **Auto-backup** saves to localStorage every 45 seconds (same browser only)
- **Export JSON** before switching browsers or deploying — this is your permanent backup
- Import JSON restores everything: progress, sessions, journal, achievements

## Import Markdown Structure

Go to **Settings → Import from Markdown**

### Into a Module
```markdown
## Golang
- Concurrency
- Goroutines
- Channels

## Databases
- PostgreSQL
- Indexing
```
`##` = Topic · `-` = Subtopic

### Into a Track (full hierarchy)
```markdown
# Backend Engineering
## Golang
- Concurrency

# DevOps
## Docker
- Containers
```
`#` = Module · `##` = Topic · `-` = Subtopic

## Tech Stack

Next.js 15 · TypeScript · TailwindCSS · Dexie (IndexedDB) · Zustand · Recharts · Framer Motion
