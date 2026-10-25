// The sample claims that npm run seed writes to Atlas. No database here:
// validateSync() runs the Claim schema's rules in memory.
import { describe, it, expect } from "vitest";
import { Claim } from "../src/models/Claim.js";
import { CLAIMS } from "../src/data/claims.js";

describe("sample claims for npm run seed", () => {
  it("has enough claims for the Claims page to show every status", () => {
    expect(CLAIMS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(CLAIMS.map((c) => c.status)).size).toBe(3);
  });

  it("passes the Claim schema for every claim", () => {
    for (const claim of CLAIMS) {
      expect(new Claim(claim).validateSync()).toBeUndefined();
    }
  });

  it("never repeats an itemId + claimantId pair", () => {
    // seed.ts upserts on exactly this pair, so a repeat would silently
    // overwrite the earlier claim instead of adding a new one.
    const keys = CLAIMS.map((c) => `${c.itemId}:${c.claimantId}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
