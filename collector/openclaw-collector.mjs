#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import readline from "node:readline";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const SESSIONS_DIR = process.env.OPENCLAW_SESSIONS_DIR || path.join(OPENCLAW_DIR, "agents", "main", "sessions");

const HELVA_INGEST_URL = process.env.HELVA_INGEST_URL; // e.g. https://helva.cloud/api/ingest/openclaw
const HELVA_COLLECTOR_TOKEN = process.env.HELVA_COLLECTOR_TOKEN;

if (!HELVA_INGEST_URL || !HELVA_COLLECTOR_TOKEN) {
  console.error("Missing HELVA_INGEST_URL or HELVA_COLLECTOR_TOKEN");
  process.exit(1);
}

const stateDir = process.env.HELVA_COLLECTOR_STATE_DIR || path.join(OPENCLAW_DIR, "usage-collector");
const statePath = path.join(stateDir, "state.json");

fs.mkdirSync(stateDir, { recursive: true });

/** @type {{ files: Record<string, { offset: number, sessionId?: string }> }} */
let state = { files: {} };
try {
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
} catch {}

function saveState() {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function listSessionLogs() {
  const entries = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".jsonl"));
  // Ignore lock files / others
  return entries.map((f) => path.join(SESSIONS_DIR, f));
}

function extractUsageEvent(lineObj, sessionId) {
  if (lineObj?.type !== "message") return null;
  const msg = lineObj.message;
  if (!msg || msg.role !== "assistant") return null;
  if (!msg.usage) return null;

  const u = msg.usage;
  const cost = msg.usage?.cost?.total;

  return {
    ts: msg.timestamp ? new Date(msg.timestamp).toISOString() : (lineObj.timestamp || new Date().toISOString()),
    provider: msg.provider || msg.api || "unknown",
    model: msg.model || "unknown",
    input_tokens: Number(u.input ?? 0),
    output_tokens: Number(u.output ?? 0),
    total_tokens: Number(u.totalTokens ?? (u.input ?? 0) + (u.output ?? 0)),
    cost_total: typeof cost === "number" ? cost : null,
    session_id: sessionId,
    message_id: String(lineObj.id || "unknown"),
    latency_ms: null,
  };
}

async function postEvents(events) {
  if (!events.length) return;
  const res = await fetch(HELVA_INGEST_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${HELVA_COLLECTOR_TOKEN}`,
    },
    body: JSON.stringify({ events }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ingest failed: ${res.status} ${text}`);
  }
}

async function processFile(filePath) {
  const st = fs.statSync(filePath);
  const key = path.basename(filePath);
  const fileState = state.files[key] || { offset: 0 };

  // Handle truncation/rotation
  if (fileState.offset > st.size) fileState.offset = 0;

  const stream = fs.createReadStream(filePath, { encoding: "utf8", start: fileState.offset });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let sessionId = fileState.sessionId;
  const batch = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }

    if (obj.type === "session" && obj.id) {
      sessionId = obj.id;
    }

    if (!sessionId) continue;

    const evt = extractUsageEvent(obj, sessionId);
    if (evt) batch.push(evt);

    if (batch.length >= 200) {
      await postEvents(batch.splice(0, batch.length));
    }
  }

  if (batch.length) await postEvents(batch);

  fileState.sessionId = sessionId;
  fileState.offset = st.size;
  state.files[key] = fileState;
  saveState();
}

async function runOnce() {
  const files = listSessionLogs();
  for (const f of files) {
    await processFile(f);
  }
}

async function main() {
  const intervalMs = Number(process.env.HELVA_COLLECTOR_INTERVAL_MS || 60000);
  while (true) {
    try {
      await runOnce();
    } catch (e) {
      console.error(e);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main();
