import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Item } from "../models/Item.js";

const router = Router();

router.use(requireAuth);

interface IdParam {
  id: string;
}

router.get("/", async (req: Request, res: Response) => {
  const items = await Item.find({ reportedById: req.userId }).sort({ reportedAt: -1 });
  res.status(200).json(items);
});

router.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const item = await Item.findOne({ _id: req.params.id, reportedById: req.userId });
  if (!item) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }
  res.status(200).json(item);
});

router.post("/", async (req: Request, res: Response) => {
  const item = await Item.create({
    ...req.body,
    reportedById: req.userId,
  });
  res.status(201).json(item);
});

router.patch("/:id", async (req: Request<IdParam>, res: Response) => {
  const { reportedById: _owner, ...updates } = req.body;
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, reportedById: req.userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!item) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }
  res.status(200).json(item);
});

router.delete("/:id", async (req: Request<IdParam>, res: Response) => {
  const item = await Item.findOneAndDelete({ _id: req.params.id, reportedById: req.userId });
  if (!item) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }
  res.status(204).send();
});

export const itemsRouter = router;
