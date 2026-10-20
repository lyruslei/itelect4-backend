import { GoogleGenAI, type Content } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, EXAMPLES, wrap } from "./prompt.js";
import {
  itemAdviceSchema,
  itemAdviceJsonSchema,
  type ItemAdvice,
} from "../schemas/itemAdvice.js";

// The same shape as connectDB in src/config/db.ts: nothing happens
// when this file is imported. The client is made on the first call,
// so a missing key is a sentence on the first AI request -- not a
// crash for every route in the app.
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env, and to Vercel.");
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// The two examples become two finished exchanges -- a user turn, then
// the model's reply -- and the real description is the last turn.
function buildContents(description: string): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.description) }] },
    { role: "model", parts: [{ text: JSON.stringify(example.advice) }] },
  ]);
  return [...shots, { role: "user", parts: [{ text: wrap(description) }] }];
}

// Thrown when Gemini answered but the answer is unusable. The route
// turns it into a 502; anything else stays a 500.
export class AiReplyError extends Error {}

export async function adviseOnItem(description: string): Promise<ItemAdvice> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // JSON, in exactly this shape. Without these two lines the reply
      // is prose, and prose cannot be shown on the page field by field.
      responseMimeType: "application/json",
      responseJsonSchema: itemAdviceJsonSchema,
      // No temperature here, on purpose: Google's Gemini 3 guide says to
      // leave it at its default of 1.0.
    },
  });

  // undefined when there is no text at all -- for example a reply
  // blocked by Gemini's safety filters.
  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  // The schema was a request, and this is the check: nothing that
  // arrived over the network is ItemAdvice until it has been checked.
  const result = itemAdviceSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }
  return result.data;
}
