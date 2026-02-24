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

function readText(relPath) {
  return fs.readFileSync(path.join(cwd, relPath), "utf8");
}

function parseLlmTxtCanonicalRoutes(content) {
  const lines = content.split(/\r?\n/);
  const sectionStart = lines.findIndex((line) => line.trim() === "CANONICAL_PAGES");
  if (sectionStart === -1) {
    throw new Error("CANONICAL_PAGES section not found in public/llm.txt");
  }

  const routes = [];
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^[A-Z_]+$/.test(trimmed)) break;
    if (!trimmed.startsWith("- ")) continue;
    const item = trimmed.slice(2);
    const route = item.split(/\s+/)[0];
    if (route.startsWith("/")) {
      routes.push(route);
    }
  }
  return routes;
}

function parseLlmTxtScalar(content, sectionName) {
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.trim() === sectionName);
  if (idx === -1) return null;
  for (let i = idx + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^[A-Z_]+$/.test(trimmed)) return null;
    if (trimmed.startsWith("- ")) return trimmed.slice(2).trim();
  }
  return null;
}

function parseSitemapRoutes(content) {
  const routesMatch = content.match(/const routes = \[([\s\S]*?)\]\s+as const;/);
  if (!routesMatch) {
    throw new Error("could not find `const routes = [...] as const` in src/app/sitemap.ts");
  }
  return [...routesMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function parseExportedStringConstant(content, name) {
  const match = content.match(new RegExp(`export const ${name} = "([^"]+)";`));
  return match ? match[1] : null;
}

function routeToExpectedFile(route) {
  if (route === "/") return "src/app/page.tsx";
  if (route === "/llm.txt") return "public/llm.txt";
  const segments = route.slice(1).split("/");
  return path.join("src/app", ...segments, "page.tsx");
}

function compareLists(label, leftName, left, rightName, right) {
  const leftOnly = left.filter((item) => !right.includes(item));
  const rightOnly = right.filter((item) => !left.includes(item));
  if (leftOnly.length === 0 && rightOnly.length === 0) {
    ok(`${label} match (${left.length} items)`);
    return;
  }

  if (leftOnly.length) {
    err(`${label}: present only in ${leftName}: ${leftOnly.join(", ")}`);
  }
  if (rightOnly.length) {
    err(`${label}: present only in ${rightName}: ${rightOnly.join(", ")}`);
  }
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

  runLlmDocsParityChecks();

  return finish();
}

function runLlmDocsParityChecks() {
  if (!exists("public/llm.txt")) {
    err("public/llm.txt missing");
    return;
  }
  if (!exists("src/app/sitemap.ts")) {
    err("src/app/sitemap.ts missing");
    return;
  }
  if (!exists("src/lib/site.ts")) {
    err("src/lib/site.ts missing");
    return;
  }

  let llmContent;
  let sitemapContent;
  let siteContent;
  try {
    llmContent = readText("public/llm.txt");
    sitemapContent = readText("src/app/sitemap.ts");
    siteContent = readText("src/lib/site.ts");
  } catch (e) {
    err(`failed to read docs parity files: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }

  let llmRoutes = [];
  let sitemapRoutes = [];
  try {
    llmRoutes = parseLlmTxtCanonicalRoutes(llmContent);
    if (llmRoutes.length === 0) {
      err("public/llm.txt CANONICAL_PAGES section has no routes");
    } else {
      ok(`public/llm.txt CANONICAL_PAGES parsed (${llmRoutes.length} routes)`);
    }
  } catch (e) {
    err(e instanceof Error ? e.message : String(e));
  }

  try {
    sitemapRoutes = parseSitemapRoutes(sitemapContent);
    ok(`src/app/sitemap.ts routes parsed (${sitemapRoutes.length} routes)`);
  } catch (e) {
    err(e instanceof Error ? e.message : String(e));
  }

  if (llmRoutes.length && sitemapRoutes.length) {
    compareLists("llm.txt canonical routes vs sitemap routes", "llm.txt", llmRoutes, "sitemap.ts", sitemapRoutes);
  }

  for (const route of llmRoutes) {
    const expectedFile = routeToExpectedFile(route);
    if (exists(expectedFile)) {
      ok(`canonical route target exists (${route} -> ${expectedFile})`);
    } else {
      err(`canonical route target missing (${route} -> ${expectedFile})`);
    }
  }

  const llmLastUpdated = parseLlmTxtScalar(llmContent, "LAST_UPDATED");
  const llmVersion = parseLlmTxtScalar(llmContent, "VERSION");
  const siteLastUpdated = parseExportedStringConstant(siteContent, "DOCS_LAST_UPDATED");
  const siteVersion = parseExportedStringConstant(siteContent, "DOCS_VERSION");

  if (!llmLastUpdated) err("public/llm.txt LAST_UPDATED value missing");
  else ok(`public/llm.txt LAST_UPDATED found (${llmLastUpdated})`);
  if (!siteLastUpdated) err("src/lib/site.ts DOCS_LAST_UPDATED missing");
  if (llmLastUpdated && siteLastUpdated) {
    if (llmLastUpdated === siteLastUpdated) ok("LAST_UPDATED matches src/lib/site.ts");
    else err(`LAST_UPDATED mismatch (llm.txt=${llmLastUpdated}, src/lib/site.ts=${siteLastUpdated})`);
  }

  if (!llmVersion) err("public/llm.txt VERSION value missing");
  else ok(`public/llm.txt VERSION found (${llmVersion})`);
  if (!siteVersion) err("src/lib/site.ts DOCS_VERSION missing");
  if (llmVersion && siteVersion) {
    if (llmVersion === siteVersion) ok("VERSION matches src/lib/site.ts");
    else err(`VERSION mismatch (llm.txt=${llmVersion}, src/lib/site.ts=${siteVersion})`);
  }
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
