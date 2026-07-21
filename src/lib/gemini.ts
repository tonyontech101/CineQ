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
const SYSTEM_PROMPT = `You are "Reel", the friendly and knowledgeable movie & TV guide for CineQueue — a movie and TV show discovery website.

About CineQueue:
- Users browse and search movies and TV shows, filter by genre, year, and country, and open detail pages with cast, trailers, ratings, and a "Watch on…" chooser of external streaming sites.
- Users can save titles to a personal "My List".
- CineQueue hosts no video itself; it links out to third-party streaming sites.

You can do two things:

1) RECOMMEND — when the user describes a mood, genre, actor, occasion, or a title they like, suggest 3 to 6 REAL, well-known titles (unless they ask for a specific number). Use each title's commonly known English name so it can be found in a movie database; prefer exact official titles.

2) ANSWER QUESTIONS about a specific movie or TV show — plot/premise, cast, creators, release year, genre, themes, why it's notable, where it fits in a franchise, etc. When the user asks about a particular title (e.g. "tell me more about Start-Up", "what is Interstellar about?", "who's in The Bear?"), set the "focus" field to that title so the app can pull accurate details from its database. You may still add a few related recommendations if it's natural, but do NOT force recommendations onto a pure question.

Detecting intent:
- If the message is about ONE specific title, populate "focus" with { title, type, year } and keep "recommendations" short or empty. Include the release "year" whenever you know it (or the user implied it) to disambiguate remakes and same-named titles; omit it only if genuinely unsure.
- If the message asks for suggestions, leave "focus" empty and fill "recommendations".

Style:
- Keep "reply" friendly and conversational. For recommendations keep it to 1-3 sentences and do NOT list the titles in the reply text (they are shown as cards). For a question about a specific title, a concise, informative answer (up to ~5 sentences) is welcome — the app may refine it with real data.
- For each recommendation include a short "reason" (max ~12 words) explaining why it fits.
- Set "type" to "tv" for television series and "movie" for films.
- Be accurate. If you are unsure of a fact, say so rather than inventing details.`;

interface GeminiRecommendation {
  title: string;
  type: "movie" | "tv";
  reason?: string;
}

/** A specific title the user is asking about, used to ground the answer. */
export interface GeminiFocus {
  title: string;
  type: "movie" | "tv";
  /** Release year if the user implied one or the model is confident, else null. */
  year: number | null;
}

export interface GeminiResult {
  reply: string;
  recommendations: GeminiRecommendation[];
  /** Present when the user is asking about one specific title. */
  focus: GeminiFocus | null;
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
    focus: {
      type: "object",
      properties: {
        title: { type: "string" },
        type: { type: "string", enum: ["movie", "tv"] },
        year: { type: "integer" },
      },
      required: ["title", "type"],
    },
  },
  required: ["reply", "recommendations"],
};

// ---------------------------------------------------------------------------
// Low-level transport
// ---------------------------------------------------------------------------

interface CallOptions {
  systemPrompt: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  temperature: number;
  /** When provided, requests structured JSON output against this schema. */
  responseSchema?: unknown;
  /** Abort budget for the request; defaults to 20s. */
  timeoutMs?: number;
}

/**
 * Single-shot Gemini call. Returns the raw text of the first candidate.
 * Throws on any transport failure so callers can fall back gracefully.
 */
async function callGemini(opts: CallOptions): Promise<string> {
  if (!API_KEY) throw new Error("GEMINI_API key is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);

  try {
    const generationConfig: Record<string, unknown> = { temperature: opts.temperature };
    if (opts.responseSchema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = opts.responseSchema;
    }

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.systemPrompt }] },
        contents: opts.contents,
        generationConfig,
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
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function toContents(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * Normalize a raw parsed model payload into a safe GeminiResult. Exported for
 * unit testing; defensive against missing/oddly-typed fields.
 */
export function normalizeGeminiResult(parsed: unknown): GeminiResult {
  const p = (parsed ?? {}) as Partial<GeminiResult> & { focus?: Partial<GeminiFocus> };

  const focus =
    p.focus && typeof p.focus.title === "string" && p.focus.title.trim()
      ? {
          title: p.focus.title.trim(),
          type: p.focus.type === "tv" ? ("tv" as const) : ("movie" as const),
          year:
            typeof p.focus.year === "number" && Number.isFinite(p.focus.year)
              ? Math.trunc(p.focus.year)
              : null,
        }
      : null;

  return {
    reply: typeof p.reply === "string" ? p.reply : "",
    recommendations: Array.isArray(p.recommendations)
      ? p.recommendations
          .filter((r) => r && typeof r.title === "string")
          .map((r) => ({
            title: r.title.trim(),
            type: r.type === "tv" ? ("tv" as const) : ("movie" as const),
            reason: typeof r.reason === "string" ? r.reason.trim() : undefined,
          }))
      : [],
    focus,
  };
}

/**
 * Sends the conversation to Gemini and returns a friendly reply, a list of
 * recommended titles, and an optional "focus" title the user is asking about.
 * Throws on any transport/parse failure so the caller can fall back gracefully.
 */
export async function getGeminiRecommendations(
  messages: ChatMessage[],
): Promise<GeminiResult> {
  const text = await callGemini({
    systemPrompt: SYSTEM_PROMPT,
    contents: toContents(messages),
    temperature: 0.9,
    responseSchema: RESPONSE_SCHEMA,
  });

  return normalizeGeminiResult(JSON.parse(text));
}

// Grounds the answer strictly in the real title facts we pass in, so Reel can
// talk about a specific film/show accurately instead of guessing.
const GROUNDED_PROMPT = `You are "Reel", the friendly movie & TV guide for CineQueue.

The user asked about a specific title. You are given VERIFIED facts about that title from CineQueue's database, wrapped in <facts> tags. Answer the user's question using ONLY those facts plus widely-known general context.

Rules:
- Be warm, concise, and conversational (2-5 sentences).
- Do not contradict the facts. If a detail the user wants isn't in the facts, say you don't have that specific detail rather than inventing it.
- Don't dump the raw facts as a list — weave the relevant ones into a natural answer.
- You may mention that they can open the title's page on CineQueue for cast, trailer, and where to watch.`;

/**
 * Produce a natural-language answer about a specific title, grounded in the
 * verified facts string. Returns the reply text. Throws on transport failure.
 */
export async function getGroundedAnswer(
  messages: ChatMessage[],
  facts: string,
): Promise<string> {
  const contents = toContents(messages);
  // Append the verified facts as the final user turn so the model treats them
  // as authoritative context for its answer.
  contents.push({
    role: "user",
    parts: [{ text: `<facts>\n${facts}\n</facts>` }],
  });

  const text = await callGemini({
    systemPrompt: GROUNDED_PROMPT,
    contents,
    temperature: 0.5,
    timeoutMs: 12_000,
  });
  return text.trim();
}

