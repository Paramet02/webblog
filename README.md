# paramet.notes

Personal blog + portfolio. Public site with reader-facing pages plus a built-in CMS for posts, works, comments, and media. Built on **Next.js 16 (App Router) + React 19 + Supabase** with a custom CSS-vars design system (no Tailwind utility classes — Tailwind is installed but only the `@import "tailwindcss"` base is used).

Owner: Paramet — `paramet.khing@gmail.com`

---

## Stack

| Layer        | Tech                                                       |
|--------------|------------------------------------------------------------|
| Framework    | Next.js 16.2.4 (App Router, RSC)                           |
| Runtime      | React 19.2.4                                               |
| Language     | TypeScript 5                                               |
| Data + Auth  | Supabase (Postgres + Auth + Storage)                       |
| Styling      | CSS custom properties in `src/app/globals.css` (412 lines) |
| Fonts        | `next/font/google` — IBM Plex Sans (Thai/Latin), Fraunces, Manrope, Sarabun, JetBrains Mono |

> ⚠ Heads-up: this repo uses Next.js 16, which has breaking changes vs. older Next.js. See `AGENTS.md` — always check `node_modules/next/dist/docs/` before changing routing, server-component, or caching code.

---

## Getting started

### 1. Environment

Create `.env.local` (already present in this checkout):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

### 2. Database

Run `supabase/schema.sql` in **Supabase → SQL Editor → New query**. It creates 5 tables (`posts`, `works`, `comments`, `media_items`, `activity_log`), enables Row Level Security, defines policies (public reads published rows; authenticated users have full access), and seeds demo content.

After running the schema, in Supabase go to **Authentication → Users → Invite user** and create the admin account (email + password) you will use to sign in at `/admin`.

### 3. Dev server

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 4. Build

```bash
npm run build
npm run start
```

---

## Project layout

```
D:/WebBlog/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── layout.tsx                # Root layout — fonts, StoreProvider, Nav, TweaksPanel
│   │   ├── page.tsx                  # Home / feed
│   │   ├── globals.css               # Full design system (CSS vars, components, dark mode)
│   │   ├── about/page.tsx
│   │   ├── tags/page.tsx             # Tags computed from posts
│   │   ├── search/page.tsx
│   │   ├── works/page.tsx
│   │   ├── article/[id]/page.tsx     # Single post
│   │   ├── project/[id]/page.tsx     # Single work
│   │   └── admin/page.tsx            # CMS shell — gates AdminLogin → AdminShell
│   ├── components/
│   │   ├── ClientApp.tsx             # ~2k lines — all page bodies + admin views
│   │   ├── Nav.tsx                   # Top nav (search, theme toggle)
│   │   ├── TweaksPanel.tsx           # Floating design-tweaks panel
│   │   ├── Icon.tsx                  # Inline SVG icon set
│   │   └── Thumb.tsx                 # Decorative thumbnail variants (v-code, v-design, …)
│   ├── lib/
│   │   ├── supabase.ts               # createClient — single shared instance
│   │   ├── db.ts                     # All CRUD + auth wrappers (the data API)
│   │   ├── data.ts                   # TS types: Post, Work, Comment, MediaItem, ActivityItem, Tag, StoreData
│   │   └── routes.ts                 # Route union + routeToPath()
│   └── providers/
│       └── StoreProvider.tsx         # React context — loads data on mount, holds tweaks + session
├── supabase/
│   └── schema.sql                    # Tables, RLS policies, seed data
├── public/, img/                     # Static assets
├── AGENTS.md                         # ⚠ Next.js 16 caveat for AI agents
├── CLAUDE.md                         # → AGENTS.md
└── next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
```

---

## Data model

All types live in `src/lib/data.ts`. Supabase row mappers (snake_case ↔ camelCase) live in `src/lib/db.ts`.

