import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { connectDB } from "./config/db.js";
import { authRouter } from "./routes/auth.js";
import { claimsRouter } from "./routes/claims.js";
import { itemsRouter } from "./routes/items.js";
import { aiRouter } from "./routes/ai.js";

const app = express();

// SESSION 9: app.use(cors());
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o !== "");
app.use(cors({ origin: ALLOWED_ORIGINS }));

app.use(express.json());

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/items", itemsRouter);

// SESSION 11: private, rate limited, and the only route that talks to Gemini.
app.use("/api/ai", aiRouter);

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

