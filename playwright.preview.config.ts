import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/browser", testMatch: "**/preview.spec.ts",
  outputDir: "test-results/preview",
  globalSetup: "./tests/browser/setup.ts",
  metadata: { preview: true },
  use: { baseURL: "http://127.0.0.1:5179", channel: "msedge" },
})
