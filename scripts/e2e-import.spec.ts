/**
 * E2E test: import contacts via the signed-in browser UI.
 * Requires an already signed-in localhost session.
 * Run: npx playwright test scripts/e2e-import.spec.ts --headed
 */
import { test, expect } from "@playwright/test";
import { PLAYWRIGHT_BASE_URL } from "./test-base-url";

const BASE_URL = PLAYWRIGHT_BASE_URL;
const RUN_ID = `${Date.now()}`;

const EXPECTED_EMAILS = [
  `john.smith+${RUN_ID}@acme-import.test`,
  `sarah.jones+${RUN_ID}@acme-import.test`,
  `michael.brown+${RUN_ID}@globex-import.test`,
  `aisha.khan+${RUN_ID}@globex-import.test`,
  `lea.chen+${RUN_ID}@initech-import.test`,
  `omar.hassan+${RUN_ID}@initech-import.test`,
];

const EMAILS = EXPECTED_EMAILS.join("\n");

test("imports contacts directly through Convex without POSTing /api/import", async ({ page }) => {
  const apiImportRequests: string[] = [];
  const consoleErrors: string[] = [];

  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (request.method() === "POST" && pathname === "/api/import") {
      apiImportRequests.push(request.url());
    }
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(`${BASE_URL}/app/crm/contacts`);
  await page.waitForLoadState("networkidle");

  if (page.url().includes("/sign-in")) {
    test.skip(true, "Requires an already signed-in localhost session");
  }

  await page.getByRole("button", { name: "Import" }).click();
  await expect(
    page.getByRole("heading", { name: "Import Contacts" }),
  ).toBeVisible({ timeout: 5000 });

  if (await page.getByText("Sign in to import contacts.").isVisible().catch(() => false)) {
    test.skip(true, "Requires an already signed-in localhost session");
  }

  await page.getByRole("button", { name: "Emails" }).click();
  await page.locator("textarea").first().fill(EMAILS);
  await page.getByRole("button", { name: "Extract Contacts" }).click();

  await expect(page.getByText(/Found\s+6 contacts/)).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(6);

  await page.getByRole("button", { name: "Import 6 Contacts" }).click();
  await expect(page.getByText("Contacts Imported!")).toBeVisible({ timeout: 60000 });

  expect(apiImportRequests).toEqual([]);
  expect(
    consoleErrors.filter((message) => message.includes("/api/import") || message.includes("401")),
  ).toEqual([]);

  await page.waitForTimeout(2000);

  for (const email of EXPECTED_EMAILS) {
    await expect(page.getByText(email, { exact: true })).toBeVisible({ timeout: 10000 });
  }
});
