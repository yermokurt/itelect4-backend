import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Set a fallback JWT_SECRET so tests pass even without a .env file.
    // The real secret is injected by GitHub Actions via the JWT_SECRET secret.
    env: {
      JWT_SECRET: process.env.JWT_SECRET ?? "test-secret-for-ci",
    },
  },
});
