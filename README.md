# CineQueue

A movie discovery website built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

- Browse a grid of movies with poster, short description, and rating
- A featured **hero banner** carousel spotlighting top titles
- Full-text **search** (header search bar, ⌘K / Ctrl+K to focus)
- Filter by one or more genres via a horizontal scrolling strip (state lives in the URL, so filters are shareable)
- Movie detail page with backdrop, poster, tags, description, rating, and runtime
- **Watch on…** button that opens a chooser of external streaming sites in a new tab
- **Reel**, an AI chat guide that recommends titles and answers questions about a
  specific movie or show — grounded in real TMDB data (cast, synopsis, ratings)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

Open http://localhost:3000.

### Movie data (TMDB)

Real movie data comes from [TMDB](https://www.themoviedb.org/). Add a key to
`.env.local`:

```
TMDB_API_KEY=your_v3_api_key
# or, alternatively:
# TMDB_ACCESS_TOKEN=your_v4_read_access_token
```

**No key?** The app automatically falls back to a small bundled sample catalog so
it still runs and is fully navigable — you'll see a "Demo data" badge in the header.

### Reel — the AI chat guide (optional)

**Reel** is the in-app chat assistant. It does two things:

- **Recommends** movies and TV shows from a mood, genre, actor, or a title you like.
- **Answers questions about a specific title** (plot, cast, creators, year, why it's
  notable). These answers are **grounded in real TMDB data** — Reel identifies the
  title, fetches its actual synopsis, cast, rating, and runtime/seasons, and answers
  from those verified facts rather than guessing.

Reel is powered by Google Gemini. Add a key to `.env.local` to enable it:

```
GEMINI_API=your_gemini_api_key
# optional — override the model (defaults to gemini-2.5-flash):
# GEMINI_MODEL=gemini-2.5-flash
```

**No key?** Reel still works but degrades gracefully to a **rule-based fallback**
that searches the catalog directly instead of generating AI recommendations.

> On Vercel, set `GEMINI_API` under **Project → Settings → Environment Variables**
> and redeploy for it to take effect. Grounded detail answers make two sequential
> model calls, so the chat route sets `maxDuration = 45`.

## Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build                |
| `npm start`     | Serve the production build      |
| `npm run lint`  | Lint with ESLint                |
| `npm test`      | Run unit tests (Vitest)         |
| `npm run test:e2e` | Run mobile E2E tests (Playwright) |

> **First E2E run:** install the browser once with `npx playwright install chromium`.
> The E2E suite builds and serves the app on port 3100 in mock mode, so it won't
> collide with a `next dev` server on :3000.

## Continuous integration

`.github/workflows/ci.yml` runs lint, unit tests, and the production build on every
push and pull request to `main`. Vercel handles the actual build and deployment; the
Playwright mobile E2E suite is run locally (`npm run test:e2e`).

## Architecture

```
src/
  app/
    layout.tsx            Root layout, fonts, header/footer, metadata
    page.tsx              Home: genre filter + movie grid + pagination
    loading.tsx           Route-level skeleton
    error.tsx             Client error boundary
    not-found.tsx         404
    movie/[id]/page.tsx   Detail page + related titles + OG metadata
    api/chat/route.ts     Reel chat endpoint (rate-limited, maxDuration=45)
    globals.css           Tailwind layers + base theme
  components/             Presentational + interactive UI
    Header, SearchBar, Footer, MovieCard, MovieGrid, GenreFilter,
    FeaturedHero, RatingBadge, Poster, DetailHero, TagList, WatchOnModal,
    ChatWidget            Reel chat UI (recommendation cards + answers)
  lib/
    tmdb.ts               server-only TMDB client (+ mock fallback, caching)
    gemini.ts             server-only Gemini client (recommend + grounded answer)
    recommend.ts          Orchestrates Reel: title resolution + TMDB grounding
    chat-types.ts         Shared chat message / response types (client + server)
    streaming-sites.ts    Config-driven external site list + URL builders
    mock-data.ts          Bundled fallback catalog
    types.ts              Normalized domain types
    utils.ts              Small presentation helpers
```

### Design system

Black + cyan theme inspired by modern streaming UIs — near-black background `#0A0A0C`
with cool stepped surfaces, cool off-white text `#F5F6F8`, and a single cyan accent
`#5FC6E4` used for the hero headline, active filters, and primary actions. A
data-driven rating color scale (green / cyan / red) signals quality at a glance.
Display type is Poppins; body type is Inter (self-hosted via `next/font`).

## Notes on the "Watch on" links

The streaming destinations are independent third-party sites we do not control.
Reliable per-movie deep-linking isn't possible across all of them, so each entry
opens either the site's search (where a predictable path exists) or its homepage.
All outbound links use `target="_blank"` and `rel="noopener noreferrer"`.
CineQueue hosts no content and does not endorse these sites.
