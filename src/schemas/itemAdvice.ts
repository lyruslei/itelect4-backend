import { z } from "zod";

// What a client is allowed to send to POST /api/ai. Checked before
// anything is sent to Gemini, because every request that reaches
// Gemini is counted against the free quota -- a request that was
// never going to work should cost nothing.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe the item in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

// What Gemini has to send BACK. This one schema is used three ways:
//   1. z.infer below turns it into the ItemAdvice type.
//   2. z.toJSONSchema at the bottom turns it into the JSON Schema
//      that is sent to Gemini with every request.
//   3. itemAdviceSchema.safeParse in src/ai/gemini.ts checks the reply.
// .describe() is not a comment: the text travels to Gemini inside
// the JSON Schema and tells the model what each field is for.
export const itemAdviceSchema = z.object({
  suggestedTitle: z
    .string()
    .describe("A short title for the item report, 3 to 50 characters."),
  summary: z
    .string()
    .describe("One sentence restating what was lost or found, and where."),
  category: z
    .enum(["electronics", "id-card", "clothing", "bag", "keys", "other"])
    .describe("The kind of item the report is about."),
  missingDetails: z
    .array(z.string())
    .max(3)
    .describe(
      "Details to add so the owner or finder can recognise the item. " +
        "Empty when quality is complete.",
    ),
  quality: z
    .enum(["complete", "needs-detail", "too-vague"])
    .describe("How useful the report is as written."),
});

export type ItemAdvice = z.infer<typeof itemAdviceSchema>;

// Computed once, when this file is first imported -- not per request.
export const itemAdviceJsonSchema = z.toJSONSchema(itemAdviceSchema);
