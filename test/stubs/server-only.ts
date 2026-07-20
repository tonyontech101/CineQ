// Test stub for the `server-only` package.
//
// `server-only` intentionally throws when imported outside a React Server
// Component build. Our unit tests exercise the pure/mock-mode logic in
// `lib/tmdb.ts` directly in Node, so we alias the package to this no-op via
// vitest.config.ts.
export {};
