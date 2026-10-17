import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Claim } from "./models/Claim.js";
import { CLAIMS } from "./data/claims.js";

async function seed() {
  await connectDB();
  for (const c of CLAIMS) {
    await Claim.updateOne({ itemId: c.itemId, claimantId: c.claimantId }, c, { upsert: true });
  }
  console.log(`${CLAIMS.length} claims in ${mongoose.connection.name}`);
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
