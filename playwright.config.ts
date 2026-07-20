import { defineConfig, devices } from "@playwright/test";

// Mobile-focused end-to-end smoke tests. These run against a production build
// so behavior matches what ships. Uses Chromium device emulation only, so a
// single browser engine needs to be installed (`npx playwright install chromium`).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],

  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },

  projects: [
    {
      // Typical modern Android viewport.
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      // Small phone viewport — catches crowding/overflow on ~360px widths.
      name: "Mobile Chrome (small)",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 } },
    },
  ],

  // Build + serve the app on a dedicated port so the tests hit real routes and
  // never collide with a `next dev` server that may be running on :3000 (they
  // would otherwise fight over the shared .next directory). Always starts its
  // own server rather than reusing an external one.
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { NEXT_DIST_DIR: ".next-e2e", TMDB_API_KEY: "", TMDB_ACCESS_TOKEN: "" },
  },
});
