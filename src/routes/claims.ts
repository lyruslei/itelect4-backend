import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";

const router = Router();

interface IdParam {
  id: string;
}

router.get("/", async (_req: Request, res: Response) => {
  const claims = await Claim.find().sort({ createdAt: 1 });
  res.status(200).json(claims);
});

router.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const { id } = req.params;
  const claim = mongoose.isValidObjectId(id)
    ? await Claim.findById(id)
    : null;

  if (!claim) {
    res.status(404).json({ message: `No claim with id "${id}"` });
    return;
  }

  res.status(200).json(claim);
});

export const claimsRouter = router;
