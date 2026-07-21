import "server-only";

import type { ChatMessage, ChatResponse, RecommendationItem } from "./chat-types";
import type { MovieDetail, MovieSummary } from "./types";
import { getMovieDetail, getTvDetail, searchMovies, searchTv } from "./tmdb";
import {
  getGeminiRecommendations,
  getGroundedAnswer,
  isAiEnabled,
  type GeminiFocus,
} from "./gemini";

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
 * Turn a full MovieDetail into a compact, verified facts block that the model
 * can ground its answer in. Only includes fields we actually have.
 * Exported for unit testing.
 */
export function buildFacts(detail: MovieDetail, mediaType: "movie" | "tv"): string {
  const lines: string[] = [];
  lines.push(`Title: ${detail.title}`);
  lines.push(`Type: ${mediaType === "tv" ? "TV series" : "Movie"}`);
  if (detail.releaseYear) lines.push(`Year: ${detail.releaseYear}`);
  if (detail.genres?.length) lines.push(`Genres: ${detail.genres.map((g) => g.name).join(", ")}`);
  if (detail.rating) lines.push(`Rating: ${detail.rating.toFixed(1)}/10 (${detail.voteCount} votes)`);
  if (detail.tagline) lines.push(`Tagline: ${detail.tagline}`);
  if (mediaType === "tv") {
    if (detail.numberOfSeasons) lines.push(`Seasons: ${detail.numberOfSeasons}`);
    if (detail.numberOfEpisodes) lines.push(`Episodes: ${detail.numberOfEpisodes}`);
  } else if (detail.runtime) {
    lines.push(`Runtime: ${detail.runtime} min`);
  }
  if (detail.directors?.length) {
    lines.push(`${mediaType === "tv" ? "Creator(s)" : "Director(s)"}: ${detail.directors.join(", ")}`);
  }
  if (detail.cast?.length) {
    const top = detail.cast
      .slice(0, 6)
      .map((c) => (c.character ? `${c.name} as ${c.character}` : c.name))
      .join("; ");
    lines.push(`Top cast: ${top}`);
  }
  if (detail.overview) lines.push(`Overview: ${detail.overview}`);
  return lines.join("\n");
}

/** Normalize a title for tolerant comparison (case, punctuation, spacing). */
function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Pick the best search result for a focus title. Prefers an exact (normalized)
 * title match, then a year match when a year hint is given, else the top hit.
 * Returns null when nothing looks like a confident match. Exported for testing.
 */
export function pickBestMatch(
  results: MovieSummary[],
  title: string,
  year: number | null,
): MovieSummary | null {
  if (!results.length) return null;
  const wanted = normalizeTitle(title);

  const exact = results.filter((r) => normalizeTitle(r.title) === wanted);
  const pool = exact.length ? exact : results;

  if (year != null) {
    const byYear = pool.find((r) => r.releaseYear === String(year));
    if (byYear) return byYear;
  }

  // With no exact match and no year confirmation, only trust the top hit if it
  // actually resembles the requested title — otherwise treat it as unresolved.
  if (!exact.length) {
    const top = results[0];
    const t = normalizeTitle(top.title);
    const resembles = t.includes(wanted) || wanted.includes(t);
    return resembles ? top : null;
  }

  return pool[0];
}

/**
 * Resolve the focus title to a real catalog entry and fetch its full details.
 * Returns both the linkable item (for a card) and the verified facts block.
 */
async function resolveFocus(
  focus: GeminiFocus,
): Promise<{ item: RecommendationItem; facts: string } | null> {
  const search = focus.type === "tv" ? searchTv : searchMovies;
  let best: MovieSummary | null;
  try {
    const found = await search({ query: focus.title, page: 1 });
    best = pickBestMatch(found.results, focus.title, focus.year);
  } catch {
    return null;
  }
  if (!best) return null;

  const item = toItem(best, focus.type);
  try {
    const detail =
      focus.type === "tv" ? await getTvDetail(item.id) : await getMovieDetail(item.id);
    if (!detail) return null;
    return { item, facts: buildFacts(detail, focus.type) };
  } catch {
    return null;
  }
}


/**
 * Main entry point: produce a conversational reply plus grounded, linkable
 * recommendations — or, when the user asks about a specific title, a factual
 * answer grounded in that title's real TMDB details.
 */
export async function recommendFromConversation(
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (!isAiEnabled) return fallbackRecommend(messages);

  try {
    const result = await getGeminiRecommendations(messages);

    // Resolve recommendation cards and (if any) the focused title concurrently
    // so the TMDB round-trips overlap instead of running back-to-back.
    const [resolved, focused] = await Promise.all([
      Promise.all(
        result.recommendations
          .slice(0, MAX_ITEMS)
          .map((r) => resolveTitle(r.title, r.type, r.reason)),
      ),
      result.focus ? resolveFocus(result.focus) : Promise.resolve(null),
    ]);
    let items = dedupe(resolved.filter((x): x is RecommendationItem => x !== null));

    // Question about a specific title: ground the answer in real TMDB details.
    if (focused) {
      // Show the focused title's card first, then any related picks.
      items = dedupe([focused.item, ...items]).slice(0, MAX_ITEMS);
      let reply = result.reply?.trim() || "";
      try {
        reply = await getGroundedAnswer(messages, focused.facts);
      } catch {
        // Grounding call failed — keep the model's first-pass reply.
      }
      if (!reply) {
        reply = `Here's what I know about ${focused.item.title}.`;
      }
      return { reply, items, aiGenerated: true };
    }

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
