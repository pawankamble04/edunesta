import dotenv from "dotenv";
dotenv.config(); // ✅ works locally + on Render

import { GoogleGenerativeAI } from "@google/generative-ai";

// Log only for local debugging
console.log(
  "🔑 GEMINI KEY INSIDE gemini.js:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

// ✅ Gemini is OPTIONAL (this is the key fix)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Confirmed working model
const MODEL = "models/gemini-2.5-flash";

export const askGemini = async (prompt) => {
  try {
    // If key missing, do NOT crash server
    if (!genAI) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return result.response.text();
  } catch (err) {
    console.error("🔥 GEMINI RUNTIME ERROR:", err?.message || err);
    return null; // ✅ NEVER throw
  }
};
