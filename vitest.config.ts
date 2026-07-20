import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // These suites cover pure helpers and mock-mode data logic — no DOM needed.
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
    // Force mock mode: unit tests must never hit the live TMDB API, regardless
    // of any key present in the developer's shell or .env files.
    env: {
      TMDB_API_KEY: "",
      TMDB_ACCESS_TOKEN: "",
    },
  },
  resolve: {
    alias: {
      // `@/...` matches the tsconfig path alias used across the app.
      "@": path.resolve(rootDir, "src"),
      // `server-only` throws outside an RSC build; stub it for Node tests.
      "server-only": path.resolve(rootDir, "test/stubs/server-only.ts"),
    },
  },
});
