import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { authRouter } from "./routes/auth.js";
import { itemsRouter } from "./routes/items.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      message: `"${err.value}" is not a valid id`,
    });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;
export { app };
