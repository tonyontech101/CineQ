import "server-only";

import type { ChatMessage } from "./chat-types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.GEMINI_API?.trim();
// gemini-2.5-flash is fast and available on the free tier. Override via env.
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** True when a Gemini key is configured; otherwise we use the rule-based fallback. */
export const isAiEnabled = Boolean(API_KEY);

// Describes the product so the model can answer questions about the site and
// stay on-task as a recommendation assistant.
const SYSTEM_PROMPT = `You are "Reel", the friendly recommendation assistant for CineQueue — a movie and TV show discovery website.

About CineQueue:
- Users browse and search movies and TV shows, filter by genre, year, and country, and open detail pages with cast, trailers, ratings, and a "Watch on…" chooser of external streaming sites.
- Users can save titles to a personal "My List".
- CineQueue hosts no video itself; it links out to third-party streaming sites.

Your job:
- Have a short, warm conversation and recommend movies and/or TV shows based on what the user describes (mood, favorite titles, genres, actors, occasions, etc.).
- Recommend REAL, well-known titles by their commonly known English name so they can be found in a movie database. Prefer exact official titles.
- Recommend between 3 and 6 titles unless the user asks for a specific number.
- If the user asks about how the site works, answer briefly using the info above.

Style:
- Keep the "reply" text concise (1-3 sentences), friendly, and conversational. Do NOT list the titles inside the reply text — the titles are returned separately and shown as cards.
- For each recommendation include a short "reason" (max ~12 words) explaining why it fits the request.
- Set "type" to "tv" for television series and "movie" for films.`;

interface GeminiRecommendation {
  title: string;
  type: "movie" | "tv";
  reason?: string;
}

export interface GeminiResult {
  reply: string;
  recommendations: GeminiRecommendation[];
}

// Structured-output schema so the model returns parseable JSON.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["movie", "tv"] },
          reason: { type: "string" },
        },
        required: ["title", "type"],
      },
    },
  },
  required: ["reply", "recommendations"],
};

/**
 * Sends the conversation to Gemini and returns a friendly reply plus a list of
 * recommended titles. Throws on any transport/parse failure so the caller can
 * fall back gracefully.
 */
export async function getGeminiRecommendations(
  messages: ChatMessage[],
): Promise<GeminiResult> {
  if (!API_KEY) throw new Error("GEMINI_API key is not configured");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response");

    const parsed = JSON.parse(text) as GeminiResult;
    return {
      reply: typeof parsed.reply === "string" ? parsed.reply : "",
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
            .filter((r) => r && typeof r.title === "string")
            .map((r) => ({
              title: r.title.trim(),
              type: r.type === "tv" ? "tv" : "movie",
              reason: typeof r.reason === "string" ? r.reason.trim() : undefined,
            }))
        : [],
    };
  } finally {
    clearTimeout(timeout);
  }
}
