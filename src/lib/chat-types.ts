// Shared chat types used by both the client widget and the server route.
// Intentionally NOT server-only so the client component can import them.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** A grounded recommendation resolved to a real catalog title. */
export interface RecommendationItem {
  id: number;
  title: string;
  mediaType: "movie" | "tv";
  /** Ready-to-render poster URL, or null. */
  posterUrl: string | null;
  releaseYear: string | null;
  rating: number;
  /** Link to the detail page, e.g. "/movie/123" or "/tv/456". */
  href: string;
  /** Optional one-line rationale from the assistant. */
  reason?: string;
}

export interface ChatResponse {
  reply: string;
  items: RecommendationItem[];
  /** True when the reply came from the AI model; false for the fallback. */
  aiGenerated: boolean;
}
