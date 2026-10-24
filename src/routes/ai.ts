import { Router, type Request, type Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { reviewRequestSchema } from "../ai/schema.js";
import { reviewProject } from "../ai/gemini.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.userId ?? ipKeyGenerator(req.ip ?? "unknown"),
  message: { message: "Too many AI requests. Try again in a minute." },
});

aiRouter.post("/", aiLimiter, async (req: Request, res: Response) => {
  const parsed = reviewRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => i.message);
    res.status(400).json({ message: "Validation failed", errors });
    return;
  }

  try {
    const review = await reviewProject(parsed.data.prompt);
    res.status(200).json(review);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";

    if (msg === "GEMINI_API_KEY is not configured") {
      console.error("GEMINI_API_KEY is not set in the environment");
      res.status(500).json({ message: "AI service is not configured" });
      return;
    }

    if (
      msg.includes("429") ||
      msg.toLowerCase().includes("resource exhausted") ||
      msg.toLowerCase().includes("quota")
    ) {
      console.error("Gemini quota/rate limit hit");
      res.status(429).json({ message: "AI service rate limit exceeded. Try again later." });
      return;
    }

    console.error("AI review failed:", msg);
    res.status(502).json({ message: "AI service unavailable" });
  }
});
