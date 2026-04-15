# OpenClaw Usage Collector (local)

This collector runs on your Mac and uploads OpenClaw per-response usage from JSONL logs to helva.cloud.

It is designed to be:
- Incremental (tracks file offsets)
- Idempotent on replay (server upserts by session/message)
- Resilient to missing session dirs on fresh machines

## Env vars

- `HELVA_INGEST_URL` = `https://helva.cloud/api/ingest/openclaw`
- `HELVA_COLLECTOR_TOKEN` = random secret token (same value as server env var)

Optional:
- `OPENCLAW_DIR` (default `~/.openclaw`)
- `OPENCLAW_SESSIONS_DIR` (default `~/.openclaw/agents/main/sessions`)
- `HELVA_COLLECTOR_STATE_DIR` (default `~/.openclaw/usage-collector`)
- `HELVA_COLLECTOR_INTERVAL_MS` (default 60000)

## Run

```bash
node collector/openclaw-collector.mjs
```

The collector loops forever and polls for new events every `HELVA_COLLECTOR_INTERVAL_MS`.
If the sessions directory does not exist yet, it waits and retries on the next interval.

## How data is derived

- Reads `.jsonl` files from the OpenClaw sessions directory
- Extracts assistant message usage records
- Sends normalized event batches to `/api/ingest/openclaw`
- Persists progress in a local `state.json` file to avoid reprocessing

## LaunchAgent (recommended)

Create a LaunchAgent that sets env vars and runs the script on login.

(We’ll generate the exact plist once the Vercel project URL + token are set.)
