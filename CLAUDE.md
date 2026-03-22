# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is Monolith Industries

A production-grade Next.js starter template. Auth, database, background jobs, error monitoring, analytics, design system, and tooling — all wired up and ready to build on.

## Dev Commands

```bash
npm run dev            # Next.js dev server (Turbopack)
npm run worker         # pg-boss background job worker (separate terminal)
npm run build          # production build (standalone output)
npm run lint           # ESLint
npm run format         # Prettier format all
npm run format:check   # Prettier check
npm test               # Vitest
npm run test:watch     # Vitest watch mode
npm run check:circular # madge circular dependency check
npx playwright test    # E2E auth flow tests (requires local Supabase + dev server)
```

## Database Commands

```bash
npx supabase start            # start local Supabase (requires Docker)
npx supabase stop             # stop local Supabase
npx supabase status           # show local URLs + keys
npx drizzle-kit generate      # generate migration from schema changes
npx drizzle-kit migrate       # apply pending migrations
```

Local Supabase services:

- Studio: http://127.0.0.1:54323
- Mailpit (email): http://127.0.0.1:54324
- API: http://127.0.0.1:54321

## Tech Stack

- **Runtime:** Node.js 24 LTS
- **Web:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui
- **API:** Next.js Route Handlers only — **no Server Actions**
- **Auth:** Supabase Auth (magic link/OTP only, separate signup + login pages)
- **DB:** Supabase Postgres via Drizzle ORM (`postgres` driver)
- **Storage:** Supabase Storage (private buckets, signed PUT/GET)
- **Background jobs:** pg-boss (separate long-lived Node worker process)
- **Testing:** Vitest + Playwright (E2E auth flows)
- **Observability:** Sentry (error monitoring + session replay), Vercel Analytics, Vercel Speed Insights
- **Code quality:** ESLint (flat config), Prettier (no semi, single quotes), Husky + lint-staged, madge

## Architecture — Two Processes

1. **Next.js standalone web server** — serves pages and API Route Handlers
2. **Worker process** (`npm run worker`) — pg-boss consumer for background jobs

Both processes connect to Supabase (Postgres, Auth, Storage).

## Key Architectural Rules

- **No Server Actions** — all mutations go through explicit REST-style Route Handlers
- **Dashboard is client-rendered** — client components with auth checks
- **Drizzle manages only application tables** — never touch Supabase internal schemas (`auth`, storage internals)
- **Migrations:** use `drizzle-kit generate` then `drizzle-kit migrate` — do not use `push`

## Auth Flow

- **Signup:** `/signup` → email → OTP → `/dashboard`
- **Login:** `/login` → email → OTP → `/dashboard`
- **Shared hook:** `src/hooks/use-otp-flow.ts` — OTP send/verify/resend with 60s cooldown
- **Users are managed in Supabase Auth** — no users/profiles table in Drizzle
- **No Server Actions for auth** — all auth through Supabase client library

## Design System

Neutral zinc palette with indigo accent. Swap accent color in `globals.css`.

- **Fonts:** configured via next/font in `layout.tsx` (display, sans, mono slots)
- **Colors:** zinc neutrals + indigo accent. Override in `globals.css` `@theme` block.
- **Design tokens:** defined via Tailwind v4 `@theme inline` block — content widths, radii, motion
- **shadcn overrides:** `:root` and `.dark` CSS variables

## Observability

- **Sentry:** error monitoring + session replay across client/server/edge. Tunnel route `/monitoring`. Config files: `src/instrumentation-client.ts`, `src/sentry.server.config.ts`, `src/sentry.edge.config.ts`, `src/instrumentation.ts`
- **Vercel Analytics + Speed Insights:** `<Analytics />` and `<SpeedInsights />` in root layout
- **Global error boundary:** `src/app/global-error.tsx`
- **Env vars (Vercel):** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

## Database

Schema is at `src/db/schema.ts` — starts empty. Add your tables, run `drizzle-kit generate`, then `drizzle-kit migrate`.

## Code Style

- No semicolons, single quotes, trailing commas, 100 char print width
- Route params are `Promise<>` in Next.js 16 — must `await params`
- `requireAuth()` returns `{ user, error }` — check error first, return early
- Zod validates all API inputs

## Customization

1. **Brand:** Replace "Monolith Industries" in landing, auth, and dashboard pages
2. **Accent color:** Swap indigo values in `globals.css` `:root` and `.dark` blocks
3. **Fonts:** Change fonts in `src/app/layout.tsx` via next/font
4. **Domain tables:** Add to `src/db/schema.ts`, generate + apply migrations
5. **API routes:** Add under `src/app/api/`
6. **Background jobs:** Register in `src/worker/index.ts`
