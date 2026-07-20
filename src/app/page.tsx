import type { Paginated, MovieSummary } from "@/lib/types";
import Link from "next/link";
import { discoverMovies, discoverTv, getGenres, getStudios, searchMovies } from "@/lib/tmdb";
import { GenreFilter } from "@/components/GenreFilter";
import { FeaturedHero } from "@/components/FeaturedHero";
import { MovieGrid, EmptyState } from "@/components/MovieGrid";
import { PaginatedSection } from "@/components/PaginatedSection";
import { AskReelBanner } from "@/components/AskReelBanner";
import { StudioSection } from "@/components/StudioSection";

function parseGenres(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function parseQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 120);
}

function parseYear(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : undefined;
}

function parseCountry(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: {
    genres?: string | string[];
    q?: string | string[];
    year?: string | string[];
    country?: string | string[];
  };
}) {
  const q = parseQuery(searchParams.q);
  const selectedIds = parseGenres(searchParams.genres);
  const year = parseYear(searchParams.year);
  const country = parseCountry(searchParams.country);
  const isSearching = q.length > 0;

  const [genres, popularInit, topRatedInit, popularTv, studios] = await Promise.all([
    getGenres(),
    isSearching
      ? searchMovies({ query: q, page: 1 })
      : discoverMovies({ genreIds: selectedIds, year, country, page: 1 }),
    isSearching
      ? Promise.resolve({
          results: [],
          page: 1,
          totalPages: 0,
          totalResults: 0,
        } as Paginated<MovieSummary>)
      : discoverMovies({ genreIds: selectedIds, year, country, sort: "vote_average.desc", page: 1 }),
    isSearching
      ? Promise.resolve({
          results: [],
          page: 1,
          totalPages: 0,
          totalResults: 0,
        } as Paginated<MovieSummary>)
      : discoverTv({ page: 1 }),
    isSearching ? Promise.resolve([]) : getStudios(),
  ]);

  const showHero = !isSearching && popularInit.results.length > 0;
  const featured = popularInit.results.slice(0, 8);

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {showHero && (
        <div className="mb-6">
          <FeaturedHero items={featured} genres={genres} />
        </div>
      )}

      <section className="mb-8" aria-label="Genre filter">
        <GenreFilter genres={genres} selectedIds={selectedIds} />
      </section>

      {isSearching ? (
        <>
          <section className="mb-5">
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
                Results for <span className="text-marquee">&ldquo;{q}&rdquo;</span>
              </h1>
              <p className="mt-1 text-sm text-paper-muted">
                {popularInit.totalResults.toLocaleString()} title
                {popularInit.totalResults === 1 ? "" : "s"} found
              </p>
            </div>
          </section>
          {popularInit.results.length === 0 ? (
            <EmptyState title="No matches" message="Try a different title or spelling." />
          ) : (
            <MovieGrid movies={popularInit.results.slice(0, 12)} />
          )}
        </>
      ) : popularInit.results.length === 0 ? (
        <EmptyState message="Try removing a genre or two to widen your search." />
      ) : (
        <PaginatedSection
          key={`popular-${selectedIds.join(",")}-${year ?? ""}-${country ?? ""}`}
          title={selectedIds.length || year || country ? "Filtered movies" : "Popular right now"}
          sort="popularity.desc"
          initialData={popularInit}
          genreIds={selectedIds}
          year={year}
          country={country}
        />
      )}

      {!isSearching && topRatedInit.results.length > 0 && (
        <div className="mt-12">
          <PaginatedSection
            key={`toprated-${selectedIds.join(",")}-${year ?? ""}-${country ?? ""}`}
            title="Top Rated"
            sort="vote_average.desc"
            initialData={topRatedInit}
            genreIds={selectedIds}
            year={year}
            country={country}
          />
        </div>
      )}

      {!isSearching && popularTv.results.length > 0 && (
        <section className="mt-12" aria-label="Popular on TV">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
                Popular on TV right now
              </h2>
              <p className="mt-1 text-sm text-paper-muted">
                Series worth binging — straight from our TV catalog.
              </p>
            </div>
            <Link
              href="/tv"
              className="shrink-0 whitespace-nowrap rounded-pill border border-ink-600 px-4 py-2 text-sm font-semibold text-paper-muted transition-colors hover:border-marquee/50 hover:text-marquee"
            >
              View all
            </Link>
          </div>
          <MovieGrid movies={popularTv.results.slice(0, 12)} basePath="/tv" />
        </section>
      )}

      {!isSearching && (
        <div className="mt-14">
          <AskReelBanner />
        </div>
      )}

      {!isSearching && studios.length > 0 && (
        <section className="mt-14" aria-label="Browse by studio">
          <StudioSection studios={studios} />
        </section>
      )}
    </div>
  );
}
