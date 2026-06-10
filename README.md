# 🏏 Silly Point — Nepali cricket, lovingly roasted

A production-ready satirical cricket platform for Nepali cricket: match disasters, golden
ducks, dropped sitters, the memes they deserve — and an automated content pipeline that keeps
the site alive every day. **All love, zero malice**: the satire targets performances, never
people.

Built with **Next.js 16 (App Router, Cache Components/PPR, Turbopack)**, **TypeScript**,
**Tailwind CSS v4**, **ShadCN UI**, **Framer Motion**, **TanStack Query**, **Zod** and
**Appwrite** (TablesDB + Storage + Auth).

---

## Quick start

```bash
npm install
npm run migrate   # creates database, tables, indexes, storage buckets (idempotent)
npm run seed      # admin user, players, matches, posts, memes, reactions, rankings, polls
npm run dev       # http://localhost:3000
```

Before running, fill in `.env` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `APPWRITE_ENDPOINT` / `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint |
| `APPWRITE_PROJECT_ID` / `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project |
| `APPWRITE_API_KEY` | Server API key — scopes: **databases/tables, storage, users, sessions** |
| `APPWRITE_DATABASE_ID` | Database to create/use |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (SEO, sitemap, OG) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Admin account created by `npm run seed` |
| `CRICKET_API_KEY` | Optional [cricketdata.org](https://cricketdata.org) key for live match data |
| `CRON_SECRET` | Bearer token required by `/api/cron/ingest` |
| `AUTO_PUBLISH_GENERATED` | `true` = pipeline publishes immediately; otherwise → moderation queue |

Sign in at `/login` with the admin credentials to reach `/admin`.

## The automated content pipeline

The site is dynamic by design — `lib/ingestion/` runs every 6 hours (Vercel Cron via
`vercel.json`, route `/api/cron/ingest`) and on demand from **Admin → Settings → Run pipeline
now**, or locally with `npm run ingest`:

1. **Fetch** recent Nepal matches — CricketData API (if key set) with an ESPNcricinfo RSS
   fallback — and upsert them into the `matches` table.
2. **Analyze** the last 14 days of scorecards for incidents: golden ducks, ducks, collapses,
   slow crawls, nervous nineties, heartbreak losses, last-over heists.
3. **Generate** template-driven satire posts and fan reactions (no external AI needed),
   bump player meme scores, set trending flags, refresh monthly rankings.
4. **Revalidate** the relevant cache tags so the site updates immediately.

Deterministic row IDs make every step idempotent — re-runs never duplicate content.

## Architecture

```
app/                     # App Router pages (PPR + use-cache)
  page.tsx               # Home: hero, trending, disasters, players, reactions, memes,
                         #       leaderboard, articles, newsletter
  players/[slug]/        # Player profiles: stats, form, meme score, satire timeline
  posts/[slug]/          # Satire articles: JSON-LD, view tracking, likes, related
  memes/                 # Tabs + infinite scroll (TanStack Query) + uploads
  rankings/ matches/ community/ search/
  admin/                 # Dashboard, players CRUD, posts CRUD, moderation, settings
  api/cron/ingest/       # Scheduled pipeline (Bearer CRON_SECRET)
  api/memes/             # Paginated feed for infinite scroll
  sitemap.ts robots.ts opengraph-image.tsx
components/              # layout/, home/, shared/, memes/, community/, admin/, ui/ (shadcn)
lib/
  appwrite/              # server clients (admin/session/anon), config, file URL helpers
  services/              # cached reads: 'use cache' + cacheLife + cacheTag
  actions/               # server actions: auth, admin CRUD, community, view tracking
  ingestion/             # sources → analyzer → generator → pipeline
scripts/                 # migrate.ts, seed.ts, ingest.ts
proxy.ts                 # /admin cookie gate (Next 16 proxy, ex-middleware)
```

**Caching model (Next 16 Cache Components):** every read service is a `'use cache'` function
tagged via `cacheTag` (`players`, `posts`, `memes`, …) with `cacheLife("minutes")` — the ISR
equivalent. Mutations call `updateTag` (server actions) or `revalidateTag(tag, "max")` (cron)
so changes appear instantly while pages stay statically shelled and stream dynamic parts
behind `<Suspense>`.

**Data model (Appwrite TablesDB):** `players`, `matches`, `satire_posts`, `memes`,
`fan_reactions`, `rankings`, `polls`, `subscribers` — all defined in `scripts/migrate.ts`
with enums, unique slug indexes and fulltext search indexes (players.name, posts.title,
memes.title). Buckets: `player-images`, `post-images`, `meme-images`, `uploads`.

**Auth:** Appwrite email/password sessions. The login server action creates a session,
verifies the `admin` label, and stores the session secret in an httpOnly cookie. `proxy.ts`
bounces anonymous visitors off `/admin`; `requireAdmin()` re-verifies on every admin render.
Community submissions (memes, reactions) go through server actions into a moderation queue —
visitors never get write keys.

## Roles

- **Visitor** — browse everything, search, like/share memes, vote in polls, submit reactions
  and memes (moderated), subscribe to the newsletter.
- **Admin** — manage players and posts (CRUD + uploads), approve/reject submissions, feature
  content, run the pipeline, view analytics and users.

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Add every variable from `.env.example` in **Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL` to the production URL).
3. Deploy. `vercel.json` registers the cron job (`0 */6 * * *` → `/api/cron/ingest`);
   Vercel automatically sends `Authorization: Bearer $CRON_SECRET`.
4. Run `npm run migrate && npm run seed` once from your machine (they talk straight to
   Appwrite Cloud).

Self-hosting: `npm run build && npm run start`, plus any scheduler hitting
`GET /api/cron/ingest` with the bearer secret (or `npm run ingest` from cron).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Standard Next.js lifecycle (Turbopack) |
| `npm run migrate` | Create database, tables, columns, indexes, buckets (safe to re-run) |
| `npm run seed` | Admin user + sample content with generated SVG artwork (safe to re-run) |
| `npm run ingest` | Run the content pipeline from the CLI |
| `npm run lint` | ESLint |

## SEO & performance

Dynamic metadata + Open Graph + Twitter cards per page, Article/Person/WebSite JSON-LD,
generated OG image, `sitemap.xml` (includes every player and post), `robots.txt`, partial
prerendering with streamed Suspense boundaries, `next/image` optimization with remote
Appwrite patterns, pagination (posts) and infinite scroll (memes).
