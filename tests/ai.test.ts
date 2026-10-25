// One file, one JWT-protected route: POST /api/ai. Supertest hands real
// HTTP requests to the real Express app from src/app.ts, without
// opening a port. No database and no Gemini call are needed.
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";

// app.ts awaits connectDB() in front of every route, and there is no
// database here or on GitHub's machine. This swaps the whole module for
// one whose connectDB does nothing. Vitest hoists vi.mock above the
// imports, so app.ts gets this version even though it is imported first.
vi.mock("../src/config/db.js", () => ({
  connectDB: async () => {},
}));

// A token made the way POST /api/auth/login makes one: same payload,
// same JWT_SECRET. No user has to exist; requireAuth only checks the
// signature.
function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "5m" });
}

const DESCRIPTION = "Black leather wallet lost near the library entrance.";

describe("POST /api/ai", () => {
  it("refuses a request with no token (401)", async () => {
    const res = await request(app).post("/api/ai").send({ prompt: DESCRIPTION });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token. Send Authorization: Bearer <token>");
  });

  it("refuses a token signed with a different secret (401)", async () => {
    const forged = jwt.sign({ userId: "someone" }, "not-the-real-secret");

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ prompt: DESCRIPTION });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through to the description check (400)", async () => {
    // "Lost wallet" is 11 characters, so aiRequestSchema refuses it
    // before adviseOnItem() runs: Gemini is never called.
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user")}`)
      .send({ prompt: "Lost wallet" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      "Describe the item in at least 20 characters.",
    ]);
  });
});
