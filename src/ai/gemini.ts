import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { reviewSchema, type Review } from "./schema.js";
import { SYSTEM_PROMPT, buildContents } from "./prompt.js";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

export async function reviewProject(description: string): Promise<Review> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(reviewSchema) as Record<string, unknown>,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned no text");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  const result = reviewSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Gemini response does not match the expected schema");
  }

  return result.data;
}
