# CineQueue

A movie discovery website built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

- Browse a grid of movies with poster, short description, and rating
- A featured **hero banner** carousel spotlighting top titles
- Full-text **search** (header search bar, ⌘K / Ctrl+K to focus)
- Filter by one or more genres via a horizontal scrolling strip (state lives in the URL, so filters are shareable)
- Movie detail page with backdrop, poster, tags, description, rating, and runtime
- **Watch on…** button that opens a chooser of external streaming sites in a new tab

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

## Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build                |
| `npm start`     | Serve the production build      |
| `npm run lint`  | Lint with ESLint                |

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
    globals.css           Tailwind layers + base theme
  components/             Presentational + interactive UI
    Header, SearchBar, Footer, MovieCard, MovieGrid, GenreFilter,
    FeaturedHero, RatingBadge, Poster, DetailHero, TagList, WatchOnModal
  lib/
    tmdb.ts               server-only TMDB client (+ mock fallback, caching)
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
