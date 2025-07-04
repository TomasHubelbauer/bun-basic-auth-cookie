import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "bun start",
  },
});
