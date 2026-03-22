# Monolith Industries

**Production-grade Next.js starter template.**

Auth, database, background jobs, error monitoring, analytics, design system, and tooling — all wired up and ready to build on.

## What's Included

- **Auth** — Supabase Auth with magic link/OTP, separate signup + login pages, shared `useOtpFlow` hook with resend cooldown
- **Database** — Supabase Postgres via Drizzle ORM, empty schema ready for your tables
- **Background Jobs** — pg-boss worker process scaffold, ready for job handlers
- **Error Monitoring** — Sentry with client/server/edge configs, session replay, tunnel route
- **Analytics** — Vercel Analytics + Speed Insights
- **Design System** — Tailwind v4 + shadcn/ui, zinc palette with indigo accent, design token architecture
- **Tooling** — ESLint, Prettier, Husky + lint-staged, madge (circular dep check), Vitest, Playwright E2E
- **E2E Tests** — Playwright auth flow tests against real local Supabase

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│  Vercel          │     │  Railway (optional)   │
│  Next.js App     │     │  Worker (pg-boss)     │
│                  │     │  Background jobs      │
│  Dashboard (CSR) │     │                       │
│  API Routes      │     └──────────┬────────────┘
└────────┬─────────┘                │
         │                          │
         └──────────┬───────────────┘
                    │
         ┌──────────▼────────────┐
         │  Supabase Cloud       │
         │  - Postgres (Drizzle) │
         │  - Auth (magic link)  │
         │  - Storage (media)    │
         └───────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 24 LTS (pinned in `.nvmrc` — run `nvm use`)
- Docker Desktop (for local Supabase)

### Setup

```bash
git clone https://github.com/josheche/monolith-industries.git
cd monolith-industries
npm install
cp .env.example .env.local
```

### Start local Supabase

```bash
npx supabase start        # starts Postgres, Auth, Storage, Mailpit
npx supabase status        # shows URLs and keys → copy into .env.local
```

### Run

```bash
npm run dev      # Terminal 1: Next.js dev server (http://localhost:3000)
npm run worker   # Terminal 2: pg-boss background worker (optional)
```

### Local services

| Service          | URL                    |
| ---------------- | ---------------------- |
| App              | http://localhost:3000  |
| Supabase Studio  | http://127.0.0.1:54323 |
| Mailpit (emails) | http://127.0.0.1:54324 |
| Supabase API     | http://127.0.0.1:54321 |

## Environment Variables

Core (set in `.env.local` for dev, Vercel for production):

```env
NEXT_PUBLIC_SUPABASE_URL=       # from `npx supabase status`
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # from `npx supabase status`
SUPABASE_SERVICE_ROLE_KEY=      # from `npx supabase status`
DATABASE_URL=                   # postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Sentry (Vercel only):

```env
NEXT_PUBLIC_SENTRY_DSN=         # Sentry → Project Settings → Client Keys (DSN)
SENTRY_ORG=                     # Sentry organization slug
SENTRY_PROJECT=                 # Sentry project slug
SENTRY_AUTH_TOKEN=              # Sentry → Settings → Auth Tokens
```

## Scripts

```bash
npm run dev            # Next.js dev server (Turbopack)
npm run worker         # pg-boss background worker
npm run build          # production build
npm run lint           # ESLint
npm run format         # Prettier format all
npm run format:check   # Prettier check
npm test               # Vitest
npm run test:watch     # Vitest watch mode
npm run check:circular # madge circular dependency check
npx playwright test    # E2E auth flow tests
```

## Database

Schema is at `src/db/schema.ts` — starts empty. Add your tables:

```bash
npx drizzle-kit generate  # create migration from schema changes
npx drizzle-kit migrate   # apply migration
```

Never use `drizzle-kit push`. Never manage Supabase internal schemas (`auth`, `storage`).

## E2E Tests

Auth flow tests use Playwright against local Supabase (Mailpit for OTP extraction).

```bash
cp .env.test.example .env.test   # fill in from `npx supabase status`
npx playwright test              # requires local Supabase + dev server
```

## Tooling

### Code Quality Pipeline

Every commit runs through Husky + lint-staged:

```
git commit → Husky pre-commit hook
  ├── lint-staged
  │   ├── *.{ts,tsx} → eslint --fix → prettier --write
  │   └── *.{json,md,css} → prettier --write
  └── madge --circular (checks for circular dependencies)
```

### Prettier

No semicolons, single quotes, trailing commas, 100 char print width, 2-space tabs.

### ESLint

Flat config with Next.js Core Web Vitals + TypeScript + Prettier.

### TypeScript

Strict mode, `@/*` path alias to `./src/*`, bundler module resolution.

## Customization

1. **Brand:** Replace "Monolith Industries" in `src/app/page.tsx`, auth pages, and dashboard layout
2. **Accent color:** Swap indigo values in `src/app/globals.css` (`:root` and `.dark` blocks)
3. **Fonts:** Change fonts in `src/app/layout.tsx` via next/font
4. **Domain tables:** Add to `src/db/schema.ts`, run `drizzle-kit generate` + `drizzle-kit migrate`
5. **API routes:** Add under `src/app/api/`
6. **Background jobs:** Add handlers in `src/worker/jobs/`, register in `src/worker/index.ts`

## Deployment

### Vercel (app)

Auto-deploys on push to `main`.

### Railway (worker, optional)

- Start command: `npm run worker`
- Same env vars as Vercel

### Supabase (production)

1. Create cloud project at supabase.com
2. Run `npx drizzle-kit migrate` against the cloud DATABASE_URL
3. Set up SMTP in Authentication → SMTP Settings (Resend)
4. Set Site URL and Redirect URLs in Authentication → URL Configuration

## Tech Stack

Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Supabase (Postgres/Auth/Storage) · pg-boss · Sentry · Vercel Analytics · Vitest · Playwright
