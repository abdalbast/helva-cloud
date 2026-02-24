# Helva Cloud

[![CI](https://github.com/abdalbast/helva-cloud/actions/workflows/ci.yml/badge.svg)](https://github.com/abdalbast/helva-cloud/actions/workflows/ci.yml)

Public landing page + private app launcher for internal Helva tools.

This repo demonstrates:
- A public marketing/launchpad surface (`/`)
- Auth-gated internal app routing (`/app/*`)
- A small ingestion API for usage telemetry
- A Postgres-backed analytics dashboard (OpenClaw usage)

## Apps

- OpenClaw Usage Dashboard: `/app/openclaw-usage`

## Tech Stack

- Next.js 16 (App Router)
- React 19
- NextAuth v5 (Google OAuth in production, dev fallback locally)
- Postgres (`postgres` client)
- Tailwind CSS v4
- Recharts (dashboard charts)

## Local Setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Run health checks (recommended):

```bash
pnpm check
```

4. Start the dev server:

```bash
pnpm dev
```

## Scripts

- `pnpm check` - local health check (env/config/deps sanity)
- `pnpm dev` - runs `check` first, then starts Next.js dev server
- `pnpm dev:raw` - starts Next.js dev server without pre-check
- `pnpm build` - production build
- `pnpm start` - run production server
- `pnpm lint` - ESLint

## Environment Variables

See `.env.example` for the canonical list.

Core variables:
- `NEXTAUTH_SECRET` - recommended locally, required in production
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - required for Google OAuth in production
- `HELVA_ALLOWED_EMAILS` - optional comma-separated allowlist
- `DATABASE_URL` - required for ingest + populated dashboard data
- `HELVA_COLLECTOR_TOKEN` - shared secret for collector -> ingest route

Local development behavior:
- If Google OAuth vars are missing, the app uses a dev-only credentials login fallback so the app can still boot.
- If `DATABASE_URL` is missing, the OpenClaw dashboard renders a setup message instead of crashing.

## Architecture Overview

- `src/app/` - App Router pages/layout/routes
- `src/auth.ts` - NextAuth configuration and sign-in policy
- `src/lib/db.ts` - Postgres client factory
- `src/app/api/ingest/openclaw/route.ts` - authenticated ingestion endpoint
- `collector/openclaw-collector.mjs` - local JSONL collector that uploads usage events
- `sql/schema.sql` - database schema for usage tracking
- `scripts/check.mjs` - developer health-check script

## Data Ingestion (Collector)

The web app does not read local files directly. A local collector reads OpenClaw session JSONL files and posts sanitized usage events to the Helva Cloud ingest endpoint.

Quick run:

```bash
HELVA_INGEST_URL="https://helva.cloud/api/ingest/openclaw" \
HELVA_COLLECTOR_TOKEN="..." \
node collector/openclaw-collector.mjs
```

More details: `collector/README.md`

## Deploy (Vercel)

1. Create a Vercel project from this repo
2. Set environment variables in Vercel (Project -> Settings -> Environment Variables)
3. Create a Postgres database and run `sql/schema.sql`
4. Deploy

## Development Workflow

- Run `pnpm check` before opening a PR
- Keep commits small and focused (one logical change per commit)
- Prefer descriptive commit messages (`feat:`, `fix:`, `docs:`, `chore:`)
- Document env/config changes in `.env.example` and `README.md`
- CI (GitHub Actions) runs `pnpm check` and `pnpm lint` on pushes and pull requests

See `CONTRIBUTING.md` for conventions.

<!-- deploy-check: 2026-02-04T13:41:03Z -->
