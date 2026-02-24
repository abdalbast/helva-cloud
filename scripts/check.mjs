#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const state = {
  errors: [],
  warnings: [],
  infos: [],
};

function ok(msg) {
  console.log(`OK   ${msg}`);
}

function warn(msg) {
  state.warnings.push(msg);
  console.log(`WARN ${msg}`);
}

function err(msg) {
  state.errors.push(msg);
  console.log(`ERR  ${msg}`);
}

function info(msg) {
  state.infos.push(msg);
  console.log(`INFO ${msg}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function parseDotEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function exists(relPath) {
  return fs.existsSync(path.join(cwd, relPath));
}

function main() {
  console.log("Helva Cloud health check\n");

  const packagePath = path.join(cwd, "package.json");
  if (!fs.existsSync(packagePath)) {
    err("package.json not found (run this from the project root)");
    return finish();
  }
  ok("package.json found");

  const pkg = readJson(packagePath);
  if (pkg?.scripts?.dev === "next dev") {
    ok("dev script is configured (`next dev`)");
  } else if (pkg?.scripts?.dev === "pnpm dev:checked" && pkg?.scripts?.["dev:raw"] === "next dev") {
    ok("dev script is configured with pre-check wrapper (`pnpm dev:checked` -> `next dev`)");
  } else {
    warn(`unexpected dev script: ${JSON.stringify(pkg?.scripts?.dev)}`);
  }

  const majorNode = Number(process.versions.node.split(".")[0] || 0);
  if (majorNode >= 20) {
    ok(`Node.js version ${process.versions.node}`);
  } else {
    err(`Node.js ${process.versions.node} is too old (expected >= 20)`);
  }

  if (exists("pnpm-lock.yaml")) ok("pnpm lockfile found");
  else warn("pnpm-lock.yaml not found");

  if (exists(".env.example")) ok(".env.example found");
  else err(".env.example missing");

  const envLocalPath = path.join(cwd, ".env.local");
  let envLocal = {};
  if (fs.existsSync(envLocalPath)) {
    ok(".env.local found");
    try {
      envLocal = parseDotEnv(fs.readFileSync(envLocalPath, "utf8"));
      ok(".env.local parsed");
    } catch (e) {
      err(`failed to parse .env.local: ${e instanceof Error ? e.message : String(e)}`);
    }
  } else {
    warn(".env.local missing (copy from .env.example)");
  }

  if (exists("node_modules/.bin/next")) {
    ok("dependencies appear installed (`node_modules/.bin/next` exists)");
  } else if (exists("node_modules")) {
    err("node_modules exists but `next` binary is missing (partial/failed install?)");
  } else {
    err("dependencies not installed (`node_modules` missing). Run `pnpm install`.");
  }

  const hasGoogle = Boolean(envLocal.GOOGLE_CLIENT_ID) && Boolean(envLocal.GOOGLE_CLIENT_SECRET);
  if (hasGoogle) {
    ok("Google OAuth env vars are set");
  } else {
    info("Google OAuth env vars are not set (allowed in local dev via dev login fallback)");
  }

  if (envLocal.NEXTAUTH_SECRET) {
    ok("NEXTAUTH_SECRET is set");
  } else {
    warn("NEXTAUTH_SECRET is not set (recommended even in local dev)");
  }

  if (envLocal.DATABASE_URL) {
    ok("DATABASE_URL is set");
  } else {
    info("DATABASE_URL not set (`/app/openclaw-usage` will show a setup message)");
  }

  if (envLocal.HELVA_COLLECTOR_TOKEN) {
    ok("HELVA_COLLECTOR_TOKEN is set");
  } else {
    info("HELVA_COLLECTOR_TOKEN not set (ingest API route will return 500 until configured)");
  }

  if (exists("sql/schema.sql")) ok("database schema file found");
  else err("sql/schema.sql missing");

  if (exists("src/app/api/ingest/openclaw/route.ts")) ok("ingest route found");
  else err("ingest route missing");

  if (exists("src/app/api/auth/[...nextauth]/route.ts")) ok("auth route found");
  else err("auth route missing");

  return finish();
}

function finish() {
  console.log("");
  if (state.errors.length) {
    console.log(`Result: FAILED (${state.errors.length} error(s), ${state.warnings.length} warning(s))`);
    process.exitCode = 1;
    return;
  }
  console.log(`Result: PASS (${state.warnings.length} warning(s))`);
}

main();
