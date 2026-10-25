import type { ClaimDoc } from "../types/index.js";
import { ClaimStatus } from "../types/index.js";

// Sample claims for npm run seed. seed.ts upserts on itemId + claimantId,
// so every pair here must be unique (tests/claims-data.test.ts checks it).
export const CLAIMS: ClaimDoc[] = [
  {
    itemId: 101,
    claimantId: 1,
    status: ClaimStatus.Pending,
    createdAt: new Date("2026-07-29T00:00:00.000Z"),
    notes: "I left it there yesterday afternoon.",
  },
  {
    itemId: 102,
    claimantId: 2,
    status: ClaimStatus.Approved,
    createdAt: new Date("2026-10-06T01:30:00.000Z"),
    notes: "Showed my school ID; the name matched the card inside the wallet.",
  },
  {
    itemId: 103,
    claimantId: 3,
    status: ClaimStatus.Rejected,
    createdAt: new Date("2026-10-09T05:15:00.000Z"),
    notes: "Could not describe the lock screen photo or the phone case.",
  },
  {
    itemId: 104,
    claimantId: 4,
    status: ClaimStatus.Pending,
    createdAt: new Date("2026-10-14T03:45:00.000Z"),
  },
  {
    itemId: 105,
    claimantId: 2,
    status: ClaimStatus.Approved,
    createdAt: new Date("2026-10-18T07:00:00.000Z"),
    notes: "Knew the basketball keychain and the two small keys on the lanyard.",
  },
  {
    itemId: 106,
    claimantId: 5,
    status: ClaimStatus.Pending,
    createdAt: new Date("2026-10-22T02:20:00.000Z"),
  },
];
