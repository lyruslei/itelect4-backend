import "dotenv/config";
import { adviseOnItem } from "./ai/gemini.js";

// npm run try-ai. One real request to Gemini from the terminal -- the
// same function POST /api/ai calls, with no Express, no token and no
// database. If this prints advice, the key, the model name and the
// schema all work.
async function tryAi() {
  const advice = await adviseOnItem(
    "Found a blue umbrella with a wooden handle outside the canteen " +
      "around lunch time today.",
  );
  console.log(JSON.stringify(advice, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
