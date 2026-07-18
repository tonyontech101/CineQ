import type { CastMember, Genre, MovieDetail } from "./types";

// Bundled fallback data so the app runs with zero configuration (no TMDB key).
// Posters are intentionally null here; the UI renders an on-brand placeholder.
// Real deployments set TMDB_API_KEY and get live posters + a full catalog.

export const MOCK_GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

function genresFor(ids: number[]): Genre[] {
  return MOCK_GENRES.filter((g) => ids.includes(g.id));
}

interface RawMock {
  id: number;
  title: string;
  overview: string;
  rating: number;
  voteCount: number;
  releaseDate: string;
  runtime: number;
  tagline: string;
  genreIds: number[];
}

const RAW: RawMock[] = [
  { id: 1, title: "Neon Horizon", overview: "In a rain-soaked megacity, a burned-out courier stumbles onto a memory she was never meant to carry — and the people who want it back.", rating: 8.4, voteCount: 3120, releaseDate: "2023-10-06", runtime: 128, tagline: "Every memory has a price.", genreIds: [878, 53, 28] },
  { id: 2, title: "The Quiet Coast", overview: "A widowed lighthouse keeper and a runaway teen form an unlikely bond across one long, storm-battered winter.", rating: 7.9, voteCount: 1840, releaseDate: "2022-03-18", runtime: 112, tagline: "Some lights never go out.", genreIds: [18] },
  { id: 3, title: "Paper Kingdoms", overview: "Rival origami masters compete for a legendary commission, folding their way through betrayal, art, and obsession.", rating: 7.2, voteCount: 940, releaseDate: "2021-07-30", runtime: 99, tagline: "One fold changes everything.", genreIds: [35, 18] },
  { id: 4, title: "Ashfall Protocol", overview: "When a dormant volcano threatens a coastal city, a disgraced geologist has 12 hours to convince anyone to listen.", rating: 6.8, voteCount: 2210, releaseDate: "2024-01-12", runtime: 121, tagline: "The ground is running out of time.", genreIds: [28, 53, 18] },
  { id: 5, title: "Marrow & Bloom", overview: "A botanist discovers a flower that heals any wound — and the pharmaceutical war that erupts to own it.", rating: 7.6, voteCount: 1330, releaseDate: "2023-05-24", runtime: 134, tagline: "Nature keeps its own secrets.", genreIds: [878, 18, 9648] },
  { id: 6, title: "Last Train to Vega", overview: "Strangers aboard an interstellar sleeper train unravel a conspiracy hidden in the stars between stops.", rating: 8.1, voteCount: 2760, releaseDate: "2022-11-11", runtime: 141, tagline: "Nobody rides for free.", genreIds: [878, 12, 9648] },
  { id: 7, title: "The Understudy", overview: "A perpetual second-choice actress finally gets her shot — the night the lead vanishes under suspicious circumstances.", rating: 7.4, voteCount: 1020, releaseDate: "2021-09-03", runtime: 106, tagline: "Break a leg. Someone did.", genreIds: [53, 9648, 18] },
  { id: 8, title: "Clockwork Orchard", overview: "In a village where fruit grows on brass trees, a young inventor risks everything to bring back real spring.", rating: 7.8, voteCount: 1580, releaseDate: "2020-12-25", runtime: 118, tagline: "Wind the world back to life.", genreIds: [14, 12, 16] },
  { id: 9, title: "Hollow Signal", overview: "A late-night radio host starts receiving calls from a frequency that shouldn't exist — from listeners who aren't alive.", rating: 6.9, voteCount: 1990, releaseDate: "2023-08-15", runtime: 97, tagline: "Are you listening?", genreIds: [27, 9648, 53] },
  { id: 10, title: "Grand Larsen", overview: "An aging con artist assembles one last crew for a heist that's really an elaborate apology to the family he abandoned.", rating: 8.0, voteCount: 2440, releaseDate: "2024-04-19", runtime: 124, tagline: "The last job is always personal.", genreIds: [80, 35, 18] },
  { id: 11, title: "Featherweight", overview: "A shy amateur boxer trains in secret to honor her late brother, discovering a fight that's bigger than the ring.", rating: 7.7, voteCount: 1210, releaseDate: "2022-06-10", runtime: 115, tagline: "Punch above your fear.", genreIds: [18] },
  { id: 12, title: "Deep Field", overview: "Astronomers at a remote observatory capture an image that rewrites everything — if they survive the night to publish it.", rating: 8.3, voteCount: 3010, releaseDate: "2023-02-28", runtime: 138, tagline: "We were never meant to look this far.", genreIds: [878, 53, 9648] },
];

// Demo-only people pools so the detail page has cast/crew without a TMDB key.
const ACTORS = [
  "Ava Mercer", "Liam Cortez", "Noa Fielding", "Priya Raman",
  "Marcus Boone", "Elena Sorokin", "Devon Clarke", "Yuki Tanaka",
  "Sofia Marchetti", "Theo Adeyemi", "Hana Lindqvist", "Caleb Ross",
];
const DIRECTORS = [
  "Isabel Nakamura", "Grant Whitfield", "Amara Okonkwo",
  "Dmitri Vance", "Lena Brandt", "Oscar Reyes",
];
const ROLES = ["the lead", "the rival", "the mentor", "the confidant", "the antagonist"];

function mockCast(seed: number): CastMember[] {
  return Array.from({ length: 4 }, (_, i) => {
    const actor = ACTORS[(seed * 3 + i) % ACTORS.length];
    return {
      id: seed * 10 + i,
      name: actor,
      character: `${actor.split(" ")[0]} (${ROLES[(seed + i) % ROLES.length]})`,
      profileUrl: null,
    };
  });
}

// A public-domain clip used purely to demonstrate the trailer UI in demo mode.
const DEMO_TRAILER_KEY = "aqz-KE-bpKQ";

export const MOCK_MOVIES: MovieDetail[] = RAW.map((r) => ({
  id: r.id,
  title: r.title,
  overview: r.overview,
  posterUrl: null,
  backdropUrl: null,
  rating: r.rating,
  voteCount: r.voteCount,
  releaseYear: r.releaseDate.slice(0, 4),
  releaseDate: r.releaseDate,
  genreIds: r.genreIds,
  genres: genresFor(r.genreIds),
  tagline: r.tagline,
  runtime: r.runtime,
  originalLanguage: "en",
  status: "Released",
  cast: mockCast(r.id),
  directors: [DIRECTORS[r.id % DIRECTORS.length]],
  trailerKey: r.id % 2 === 0 ? DEMO_TRAILER_KEY : null,
  collection: null,
}));
