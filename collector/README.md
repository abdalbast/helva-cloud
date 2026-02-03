# OpenClaw Usage Collector (local)

This collector runs on your Mac and uploads OpenClaw per-response usage from JSONL logs to helva.cloud.

## Env vars

- `HELVA_INGEST_URL` = `https://helva.cloud/api/ingest/openclaw`
- `HELVA_COLLECTOR_TOKEN` = random secret token (same value as server env var)

Optional:
- `OPENCLAW_DIR` (default `~/.openclaw`)
- `OPENCLAW_SESSIONS_DIR` (default `~/.openclaw/agents/main/sessions`)
- `HELVA_COLLECTOR_INTERVAL_MS` (default 60000)

## Run

```bash
node collector/openclaw-collector.mjs
```

## LaunchAgent (recommended)

Create a LaunchAgent that sets env vars and runs the script on login.

(We’ll generate the exact plist once the Vercel project URL + token are set.)
