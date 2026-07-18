import "server-only";

import { cache } from "react";
import type {
  CastMember,
  Collection,
  Genre,
  MovieDetail,
  MovieSummary,
  Paginated,
} from "./types";
import { MOCK_GENRES, MOCK_MOVIES } from "./mock-data";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.TMDB_API_KEY?.trim();
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN?.trim();
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

/** True when live TMDB data is available; otherwise we serve mock data. */
export const isLiveData = Boolean(API_KEY || ACCESS_TOKEN);

const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";
const PROFILE_SIZE = "w185";

export function posterUrl(path: string | null, size = POSTER_SIZE): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

function backdropUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE}/${BACKDROP_SIZE}${path}` : null;
}

function profileUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE}/${PROFILE_SIZE}${path}` : null;
}

// ---------------------------------------------------------------------------
// Low-level fetch
// ---------------------------------------------------------------------------

interface TmdbRequestOptions {
  params?: Record<string, string | number | undefined>;
  /** ISR revalidation window in seconds. */
  revalidate?: number;
}

async function tmdbFetch<T>(
  path: string,
  { params = {}, revalidate = 60 * 60 }: TmdbRequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  // v3 key goes in the query string; v4 token goes in the Authorization header.
  if (!ACCESS_TOKEN && API_KEY) {
    url.searchParams.set("api_key", API_KEY);
  }
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { accept: "application/json" };
  if (ACCESS_TOKEN) headers.Authorization = `Bearer ${ACCESS_TOKEN}`;

  const res = await fetch(url, { headers, next: { revalidate } });

  if (!res.ok) {
    throw new Error(
      `TMDB request failed (${res.status} ${res.statusText}) for ${path}`,
    );
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Raw TMDB response shapes (only the fields we use)
// ---------------------------------------------------------------------------

interface RawCast {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order?: number;
}

interface RawCrew {
  id: number;
  name: string;
  job?: string;
}

interface RawVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
}

interface RawMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string | null;
  genre_ids?: number[];
  genres?: Genre[];
  tagline?: string;
  runtime?: number | null;
  original_language?: string;
  status?: string;
  belongs_to_collection?: { id: number; name: string } | null;
  credits?: { cast?: RawCast[]; crew?: RawCrew[] };
  videos?: { results?: RawVideo[] };
}

interface RawCollection {
  id: number;
  name: string;
  parts?: RawMovie[];
}

interface RawPaginated {
  page: number;
  results: RawMovie[];
  total_pages: number;
  total_results: number;
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function toSummary(m: RawMovie): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview ?? "",
    posterUrl: posterUrl(m.poster_path),
    backdropUrl: backdropUrl(m.backdrop_path),
    rating: Math.round((m.vote_average ?? 0) * 10) / 10,
    voteCount: m.vote_count ?? 0,
    releaseYear: m.release_date ? m.release_date.slice(0, 4) : null,
    genreIds: m.genre_ids ?? m.genres?.map((g) => g.id) ?? [],
  };
}

function pickTrailerKey(videos: RawVideo[] | undefined): string | null {
  if (!videos?.length) return null;
  const youtube = videos.filter((v) => v.site === "YouTube");
  // Prefer an official trailer, then any trailer, then a teaser, then anything.
  const byPref =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    youtube[0];
  return byPref?.key ?? null;
}

function toCast(cast: RawCast[] | undefined, limit = 12): CastMember[] {
  if (!cast?.length) return [];
  return [...cast]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character?.trim() || "—",
      profileUrl: profileUrl(c.profile_path),
    }));
}

