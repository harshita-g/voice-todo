import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractTodos(rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `You are a task extraction assistant.
Extract discrete TODO tasks from the user's input.
Return ONLY a JSON array of strings — no markdown, no explanation, no code fences.
Capitalize properly. Keep tasks concise but complete.

Example input: "remind me to call mom and buy groceries also submit report"
Example output: ["Call mom","Buy groceries","Submit report"]

Input: ${rawText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  console.log("Gemini raw response:", text);

  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
    // If Gemini returned an object instead of array
    return [rawText];
  } catch (err) {
    console.error("Failed to parse Gemini response:", clean);
    // Fall back to treating the whole input as one task
    return [rawText];
  }
}