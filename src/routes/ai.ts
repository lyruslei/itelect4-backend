import { Router } from "express";
import type { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "@google/genai";
import { requireAuth } from "../middleware/auth.js";
import { aiRequestSchema } from "../schemas/itemAdvice.js";
import { adviseOnItem, AiReplyError } from "../ai/gemini.js";

const router = Router();

// Private, like items. Every call spends our Gemini quota, so an
// anonymous visitor must not be able to make one.
router.use(requireAuth);

// Five requests a minute per account. It sits below requireAuth, so
// req.userId exists when the limiter reads it -- the limit follows the
// account, not the shared campus Wi-Fi address.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req: Request) => req.userId!,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Five requests a minute is the limit. Try again shortly." },
});

router.use(aiLimiter);

router.post("/", async (req: Request, res: Response) => {
  // Checked before Gemini is called, so a bad body costs no quota.
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => issue.message),
    });
    return;
  }

  try {
    const advice = await adviseOnItem(parsed.data.prompt);
    res.status(200).json(advice);
  } catch (err) {
    // 429 from Gemini means the Google project's quota is used up --
    // not this API's own limit above.
    if (err instanceof ApiError && err.status === 429) {
      res.status(429).json({ message: "The AI quota is used up for now. Try again later." });
      return;
    }

    // Gemini refused, failed, or answered with something unusable. The
    // real reason goes to the log; the browser gets our own sentence.
    if (err instanceof ApiError || err instanceof AiReplyError) {
      console.error(err);
      res.status(502).json({ message: "The AI service did not answer properly. Try again." });
      return;
    }

    // Anything else is a bug in this app: app.ts's error handler.
    throw err;
  }
});

export const aiRouter = router;
