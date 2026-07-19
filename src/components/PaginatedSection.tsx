"use client";

import { useState, useCallback } from "react";
import type { Paginated, MovieSummary } from "@/lib/types";
import { MovieGrid, MovieGridSkeleton } from "./MovieGrid";

interface Props {
  title: string;
  sort: "popularity.desc" | "vote_average.desc";
  initialData: Paginated<MovieSummary>;
  genreIds?: number[];
  year?: number;
  country?: string;
  /** API endpoint used to load more pages. */
  apiPath?: string;
  /** Link base for cards ("/movie" or "/tv"). */
  basePath?: string;
}

export function PaginatedSection({
  title,
  sort,
  initialData,
  genreIds,
  year,
  country,
  apiPath = "/api/movies",
  basePath = "/movie",
}: Props) {
  const [page, setPage] = useState(initialData.page);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPrev = page > 1;
  const hasNext = page < data.totalPages;

  const goToPage = useCallback(
    async (nextPage: number) => {
      if (nextPage < 1 || nextPage > data.totalPages || loading) return;
      setLoading(true);
      setError(null);
      try {
        const url = new URL(apiPath, window.location.origin);
        url.searchParams.set("sort", sort);
        url.searchParams.set("page", String(nextPage));
        if (genreIds?.length) {
          url.searchParams.set("genreIds", genreIds.join(","));
        }
        if (year) {
          url.searchParams.set("year", String(year));
        }
        if (country) {
          url.searchParams.set("country", country);
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Paginated<MovieSummary> = await res.json();
        setData(json);
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [sort, data.totalPages, loading, genreIds, year, country, apiPath],
  );

  return (
    <section aria-label={title}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
          {title}
        </h2>

        {(hasPrev || hasNext) && (
          <nav className="flex items-center gap-2" aria-label={`${title} pagination`}>
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={!hasPrev || loading}
              className="grid h-9 w-9 place-items-center rounded-pill border border-ink-600 text-paper-muted transition-colors hover:border-paper-faint hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <span className="min-w-[2ch] rounded-pill border border-ink-600 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-paper">
              {page}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext || loading}
              className="grid h-9 w-9 place-items-center rounded-pill border border-ink-600 text-paper-muted transition-colors hover:border-paper-faint hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>
        )}
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <MovieGridSkeleton count={12} />
      ) : (
        <MovieGrid movies={data.results.slice(0, 12)} basePath={basePath} />
      )}
    </section>
  );
}
