import { z } from "zod";

export const reviewRequestSchema = z.object({
  prompt: z
    .string({ error: "prompt is required and must be a string" })
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(20, "prompt must be at least 20 characters after trimming")
        .max(2000, "prompt must be at most 2,000 characters after trimming")
    ),
});

export const reviewSchema = z.object({
  summary: z.string().min(1).max(500),
  strengths: z.array(z.string().min(1)).min(1).max(3),
  improvements: z.array(z.string().min(1)).min(1).max(3),
  readiness: z.enum(["ready", "almost", "not-yet"]),
});

export type Review = z.infer<typeof reviewSchema>;
