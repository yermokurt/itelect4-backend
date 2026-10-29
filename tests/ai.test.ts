import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// ──────────────────────────────────────────────────────────────────
// Mock the DB connection so tests never touch MongoDB.
// The exact module path must match what app.ts imports.
// ──────────────────────────────────────────────────────────────────
vi.mock("../src/config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

// Import the app AFTER mocking so the mock is in place
let app: Awaited<typeof import("../src/app.js")>["default"];

beforeAll(async () => {
  const mod = await import("../src/app.js");
  app = mod.default;
});

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────
function makeToken(secret: string): string {
  return jwt.sign({ userId: "test-user-id" }, secret, { expiresIn: "1h" });
}

const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-for-ci";

// ──────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────
describe("POST /api/ai – authentication & validation", () => {
  it("returns 401 when no Authorization header is sent", async () => {
    const res = await request(app).post("/api/ai").send({ prompt: "Hello" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 401 when an invalid (unsigned) token is sent", async () => {
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", "Bearer this.is.not.a.valid.jwt")
      .send({ prompt: "Hello" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("returns 400 (validation) with a valid JWT but a too-short prompt", async () => {
    // Deliberately short: only 5 characters, below the 20-char minimum.
    // This proves auth passed (would be 401 otherwise) without calling Gemini.
    const token = makeToken(JWT_SECRET);

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ prompt: "Hi!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toContain(
      "prompt must be at least 20 characters after trimming"
    );
  });
});


