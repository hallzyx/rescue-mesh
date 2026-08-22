import { defineConfig, devices } from "@playwright/test";

/**
 * Demo hackathon: ambos peers tienen que estar arriba.
 * Dist dirs separados (.next-a / .next-b) para que dos `next dev` no peleen.
 */
export default defineConfig({
  testDir: "./tests/demo",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:43147",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: [
    {
      command: "npm run dev:peer-a",
      url: "http://127.0.0.1:43147/api/p2p/status",
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: "npm run dev:peer-b",
      url: "http://127.0.0.1:43148/api/p2p/status",
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: "demo",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
