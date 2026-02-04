# helva.cloud

Public landing page + private app launcher.

## Apps

- OpenClaw Usage Dashboard: `/app/openclaw-usage`

## Setup (local)

```bash
cp .env.example .env.local
pnpm dev
```

## Deploy (Vercel)

1) Create a Vercel project from this repo
2) Set env vars in Vercel (Project → Settings → Environment Variables)
3) Create Postgres DB and run `sql/schema.sql`
4) Deploy

## Data ingestion

The web app does not read local files.
Run the local collector:

```bash
HELVA_INGEST_URL="https://helva.cloud/api/ingest/openclaw" \
HELVA_COLLECTOR_TOKEN="..." \
node collector/openclaw-collector.mjs
```

<!-- deploy-check: 2026-02-04T13:41:03Z -->
