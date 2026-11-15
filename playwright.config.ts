import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: ["**/frontend.spec.ts", "**/phase78.spec.ts"],
  fullyParallel: true,
  workers: 2,
  globalSetup: "./tests/browser/setup.ts",
  use: { baseURL: "http://127.0.0.1:5178", channel: "msedge", trace: "retain-on-failure", screenshot: "only-on-failure" },
})
