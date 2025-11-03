import { EarningsEvent, MacroEvent } from "@/types";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeWeekEvents(params: {
  macroEvents: MacroEvent[];
  watchlistEarnings: EarningsEvent[];
}): Promise<string> {
  const { macroEvents, watchlistEarnings } = params;

  // Package the raw data for the model. We’ll let the model filter for "this week"
  // based on the dates in the payload to keep the code lightweight and flexible.
  const payload = {
    macroEvents,
    watchlistEarnings,
  };

  // System prompt: keep the model focused on a concise, readable weekly recap.
  const system = [
    "You are Stock Pulse’s market recap writer.",
    "Your job is to produce ONE short paragraph (3–6 sentences) that summarizes the week’s key economic events and company earnings.",
    "Be professional but conversational, like a financial newsletter.",
    "Focus on: what happened, why it matters, and which items stood out.",
    "Do NOT list everything; synthesize and prioritize. No bullet points. No markdown headers.",
    "Length limit: one paragraph only.",
  ].join(" ");

  // User instruction that matches the prompt you liked.
  const instruction = [
    "I have an object containing economic events and company earnings for the month.",
    "Summarize only the events happening THIS WEEK in a single, concise paragraph.",
    "Make it digestible and narrative-like, as if it were a short market recap for investors.",
    "",
    "Focus on what’s happening, why it matters, and which companies or data releases stand out.",
    "",
    "Tone: professional but conversational (like a financial newsletter).",
    "",
    "Example output style:",
    "“This week was packed with major economic updates and big-name earnings. The week started with U.S. trade data… The Federal Reserve’s two-day FOMC meeting… The week wrapped with key inflation indicators…”",
  ].join("\n");

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: `${instruction}\n\nHere is the data (JSON):\n${JSON.stringify(payload, null, 2)}`,
    },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    response_format: { type: "text" },
    messages,
  });

  // Return the paragraph as-is. If the model returns nothing, fall back to a safe default.
  const text = completion.choices[0]?.message?.content?.trim();
  return text && text.length > 0
    ? text
    : "Quiet week on the calendar, with few market-moving events or notable earnings.";
}
