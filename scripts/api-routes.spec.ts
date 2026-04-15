/**
 * HTTP API integration tests.
 * These run against a live Next.js server (pnpm dev:raw or pnpm start).
 * Run: pnpm test:api   (requires server at PLAYWRIGHT_BASE_URL or localhost:3000)
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ── /api/import ───────────────────────────────────────────────────────────────

test.describe("/api/import", () => {
  test("rejects missing auth with 401", async ({ request }) => {
    const res = await request.post(`${BASE}/api/import`, {
      headers: { "Content-Type": "application/json" },
      data: { contacts: [] },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects bad JSON with 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/import`, {
      headers: { "Content-Type": "application/json" },
      data: "this is not json",
    });
    expect(res.status()).toBe(400);
  });

  test("rejects non-array contacts field with 400", async ({ request }) => {
    const secret = process.env.ADMIN_IMPORT_SECRET;
    const email = process.env.TARGET_EMAIL;
    if (!secret || !email) {
      test.skip(true, "ADMIN_IMPORT_SECRET and TARGET_EMAIL required for this test");
      return;
    }
    const res = await request.post(`${BASE}/api/import`, {
      headers: {
        "Content-Type": "application/json",
        "X-Import-Email": email,
        "X-Import-Secret": secret,
      },
      data: { contacts: "not-an-array" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/array/i);
  });

  test("rejects admin request with only one of the two required headers", async ({ request }) => {
    const res = await request.post(`${BASE}/api/import`, {
      headers: {
        "Content-Type": "application/json",
        "X-Import-Email": "user@test.com",
      },
      data: { contacts: [] },
    });
    expect(res.status()).toBe(400);
  });

  test("accepts admin request with empty contacts array and returns 200", async ({ request }) => {
    const secret = process.env.ADMIN_IMPORT_SECRET;
    const email = process.env.TARGET_EMAIL;
    if (!secret || !email) {
      test.skip(true, "ADMIN_IMPORT_SECRET and TARGET_EMAIL required for this test");
      return;
    }
    const res = await request.post(`${BASE}/api/import`, {
      headers: {
        "Content-Type": "application/json",
        "X-Import-Email": email,
        "X-Import-Secret": secret,
      },
      data: { contacts: [] },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ created: 0, skipped: 0, failed: 0 });
  });
});

// ── /api/ingest/openclaw ──────────────────────────────────────────────────────

test.describe("/api/ingest/openclaw", () => {
  const VALID_EVENT = {
    ts: "2025-01-01T00:00:00Z",
    provider: "openai",
    model: "gpt-4o",
    input_tokens: 100,
    output_tokens: 50,
    total_tokens: 150,
    cost_total: 0.01,
    session_id: "sess-test",
    message_id: "msg-test",
    latency_ms: 500,
  };

  test("rejects missing token with 401", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ingest/openclaw`, {
      headers: { "Content-Type": "application/json" },
      data: { events: [VALID_EVENT] },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects wrong token with 401", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ingest/openclaw`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-token-value",
      },
      data: { events: [VALID_EVENT] },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects invalid payload shape with 400", async ({ request }) => {
    const collectorToken = process.env.HELVA_COLLECTOR_TOKEN;
    if (!collectorToken) {
      test.skip(true, "HELVA_COLLECTOR_TOKEN required for this test");
      return;
    }
    const res = await request.post(`${BASE}/api/ingest/openclaw`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${collectorToken}`,
      },
      data: { events: "not-an-array" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns acknowledged count on valid request", async ({ request }) => {
    const collectorToken = process.env.HELVA_COLLECTOR_TOKEN;
    if (!collectorToken) {
      test.skip(true, "HELVA_COLLECTOR_TOKEN required for this test");
      return;
    }
    const res = await request.post(`${BASE}/api/ingest/openclaw`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${collectorToken}`,
      },
      data: { events: [VALID_EVENT, VALID_EVENT] },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, acknowledged: 2 });
  });
});

// ── /api/auth ─────────────────────────────────────────────────────────────────

test.describe("/api/auth", () => {
  test("GET returns 405 Method Not Allowed", async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth`);
    expect(res.status()).toBe(405);
  });

  test("POST with unknown action returns 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth`, {
      headers: { "Content-Type": "application/json" },
      data: { action: "auth:unknown" },
    });
    expect(res.status()).toBe(400);
  });
});