function toDetail(m: RawMovie): MovieDetail {
  const directors = (m.credits?.crew ?? [])
    .filter((c) => c.job === "Director")
    .map((c) => c.name);

  return {
    ...toSummary(m),
    tagline: m.tagline || null,
    runtime: m.runtime ?? null,
    genres: m.genres ?? [],
    releaseDate: m.release_date || null,
    originalLanguage: m.original_language || null,
    status: m.status || null,
    cast: toCast(m.credits?.cast),
    directors: Array.from(new Set(directors)),
    trailerKey: pickTrailerKey(m.videos?.results),
    collection: m.belongs_to_collection
      ? { id: m.belongs_to_collection.id, name: m.belongs_to_collection.name }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Mock helpers (used when no credentials are configured)
// ---------------------------------------------------------------------------

function mockDiscover(
  genreIds: number[],
  page: number,
  sort?: SortOption,
): Paginated<MovieSummary> {
  const filtered = genreIds.length
    ? MOCK_MOVIES.filter((m) => genreIds.every((id) => m.genreIds.includes(id)))
    : MOCK_MOVIES;
  const sorted = [...filtered].sort((a, b) =>
    sort === "vote_average.desc"
      ? b.rating - a.rating
      : b.voteCount - a.voteCount,
  );
  const totalPages = 1;
  return {
    results: sorted.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      rating: m.rating,
      voteCount: m.voteCount,
      releaseYear: m.releaseYear,
      genreIds: m.genreIds,
    })),
    page: Math.min(Math.max(page, 1), totalPages),
    totalPages,
    totalResults: sorted.length,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SortOption = "popularity.desc" | "vote_average.desc" | "release_date.desc";

export async function getGenres(): Promise<Genre[]> {
  if (!isLiveData) return MOCK_GENRES;
  try {
    const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {
      revalidate: 60 * 60 * 24,
    });
    return data.genres;
  } catch {
    // A transient TMDB failure shouldn't blank the UI — fall back to a known set.
    return MOCK_GENRES;
  }
}

export async function discoverMovies(opts: {
  genreIds?: number[];
  page?: number;
  sort?: SortOption;
} = {}): Promise<Paginated<MovieSummary>> {
  const { genreIds = [], page = 1, sort = "popularity.desc" } = opts;
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), 500);

  if (!isLiveData) return mockDiscover(genreIds, safePage, sort);

  try {
    const data = await tmdbFetch<RawPaginated>("/discover/movie", {
      params: {
        page: safePage,
        sort_by: sort,
        include_adult: "false",
        "vote_count.gte": sort === "vote_average.desc" ? 300 : 0,
        with_genres: genreIds.length ? genreIds.join(",") : undefined,
      },
    });

    return {
      results: data.results.map(toSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500), // TMDB caps pagination at 500
      totalResults: data.total_results,
    };
  } catch {
    // Degrade gracefully rather than throwing the whole page into the error UI.
    return mockDiscover(genreIds, safePage, sort);
  }
}

export const getMovieDetail = cache(async function getMovieDetail(
  id: number,
): Promise<MovieDetail | null> {
  if (!isLiveData) {
    return MOCK_MOVIES.find((m) => m.id === id) ?? null;
  }
  try {
    const data = await tmdbFetch<RawMovie>(`/movie/${id}`, {
      params: { append_to_response: "credits,videos" },
    });
    return toDetail(data);
  } catch {
    return null;
  }
});

export async function getRelatedMovies(id: number): Promise<MovieSummary[]> {
  if (!isLiveData) {
    return mockDiscover([], 1).results.filter((m) => m.id !== id).slice(0, 6);
  }
  try {
    const data = await tmdbFetch<RawPaginated>(`/movie/${id}/recommendations`);
    return data.results.slice(0, 12).map(toSummary);
  } catch {
    return [];
  }
}

function mockSearch(query: string, page: number): Paginated<MovieSummary> {
  const q = query.trim().toLowerCase();
  const matched = MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(q));
  return {
    results: matched.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      rating: m.rating,
      voteCount: m.voteCount,
      releaseYear: m.releaseYear,
      genreIds: m.genreIds,
    })),
    page: 1,
    totalPages: 1,
    totalResults: matched.length,
  };
}

export async function searchMovies(opts: {
  query: string;
  page?: number;
}): Promise<Paginated<MovieSummary>> {
  const query = opts.query.trim();
  const safePage = Math.min(Math.max(Math.trunc(opts.page ?? 1) || 1, 1), 500);

  if (!query) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }
  if (!isLiveData) return mockSearch(query, safePage);

  try {
    const data = await tmdbFetch<RawPaginated>("/search/movie", {
      params: { query, page: safePage, include_adult: "false" },
    });
    return {
      results: data.results.map(toSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockSearch(query, safePage);
  }
}

/**
 * Fetches a franchise collection and its member films (prequels/sequels),
 * ordered by release date. Returns null when unavailable (incl. mock mode).
 */
export const getCollection = cache(async function getCollection(
  id: number,
): Promise<Collection | null> {
  if (!isLiveData) return null;
  try {
    const data = await tmdbFetch<RawCollection>(`/collection/${id}`, {
      revalidate: 60 * 60 * 24,
    });
    const parts = (data.parts ?? [])
      .map(toSummary)
      .sort((a, b) => (a.releaseYear ?? "").localeCompare(b.releaseYear ?? ""));
    return { id: data.id, name: data.name, parts };
  } catch {
    return null;
  }
});
