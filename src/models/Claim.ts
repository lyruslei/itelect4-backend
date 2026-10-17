import { Schema, model } from "mongoose";
import type { ClaimDoc } from "../types/index.js";
import { ClaimStatus } from "../types/index.js";

const claimSchema = new Schema<ClaimDoc>(
  {
    itemId: {
      type: Number,
      required: [true, "Item ID is required"],
      min: [1, "Item ID must be positive"],
    },
    claimantId: {
      type: Number,
      required: [true, "Claimant ID is required"],
      min: [1, "Claimant ID must be positive"],
    },
    status: {
      type: Number,
      enum: {
        values: [ClaimStatus.Pending, ClaimStatus.Approved, ClaimStatus.Rejected],
        message: "Status must be a valid ClaimStatus",
      },
      default: ClaimStatus.Pending,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

claimSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Claim = model<ClaimDoc>("Claim", claimSchema);
