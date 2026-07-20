// These tests run with no TMDB credentials configured, so the client operates
// in mock mode and returns bundled fixture data. That lets us verify the pure
// filtering / mapping / normalization logic without any network access.
import { beforeAll, describe, expect, it, vi } from "vitest";

// `react`'s `cache` is an RSC-only API and is undefined in a plain Node test
// runtime. tmdb.ts wraps a few detail fetchers in it at module load, so we
// shim it to an identity wrapper (memoization is irrelevant to these tests).
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T): T => fn };
});

import {
  discoverMovies,
  discoverMoviesByStudio,
  discoverTv,
  getGenres,
  getMovieDetail,
  getStudios,
  getTvGenres,
  isLiveData,
  searchMovies,
} from "./tmdb";
import { ANIME_GENRE_ID } from "./types";
import { MOCK_STUDIOS } from "./mock-data";

const ANIMATION_GENRE_ID = 16;

beforeAll(() => {
  // Guard: the suite is only meaningful in mock mode. If a real key leaks into
  // the test env, fail loudly rather than making live API calls.
  expect(isLiveData).toBe(false);
});

describe("getGenres", () => {
  it("returns the mock movie genres including the Anime pseudo-genre", async () => {
    const list = await getGenres();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((g) => g.id === ANIME_GENRE_ID && g.name === "Anime")).toBe(true);
  });
});

describe("getTvGenres", () => {
  it("returns TV-specific genre IDs distinct from movie genres", async () => {
    const list = await getTvGenres();
    // TMDB TV genres include "Sci-Fi & Fantasy" (10765), which has no movie equivalent.
    expect(list.some((g) => g.id === 10765)).toBe(true);
  });
});

describe("discoverMovies (mock mode)", () => {
  it("filters by a single genre so every result includes it", async () => {
    const { results } = await discoverMovies({ genreIds: [878] }); // Science Fiction
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((m) => m.genreIds.includes(878))).toBe(true);
  });

  it("maps the Anime pseudo-genre (9999) to Animation (16)", async () => {
    const { results } = await discoverMovies({ genreIds: [ANIME_GENRE_ID] });
    expect(results.length).toBeGreaterThan(0);
    // Every result should actually carry the Animation genre it was mapped to.
    expect(results.every((m) => m.genreIds.includes(ANIMATION_GENRE_ID))).toBe(true);
  });

  it("sorts by rating descending when requested", async () => {
    const { results } = await discoverMovies({ sort: "vote_average.desc" });
    const ratings = results.map((m) => m.rating);
    const sorted = [...ratings].sort((a, b) => b - a);
    expect(ratings).toEqual(sorted);
  });

  it("filters by release year", async () => {
    const { results } = await discoverMovies({ year: 2023 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((m) => m.releaseYear === "2023")).toBe(true);
  });
});

describe("discoverTv (mock mode)", () => {
  it("filters TV by a TV-only genre id", async () => {
    const { results } = await discoverTv({ genreIds: [10765] }); // Sci-Fi & Fantasy
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((t) => t.genreIds.includes(10765))).toBe(true);
  });
});

describe("searchMovies (mock mode)", () => {
  it("matches on a title substring, case-insensitively", async () => {
    const { results } = await searchMovies({ query: "neon" });
    expect(results.some((m) => m.title === "Neon Horizon")).toBe(true);
  });

  it("returns an empty result set for a blank query", async () => {
    const res = await searchMovies({ query: "   " });
    expect(res.results).toHaveLength(0);
    expect(res.totalPages).toBe(0);
  });
});

describe("getMovieDetail (mock mode)", () => {
  it("returns a movie for a known id", async () => {
    const movie = await getMovieDetail(1);
    expect(movie?.title).toBe("Neon Horizon");
  });

  it("returns null for an unknown id", async () => {
    expect(await getMovieDetail(999_999)).toBeNull();
  });
});

describe("getStudios (mock mode)", () => {
  it("returns the full curated studio list", async () => {
    const studios = await getStudios();
    expect(studios).toHaveLength(MOCK_STUDIOS.length);
    expect(studios[0]).toHaveProperty("tmdbCompanyId");
  });
});

describe("discoverMoviesByStudio (mock mode)", () => {
  it("returns the movies mapped to a studio's TMDB company id", async () => {
    // Sakura Studio (tmdbCompanyId 3) maps to movie id 8 only.
    const { results } = await discoverMoviesByStudio({ companyId: 3 });
    expect(results.map((m) => m.id)).toEqual([8]);
  });
});
