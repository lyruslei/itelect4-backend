import { Schema, model } from "mongoose";
import type { ItemDoc } from "../types/index.js";

const itemSchema = new Schema<ItemDoc>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [5, "Description must be at least 5 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      match: [/^[a-zA-Z0-9\s,.-]+$/, "Location can only contain alphanumeric characters and common punctuation"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["lost", "found", "claimed"],
        message: "Status must be either 'lost', 'found', or 'claimed'",
      },
      default: "lost",
    },
    reportedById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reported by user is required"],
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

itemSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Item = model<ItemDoc>("Item", itemSchema);
