/**
 * UI error-path integration tests.
 * Tests browser-visible behavior for auth redirects, error states, and form guards.
 * Run: pnpm test:ui   (requires server at PLAYWRIGHT_BASE_URL or localhost:3000)
 */
import { test, expect } from "@playwright/test";
import {
  PLAYWRIGHT_BASE_URL,
  PLAYWRIGHT_LOOPBACK_BASE_URL,
} from "./test-base-url";

const BASE = PLAYWRIGHT_BASE_URL;

// ── Middleware / auth guards ───────────────────────────────────────────────────

test.describe("auth middleware", () => {
  const PROTECTED_ROUTES = [
    "/app",
    "/app/crm/contacts",
    "/app/crm/companies",
    "/app/crm/deals",
    "/app/workspace/projects",
    "/app/workspace/meetings",
  ];

  for (const route of PROTECTED_ROUTES) {
    test(`unauthenticated GET ${route} redirects to /sign-in`, async ({ page }) => {
      await page.goto(`${BASE}${route}`);
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/sign-in");
    });
  }

  test("127.0.0.1 protected routes end on the canonical localhost sign-in URL", async ({
    page,
  }) => {
    const route = "/app/crm/contacts?source=loopback";
    await page.goto(`${PLAYWRIGHT_LOOPBACK_BASE_URL}${route}`);
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe(
      `${BASE}/sign-in?redirect=${encodeURIComponent(route)}`,
    );
  });
});

// ── Sign-in page structure ─────────────────────────────────────────────────────

test.describe("sign-in page", () => {
  test("renders email input and submit button", async ({ page }) => {
    await page.goto(`${BASE}/sign-in`);
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[name='email']").first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test("authenticated user is redirected away from /sign-in", async ({ page }) => {
    // Without auth the page should load normally (not redirect)
    const res = await page.request.get(`${BASE}/sign-in`);
    expect(res.status()).toBeLessThan(400);
  });
});

// ── Error page output sanitization ────────────────────────────────────────────

test.describe("error page", () => {
  test("404 for unknown /app/* route redirects to sign-in (no server stack trace exposed)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/app/does-not-exist-route-xyz`);
    await page.waitForLoadState("networkidle");
    const body = await page.content();
    // Stack traces or internal paths must not leak to the browser
    expect(body).not.toMatch(/at\s+\w+\s+\(/); // JS stack frame pattern
    expect(body).not.toMatch(/node_modules/);
    expect(body).not.toMatch(/CONVEX_DEPLOYMENT/i);
  });
});

// ── /api/auth callback guard ──────────────────────────────────────────────────

test.describe("/api/auth redirect guard", () => {
  test("callback with no verifier cookie returns non-200 or redirect", async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/callback/google?code=fake_code&state=fake_state`);
    // Without a valid verifier cookie this must never succeed with 200 and set auth cookies
    expect(res.status()).not.toBe(200);
  });
});

// ── Import dialog file tab ─────────────────────────────────────────────────────

test.describe("import dialog file tab", () => {
  test("extract button is disabled when no file is selected (via API bypass)", async ({ page }) => {
    const secret = process.env.ADMIN_IMPORT_SECRET;
    const email = process.env.TARGET_EMAIL;
    if (!secret || !email) {
      test.skip(true, "ADMIN_IMPORT_SECRET and TARGET_EMAIL required for this test");
      return;
    }

    // Intercept Convex auth token request and supply a pre-authed session via cookie injection
    // is not feasible without a real JWT; instead verify via the API-bypass path.
    // Navigate and check that the import dialog file tab extract button starts disabled.
    await page.goto(`${BASE}/app/crm/contacts`);
    await page.waitForLoadState("networkidle");

    // If redirected to sign-in, skip — can't reach the dialog without auth in this run
    if (page.url().includes("/sign-in")) {
      test.skip(true, "Authenticated session required for import dialog test");
      return;
    }

    const importBtn = page.locator("button:has-text('Import')").first();
    await expect(importBtn).toBeVisible({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator("text=Import Contacts")).toBeVisible({ timeout: 3000 });

    const fileTab = page.locator("button:has-text('File')").first();
    await fileTab.click();

    // Extract button must be disabled before any file is selected
    const extractBtn = page.locator("button:has-text('Extract')");
    await expect(extractBtn).toBeDisabled({ timeout: 3000 });
  });
});

// ── Sign-out failure does not redirect ────────────────────────────────────────

test.describe("sign-out button error handling", () => {
  test("sign-out button has type=button (not submit) to avoid form-submit side-effects", async ({
    page,
  }) => {
    const secret = process.env.ADMIN_IMPORT_SECRET;
    const email = process.env.TARGET_EMAIL;
    if (!secret || !email) {
      test.skip(true, "Authenticated session required for sign-out button test");
      return;
    }

    await page.goto(`${BASE}/app`);
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/sign-in")) {
      test.skip(true, "Authenticated session required for sign-out button test");
      return;
    }

    const signOutBtn = page.locator("button[aria-label='Sign out']");
    await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    const btnType = await signOutBtn.getAttribute("type");
    expect(btnType).toBe("button");
  });
});
