import type { Metadata } from "next";
import type { Paginated, MovieSummary } from "@/lib/types";
import { discoverTv, getTvGenres } from "@/lib/tmdb";
import { GenreFilter } from "@/components/GenreFilter";
import { EmptyState } from "@/components/MovieGrid";
import { PaginatedSection } from "@/components/PaginatedSection";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Browse TV series and filter by genre, year, and country.",
};

function parseGenres(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
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

export default async function TvShowsPage({
  searchParams,
}: {
  searchParams: {
    genres?: string | string[];
    year?: string | string[];
    country?: string | string[];
  };
}) {
  const selectedIds = parseGenres(searchParams.genres);
  const year = parseYear(searchParams.year);
  const country = parseCountry(searchParams.country);
  const hasFilters = selectedIds.length > 0 || Boolean(year) || Boolean(country);

  const [genres, popularInit, topRatedInit] = await Promise.all([
    getTvGenres(),
    discoverTv({ genreIds: selectedIds, year, country, page: 1 }),
    discoverTv({ genreIds: selectedIds, year, country, sort: "vote_average.desc", page: 1 }),
  ]);

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      <section className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
          TV Shows
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-paper-muted">
          Browse series and filter by the genres you&rsquo;re in the mood for.
        </p>
      </section>

      <section className="mb-8" aria-label="Genre filter">
        <GenreFilter genres={genres} selectedIds={selectedIds} />
      </section>

      {popularInit.results.length === 0 ? (
        <EmptyState
          title="No shows found"
          message="Try removing a filter or two to widen your search."
        />
      ) : (
        <PaginatedSection
          key={`tv-popular-${selectedIds.join(",")}-${year ?? ""}-${country ?? ""}`}
          title={hasFilters ? "Filtered shows" : "Popular right now"}
          sort="popularity.desc"
          initialData={popularInit as Paginated<MovieSummary>}
          genreIds={selectedIds}
          year={year}
          country={country}
          apiPath="/api/tv"
          basePath="/tv"
        />
      )}

      {topRatedInit.results.length > 0 && (
        <div className="mt-12">
          <PaginatedSection
            key={`tv-toprated-${selectedIds.join(",")}-${year ?? ""}-${country ?? ""}`}
            title="Top rated"
            sort="vote_average.desc"
            initialData={topRatedInit as Paginated<MovieSummary>}
            genreIds={selectedIds}
            year={year}
            country={country}
            apiPath="/api/tv"
            basePath="/tv"
          />
        </div>
      )}
    </div>
  );
}
