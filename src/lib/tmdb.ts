import "server-only";

import { cache } from "react";
import type {
  CastMember,
  Collection,
  Genre,
  MovieDetail,
  MovieSummary,
  Paginated,
  TrendingMedia,
} from "./types";
import { MOCK_GENRES, MOCK_MOVIES, MOCK_TV, MOCK_TV_GENRES } from "./mock-data";

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

interface RawTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string | null;
  genre_ids?: number[];
  genres?: Genre[];
  tagline?: string;
  episode_run_time?: number[];
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  original_language?: string;
  status?: string;
  created_by?: { id: number; name: string }[];
  credits?: { cast?: RawCast[]; crew?: RawCrew[] };
  videos?: { results?: RawVideo[] };
}

interface RawPaginated {
  page: number;
  results: RawMovie[];
  total_pages: number;
  total_results: number;
}

interface RawPaginatedTv {
  page: number;
  results: RawTv[];
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

function toTvSummary(t: RawTv): MovieSummary {
  return {
    id: t.id,
    title: t.name,
    overview: t.overview ?? "",
    posterUrl: posterUrl(t.poster_path),
    backdropUrl: backdropUrl(t.backdrop_path),
    rating: Math.round((t.vote_average ?? 0) * 10) / 10,
    voteCount: t.vote_count ?? 0,
    releaseYear: t.first_air_date ? t.first_air_date.slice(0, 4) : null,
    genreIds: t.genre_ids ?? t.genres?.map((g) => g.id) ?? [],
  };
}

function toTvDetail(t: RawTv): MovieDetail {
  const creators = (t.created_by ?? []).map((c) => c.name);
  return {
    ...toTvSummary(t),
    tagline: t.tagline || null,
    runtime: t.episode_run_time?.[0] ?? null,
    genres: t.genres ?? [],
    releaseDate: t.first_air_date || null,
    originalLanguage: t.original_language || null,
    status: t.status || null,
    cast: toCast(t.credits?.cast),
    // TV credits its "creators" rather than directors; we reuse the field.
    directors: Array.from(new Set(creators)),
    trailerKey: pickTrailerKey(t.videos?.results),
    collection: null,
    numberOfSeasons: t.number_of_seasons ?? null,
    numberOfEpisodes: t.number_of_episodes ?? null,
  };
}

// ---------------------------------------------------------------------------
// Mock helpers (used when no credentials are configured)
// ---------------------------------------------------------------------------
function mockDiscover(
  genreIds: number[],
  page: number,
  sort?: SortOption,
  year?: number,
): Paginated<MovieSummary> {
  let filtered = genreIds.length
    ? MOCK_MOVIES.filter((m) => genreIds.every((id) => m.genreIds.includes(id)))
    : MOCK_MOVIES;
  if (year && year > 0) {
    filtered = filtered.filter((m) => m.releaseYear === String(year));
  }
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

function mockDiscoverTv(
  genreIds: number[],
  page: number,
  sort?: SortOption,
  year?: number,
): Paginated<MovieSummary> {
  let filtered = genreIds.length
    ? MOCK_TV.filter((t) => genreIds.every((id) => t.genreIds.includes(id)))
    : MOCK_TV;
  if (year && year > 0) {
    filtered = filtered.filter((t) => t.releaseYear === String(year));
  }
  const sorted = [...filtered].sort((a, b) =>
    sort === "vote_average.desc" ? b.rating - a.rating : b.voteCount - a.voteCount,
  );
  return {
    results: sorted.map(toMockSummary),
    page: 1,
    totalPages: 1,
    totalResults: sorted.length,
  };
}

function mockSearchTv(query: string, _page: number): Paginated<MovieSummary> {
  const q = query.trim().toLowerCase();
  const matched = MOCK_TV.filter((t) => t.title.toLowerCase().includes(q));
  return {
    results: matched.map(toMockSummary),
    page: 1,
    totalPages: 1,
    totalResults: matched.length,
  };
}

/** Strip a MovieDetail (as stored in mock data) down to a summary. */
function toMockSummary(m: MovieDetail): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterUrl: m.posterUrl,
    backdropUrl: m.backdropUrl,
    rating: m.rating,
    voteCount: m.voteCount,
    releaseYear: m.releaseYear,
    genreIds: m.genreIds,
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
  year?: number;
  country?: string;
} = {}): Promise<Paginated<MovieSummary>> {
  const { genreIds = [], page = 1, sort = "popularity.desc", year, country } = opts;
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), 500);

  if (!isLiveData) return mockDiscover(genreIds, safePage, sort, year);

  try {
    const data = await tmdbFetch<RawPaginated>("/discover/movie", {
      params: {
        page: safePage,
        sort_by: sort,
        include_adult: "false",
        "vote_count.gte": sort === "vote_average.desc" ? 300 : 0,
        with_genres: genreIds.length ? genreIds.join(",") : undefined,
        primary_release_year: year && year > 0 ? year : undefined,
        with_origin_country: country || undefined,
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
    return mockDiscover(genreIds, safePage, sort, year);
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


// ---------------------------------------------------------------------------
// Public API — TV shows
// ---------------------------------------------------------------------------

export async function getTvGenres(): Promise<Genre[]> {
  if (!isLiveData) return MOCK_TV_GENRES;
  try {
    const data = await tmdbFetch<{ genres: Genre[] }>("/genre/tv/list", {
      revalidate: 60 * 60 * 24,
    });
    return data.genres;
  } catch {
    return MOCK_TV_GENRES;
  }
}

export async function discoverTv(opts: {
  genreIds?: number[];
  page?: number;
  sort?: SortOption;
  year?: number;
  country?: string;
} = {}): Promise<Paginated<MovieSummary>> {
  const { genreIds = [], page = 1, sort = "popularity.desc", year, country } = opts;
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), 500);

  if (!isLiveData) return mockDiscoverTv(genreIds, safePage, sort, year);

  try {
    const data = await tmdbFetch<RawPaginatedTv>("/discover/tv", {
      params: {
        page: safePage,
        sort_by: sort,
        include_adult: "false",
        "vote_count.gte": sort === "vote_average.desc" ? 200 : 0,
        with_genres: genreIds.length ? genreIds.join(",") : undefined,
        first_air_date_year: year && year > 0 ? year : undefined,
        with_origin_country: country || undefined,
      },
    });

    return {
      results: data.results.map(toTvSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockDiscoverTv(genreIds, safePage, sort, year);
  }
}

export const getTvDetail = cache(async function getTvDetail(
  id: number,
): Promise<MovieDetail | null> {
  if (!isLiveData) {
    return MOCK_TV.find((t) => t.id === id) ?? null;
  }
  try {
    const data = await tmdbFetch<RawTv>(`/tv/${id}`, {
      params: { append_to_response: "credits,videos" },
    });
    return toTvDetail(data);
  } catch {
    return null;
  }
});

export async function getRelatedTv(id: number): Promise<MovieSummary[]> {
  if (!isLiveData) {
    return mockDiscoverTv([], 1).results.filter((t) => t.id !== id).slice(0, 6);
  }
  try {
    const data = await tmdbFetch<RawPaginatedTv>(`/tv/${id}/recommendations`);
    return data.results.slice(0, 12).map(toTvSummary);
  } catch {
    return [];
  }
}

export async function searchTv(opts: {
  query: string;
  page?: number;
}): Promise<Paginated<MovieSummary>> {
  const query = opts.query.trim();
  const safePage = Math.min(Math.max(Math.trunc(opts.page ?? 1) || 1, 1), 500);

  if (!query) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }
  if (!isLiveData) return mockSearchTv(query, safePage);

  try {
    const data = await tmdbFetch<RawPaginatedTv>("/search/tv", {
      params: { query, page: safePage, include_adult: "false" },
    });
    return {
      results: data.results.map(toTvSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockSearchTv(query, safePage);
  }
}

// ---------------------------------------------------------------------------
// Public API — Trending
// ---------------------------------------------------------------------------

interface RawTrendingItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string | null;
  first_air_date?: string | null;
  genre_ids?: number[];
  media_type?: string;
}

interface RawTrendingPaginated {
  page: number;
  results: RawTrendingItem[];
  total_pages: number;
  total_results: number;
}

function toTrendingSummary(item: RawTrendingItem): TrendingMedia {
  const isTv = item.media_type === "tv";
  return {
    id: item.id,
    title: isTv ? (item.name ?? "") : (item.title ?? ""),
    overview: item.overview ?? "",
    posterUrl: posterUrl(item.poster_path),
    backdropUrl: backdropUrl(item.backdrop_path),
    rating: Math.round((item.vote_average ?? 0) * 10) / 10,
    voteCount: item.vote_count ?? 0,
    releaseYear: isTv
      ? (item.first_air_date?.slice(0, 4) ?? null)
      : (item.release_date?.slice(0, 4) ?? null),
    genreIds: item.genre_ids ?? [],
    media_type: item.media_type,
  };
}

function mockTrendingMovies(_page: number): Paginated<MovieSummary> {
  return {
    results: MOCK_MOVIES.map(toMockSummary),
    page: 1,
    totalPages: 1,
    totalResults: MOCK_MOVIES.length,
  };
}

function mockTrendingTv(_page: number): Paginated<MovieSummary> {
  return {
    results: MOCK_TV.map(toMockSummary),
    page: 1,
    totalPages: 1,
    totalResults: MOCK_TV.length,
  };
}

function mockTrendingAll(_page: number): Paginated<TrendingMedia> {
  const movies = MOCK_MOVIES.map((m) => ({ ...toMockSummary(m), media_type: "movie" }));
  const tvShows = MOCK_TV.map((t) => ({ ...toMockSummary(t), media_type: "tv" }));
  const combined = [...movies, ...tvShows].sort((a, b) => b.rating - a.rating);
  return {
    results: combined,
    page: 1,
    totalPages: 1,
    totalResults: combined.length,
  };
}

export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week",
  opts?: { page?: number },
): Promise<Paginated<MovieSummary>> {
  const page = Math.min(Math.max(Math.trunc(opts?.page ?? 1) || 1, 1), 500);
  const revalidate = timeWindow === "day" ? 15 * 60 : 60 * 60;

  if (!isLiveData) return mockTrendingMovies(page);

  try {
    const data = await tmdbFetch<RawPaginated>(`/trending/movie/${timeWindow}`, {
      params: { page },
      revalidate,
    });
    return {
      results: data.results.map(toSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockTrendingMovies(page);
  }
}

export async function getTrendingTv(
  timeWindow: "day" | "week" = "week",
  opts?: { page?: number },
): Promise<Paginated<MovieSummary>> {
  const page = Math.min(Math.max(Math.trunc(opts?.page ?? 1) || 1, 1), 500);
  const revalidate = timeWindow === "day" ? 15 * 60 : 60 * 60;

  if (!isLiveData) return mockTrendingTv(page);

  try {
    const data = await tmdbFetch<RawPaginatedTv>(`/trending/tv/${timeWindow}`, {
      params: { page },
      revalidate,
    });
    return {
      results: data.results.map(toTvSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockTrendingTv(page);
  }
}

export async function getTrendingAll(
  timeWindow: "day" | "week" = "week",
  opts?: { page?: number },
): Promise<Paginated<TrendingMedia>> {
  const page = Math.min(Math.max(Math.trunc(opts?.page ?? 1) || 1, 1), 500);
  const revalidate = timeWindow === "day" ? 15 * 60 : 60 * 60;

  if (!isLiveData) return mockTrendingAll(page);

  try {
    const data = await tmdbFetch<RawTrendingPaginated>(`/trending/all/${timeWindow}`, {
      params: { page },
      revalidate,
    });
    return {
      results: data.results.map(toTrendingSummary),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch {
    return mockTrendingAll(page);
  }
}
