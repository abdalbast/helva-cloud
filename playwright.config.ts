import { defineConfig } from "@playwright/test";
import { PLAYWRIGHT_BASE_URL } from "./scripts/test-base-url";

export default defineConfig({
  testDir: "scripts",
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
  },
  reporter: [["list"]],
});