| Table          | Key fields                                                                 |
|----------------|----------------------------------------------------------------------------|
| `posts`        | id, title, slug, excerpt, content (markdown), tags[], date, status, featured |
| `works`        | id, title, subtitle, year, tags[], description, role, stack, duration, status |
| `comments`     | id, post_id (FK), author, content, date, status (pending/approved/spam)    |
| `media_items`  | id, name, type, size, date, url, storage_path                              |
| `activity_log` | id, type (publish/edit/draft/comment), text, when                          |

**RLS policy summary** (from `supabase/schema.sql`):

- Public can read `posts` only when `status = 'published'`.
- Public can read `comments` only when `status = 'approved'`, and can `INSERT` only when `status = 'pending'` (used by the comment form).
- Public can read all `works`.
- `media_items` and `activity_log` are admin-only.
- Authenticated users (admin) have full access on every table.

---

## State management

A single React context (`StoreProvider`) holds:

- `store: StoreData` — posts, works, comments, media, activity (fetched once on mount via `db.loadAllData()`)
- `tweaks: Tweaks` — accentHue, fontPair, cardVariant, heroVariant, density, dark — applied to `document.documentElement` as CSS custom properties and `data-*` attributes
- `bookmarks`, `likes` — Sets of post IDs (in-memory only; not persisted yet)
- `adminLoggedIn` — derived from `db.getSession()` on mount

Pages read with `useStore()` and mutate either through context callbacks (`addComment`, `toggleBookmark`, …) or by calling `db.upsertPost` etc. directly and updating `setStore` locally.

---

## Routing

URL-based routing via the App Router. The `Route` union in `src/lib/routes.ts` mirrors the shape, and `routeToPath(r)` produces the URL — pass `navigate` (a wrapper around `router.push(routeToPath(r))`) down to page components.

| Page             | Path                       |
|------------------|----------------------------|
| Home             | `/`                        |
| Article          | `/article/[id]`            |
| Works grid       | `/works`                   |
| Project detail   | `/project/[id]`            |
| About            | `/about`                   |
| Tags             | `/tags`                    |
| Search           | `/search?q=...`            |
| Admin            | `/admin`                   |

---

## Admin (CMS)

Visit `/admin`. If no Supabase session, `AdminLogin` shows a real email/password form that calls `supabase.auth.signInWithPassword`. Once signed in, `AdminShell` exposes:

- **Dashboard** — stat cards, monthly bar chart computed from real post dates, popular posts, activity feed
- **Posts** — table with filter / search / bulk publish-unpublish / delete / duplicate
- **Post editor** — 2-pane markdown editor + live preview, autosave indicator, SEO tab
- **Works / Work editor** — same pattern for the portfolio
- **Comments** — moderation queue (approve / spam / delete)
- **Media** — upload to Supabase Storage `media` bucket + grid view
- **Settings** — site config

Sign-out calls `supabase.auth.signOut()` then redirects home.

> The `media` storage bucket must exist in Supabase (Storage → New bucket → `media`, public). Uploads go to `<timestamp>-<rand>.<ext>`.

---

## Design system

Everything is driven by CSS variables in `src/app/globals.css`. Theming primitives:

- `--hue` — base hue (0–360); accent / panel / ink colors derive from it via `oklch()`
- `--accent`, `--panel`, `--ink`, `--ink-2`, `--ink-3`, `--line`, `--bg`
- `data-theme="dark"` on `<html>` flips the palette
- `data-font` (plex / manrope / sarabun), `data-card` (soft / minimal / cover), `data-hero` (split / center / minimal), `data-density` (comfy / compact) — all attribute selectors in `globals.css`

The floating **TweaksPanel** (bottom-right) writes these values into `document.documentElement` live. Not persisted yet — refresh resets to `DEFAULT_TWEAKS` in `StoreProvider`.

---

## Known gaps / TODO

- TweaksPanel selections aren't persisted across reloads (could write to localStorage or to a `user_settings` Supabase row).
- `bookmarks` / `likes` are in-memory only.
- `next/image` is not used yet — thumbnails are CSS-only `Thumb` variants; media-library images are rendered with raw `<img>`.
- Reading-progress bar in `ArticlePage` is rendered but not wired to scroll.
- No tests yet.

---

## Scripts

```
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
```
