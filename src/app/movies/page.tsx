import type { Metadata } from "next";
import type { Paginated, MovieSummary } from "@/lib/types";
import { Suspense } from "react";
import { discoverMovies, getGenres } from "@/lib/tmdb";
import { GenreFilter } from "@/components/GenreFilter";
import { EmptyState } from "@/components/MovieGrid";
import { PaginatedSection } from "@/components/PaginatedSection";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse the full movie catalog and filter by genre.",
};

function parseGenres(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { genres?: string | string[] };
}) {
  const selectedIds = parseGenres(searchParams.genres);

  const [genres, popularInit, topRatedInit] = await Promise.all([
    getGenres(),
    discoverMovies({ genreIds: selectedIds, page: 1 }),
    discoverMovies({ genreIds: selectedIds, sort: "vote_average.desc", page: 1 }),
  ]);

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      <section className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
          Movies
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-paper-muted">
          Browse the full catalog and filter by the genres you&rsquo;re in the mood for.
        </p>
      </section>

      <section className="mb-8" aria-label="Genre filter">
        <Suspense fallback={<div className="h-9 w-full rounded-pill bg-ink-800/50" />}>
          <GenreFilter genres={genres} selectedIds={selectedIds} />
        </Suspense>
      </section>

      {popularInit.results.length === 0 ? (
        <EmptyState message="Try removing a genre or two to widen your search." />
      ) : (
        <PaginatedSection
          key={`popular-${selectedIds.join(",")}`}
          title={selectedIds.length ? "Filtered movies" : "All movies"}
          sort="popularity.desc"
          initialData={popularInit as Paginated<MovieSummary>}
          genreIds={selectedIds}
        />
      )}

      {topRatedInit.results.length > 0 && (
        <div className="mt-12">
          <PaginatedSection
            key={`toprated-${selectedIds.join(",")}`}
            title="Top rated"
            sort="vote_average.desc"
            initialData={topRatedInit as Paginated<MovieSummary>}
            genreIds={selectedIds}
          />
        </div>
      )}
    </div>
  );
}
