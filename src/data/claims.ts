import type { ClaimDoc } from "../types/index.js";
import { ClaimStatus } from "../types/index.js";

export const CLAIMS: ClaimDoc[] = [
  {
    itemId: 101,
    claimantId: 1,
    status: ClaimStatus.Pending,
    createdAt: new Date("2026-07-29T00:00:00.000Z"),
    notes: "I left it there yesterday afternoon.",
  },
];
