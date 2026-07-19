import "server-only";

import type { ChatMessage, ChatResponse, RecommendationItem } from "./chat-types";
import type { MovieSummary } from "./types";
import { searchMovies, searchTv } from "./tmdb";
import { getGeminiRecommendations, isAiEnabled } from "./gemini";

const MAX_ITEMS = 6;

function toItem(
  m: MovieSummary,
  mediaType: "movie" | "tv",
  reason?: string,
): RecommendationItem {
  return {
    id: m.id,
    title: m.title,
    mediaType,
    posterUrl: m.posterUrl,
    releaseYear: m.releaseYear,
    rating: m.rating,
    href: `/${mediaType}/${m.id}`,
    reason,
  };
}

/** Resolve a free-text title to a real catalog entry via TMDB search. */
async function resolveTitle(
  title: string,
  mediaType: "movie" | "tv",
  reason?: string,
): Promise<RecommendationItem | null> {
  const search = mediaType === "tv" ? searchTv : searchMovies;
  try {
    const results = await search({ query: title, page: 1 });
    const best = results.results[0];
    return best ? toItem(best, mediaType, reason) : null;
  } catch {
    return null;
  }
}

function dedupe(items: RecommendationItem[]): RecommendationItem[] {
  const seen = new Set<string>();
  const out: RecommendationItem[] = [];
  for (const item of items) {
    const key = `${item.mediaType}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * Rule-based fallback used when no AI key is configured or the model fails.
 * Searches the catalog directly using the user's latest message.
 */
async function fallbackRecommend(messages: ChatMessage[]): Promise<ChatResponse> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = (lastUser?.content ?? "").trim().slice(0, 120);

  let items: RecommendationItem[] = [];
  if (query) {
    const [movies, tv] = await Promise.all([
      searchMovies({ query, page: 1 }).catch(() => null),
      searchTv({ query, page: 1 }).catch(() => null),
    ]);
    const movieItems = (movies?.results ?? []).slice(0, 4).map((m) => toItem(m, "movie"));
    const tvItems = (tv?.results ?? []).slice(0, 2).map((m) => toItem(m, "tv"));
    items = dedupe([...movieItems, ...tvItems]).slice(0, MAX_ITEMS);
  }

  const reply = items.length
    ? "Here are some titles from our catalog that match what you mentioned. (AI recommendations are offline right now, so these are based on a direct search.)"
    : "I couldn't find matches for that. Try naming a genre, mood, or a movie you like — e.g. \"something like Interstellar\" or \"cozy mysteries\".";

  return { reply, items, aiGenerated: false };
}

/**
 * Main entry point: produce a conversational reply plus grounded, linkable
 * recommendations for the given conversation.
 */
export async function recommendFromConversation(
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (!isAiEnabled) return fallbackRecommend(messages);

  try {
    const result = await getGeminiRecommendations(messages);

    const resolved = await Promise.all(
      result.recommendations
        .slice(0, MAX_ITEMS)
        .map((r) => resolveTitle(r.title, r.type, r.reason)),
    );
    const items = dedupe(resolved.filter((x): x is RecommendationItem => x !== null));

    const reply =
      result.reply?.trim() ||
      (items.length
        ? "Here are a few picks I think you'll enjoy:"
        : "I'm not sure what to suggest yet — tell me a bit more about what you're in the mood for.");

    return { reply, items, aiGenerated: true };
  } catch {
    // Any AI failure (quota, network, parse) degrades to the catalog search.
    return fallbackRecommend(messages);
  }
}
