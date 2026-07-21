import { describe, expect, it, vi } from "vitest";

// `react`'s `cache` is an RSC-only API and is undefined in a plain Node test
// runtime. tmdb.ts (pulled in transitively via recommend.ts) wraps its detail
// fetchers in it at module load, so shim it to an identity wrapper.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T): T => fn };
});

import { buildFacts, pickBestMatch } from "./recommend";
import { normalizeGeminiResult } from "./gemini";
import type { MovieDetail, MovieSummary } from "./types";

function makeDetail(overrides: Partial<MovieDetail> = {}): MovieDetail {
  return {
    id: 1,
    title: "Interstellar",
    overview: "Explorers travel through a wormhole in space.",
    posterUrl: null,
    backdropUrl: null,
    rating: 8.4,
    voteCount: 34000,
    releaseYear: "2014",
    genreIds: [],
    tagline: "Mankind was born on Earth.",
    runtime: 169,
    genres: [
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
    ],
    releaseDate: "2014-11-05",
    originalLanguage: "en",
    status: "Released",
    cast: [
      { id: 1, name: "Matthew McConaughey", character: "Cooper", profileUrl: null },
      { id: 2, name: "Anne Hathaway", character: "Brand", profileUrl: null },
    ],
    directors: ["Christopher Nolan"],
    trailerKey: null,
    collection: null,
    ...overrides,
  };
}

function makeSummary(overrides: Partial<MovieSummary> = {}): MovieSummary {
  return {
    id: Math.floor(Math.random() * 1e6),
    title: "Untitled",
    overview: "",
    posterUrl: null,
    backdropUrl: null,
    rating: 0,
    voteCount: 0,
    releaseYear: null,
    genreIds: [],
    ...overrides,
  };
}

describe("buildFacts", () => {
  it("includes core movie fields with runtime and director label", () => {
    const facts = buildFacts(makeDetail(), "movie");
    expect(facts).toContain("Title: Interstellar");
    expect(facts).toContain("Type: Movie");
    expect(facts).toContain("Year: 2014");
    expect(facts).toContain("Genres: Adventure, Drama");
    expect(facts).toContain("Rating: 8.4/10 (34000 votes)");
    expect(facts).toContain("Runtime: 169 min");
    expect(facts).toContain("Director(s): Christopher Nolan");
    expect(facts).toContain("Matthew McConaughey as Cooper");
    expect(facts).toContain("Overview: Explorers travel through a wormhole");
    // Movies should not advertise TV-only fields.
    expect(facts).not.toContain("Seasons:");
  });

  it("uses TV labels and season/episode counts for series", () => {
    const facts = buildFacts(
      makeDetail({
        title: "The Bear",
        runtime: null,
        numberOfSeasons: 3,
        numberOfEpisodes: 28,
        directors: ["Christopher Storer"],
      }),
      "tv",
    );
    expect(facts).toContain("Type: TV series");
    expect(facts).toContain("Seasons: 3");
    expect(facts).toContain("Episodes: 28");
    expect(facts).toContain("Creator(s): Christopher Storer");
    expect(facts).not.toContain("Runtime:");
  });

  it("omits fields that are missing", () => {
    const facts = buildFacts(
      makeDetail({ tagline: null, genres: [], cast: [], directors: [], overview: "" }),
      "movie",
    );
    expect(facts).not.toContain("Tagline:");
    expect(facts).not.toContain("Genres:");
    expect(facts).not.toContain("Top cast:");
    expect(facts).not.toContain("Director(s):");
    expect(facts).not.toContain("Overview:");
  });

  it("caps the cast list at six names", () => {
    const cast = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Actor ${i}`,
      character: `Role ${i}`,
      profileUrl: null,
    }));
    const facts = buildFacts(makeDetail({ cast }), "movie");
    expect(facts).toContain("Actor 5 as Role 5");
    expect(facts).not.toContain("Actor 6 as Role 6");
  });
});

describe("pickBestMatch", () => {
  it("returns null for no results", () => {
    expect(pickBestMatch([], "Anything", null)).toBeNull();
  });

  it("prefers an exact normalized title match over the top hit", () => {
    const results = [
      makeSummary({ id: 1, title: "Startup Wars" }),
      makeSummary({ id: 2, title: "Start-Up" }),
    ];
    expect(pickBestMatch(results, "start up", null)?.id).toBe(2);
  });

  it("uses the year hint to disambiguate same-named titles", () => {
    const results = [
      makeSummary({ id: 1, title: "The Office", releaseYear: "2005" }),
      makeSummary({ id: 2, title: "The Office", releaseYear: "2001" }),
    ];
    expect(pickBestMatch(results, "The Office", 2001)?.id).toBe(2);
  });

  it("falls back to the top hit when it resembles the query", () => {
    const results = [makeSummary({ id: 1, title: "Interstellar (Extended)" })];
    expect(pickBestMatch(results, "Interstellar", null)?.id).toBe(1);
  });

  it("returns null when the top hit does not resemble the query", () => {
    const results = [makeSummary({ id: 1, title: "Completely Different Film" })];
    expect(pickBestMatch(results, "Interstellar", null)).toBeNull();
  });
});

describe("normalizeGeminiResult", () => {
  it("normalizes focus title, type, and year", () => {
    const out = normalizeGeminiResult({
      reply: "Sure!",
      recommendations: [],
      focus: { title: "  Start-Up  ", type: "tv", year: 2020.0 },
    });
    expect(out.focus).toEqual({ title: "Start-Up", type: "tv", year: 2020 });
  });

  it("nulls out focus when the title is blank and defaults year to null", () => {
    const out = normalizeGeminiResult({
      reply: "",
      recommendations: [],
      focus: { title: "   ", type: "movie" },
    });
    expect(out.focus).toBeNull();
  });

  it("defaults an unknown focus type to movie and missing year to null", () => {
    const out = normalizeGeminiResult({
      focus: { title: "Dune", type: "film" },
    });
    expect(out.focus).toEqual({ title: "Dune", type: "movie", year: null });
  });

  it("filters malformed recommendations and trims fields", () => {
    const out = normalizeGeminiResult({
      reply: "hi",
      recommendations: [
        { title: "  Heat  ", type: "movie", reason: "  crime classic  " },
        { type: "tv" },
        null,
      ],
    });
    expect(out.recommendations).toEqual([
      { title: "Heat", type: "movie", reason: "crime classic" },
    ]);
    expect(out.focus).toBeNull();
  });

  it("tolerates a completely empty payload", () => {
    const out = normalizeGeminiResult(undefined);
    expect(out).toEqual({ reply: "", recommendations: [], focus: null });
  });
});
