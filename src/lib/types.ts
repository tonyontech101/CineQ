// Domain types used across the app. These are normalized shapes that the UI
// consumes, decoupled from the raw TMDB response format.

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  /** The role this actor plays. */
  character: string;
  profileUrl: string | null;
}

export interface CollectionSummary {
  id: number;
  name: string;
}

/** A movie franchise/collection with its member films. */
export interface Collection extends CollectionSummary {
  parts: MovieSummary[];
}

/** Lightweight movie shape used in grids/cards. */
export interface MovieSummary {
  id: number;
  title: string;
  /** Short overview, may be truncated for cards. */
  overview: string;
  /** Full poster URL (ready to render), or null when unavailable. */
  posterUrl: string | null;
  /** Full backdrop URL (used by the featured hero), or null. */
  backdropUrl: string | null;
  /** 0–10 average, one decimal. */
  rating: number;
  voteCount: number;
  releaseYear: string | null;
  genreIds: number[];
}

/** Full movie shape used on the detail page. */
export interface MovieDetail extends MovieSummary {
  tagline: string | null;
  runtime: number | null;
  genres: Genre[];
  releaseDate: string | null;
  /** ISO 639-1 language code, e.g. "en". */
  originalLanguage: string | null;
  /** e.g. "Released", "Post Production". */
  status: string | null;
  cast: CastMember[];
  /** Director name(s). */
  directors: string[];
  /** YouTube video key for the best trailer, or null. */
  trailerKey: string | null;
  /** Franchise this film belongs to, if any (parts fetched separately). */
  collection: CollectionSummary | null;
  /** TV only: total number of seasons. */
  numberOfSeasons?: number | null;
  /** TV only: total number of episodes. */
  numberOfEpisodes?: number | null;
}

/** Pseudo-genre ID for "Anime" — maps to Animation (ID 16) in queries. */
export const ANIME_GENRE_ID = 9999;

/** Trending item from TMDB's /trending/all endpoint — includes media_type. */
export interface TrendingMedia extends MovieSummary {
  media_type?: string;
}

export interface Paginated<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}
