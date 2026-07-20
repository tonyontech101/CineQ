"use client";

import { useState, useCallback } from "react";
import type { Paginated, MovieSummary } from "@/lib/types";
import { MovieGrid, MovieGridSkeleton } from "./MovieGrid";

interface Props {
  companyId: number;
  initialData: Paginated<MovieSummary>;
}

export function StudioMovies({ companyId, initialData }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"popularity.desc" | "vote_average.desc">(
    "popularity.desc",
  );

  const hasPrev = page > 1;
  const hasNext = page < data.totalPages;

  const loadPage = useCallback(
    async (nextPage: number, nextSort: string) => {
      if (nextPage < 1 || nextPage > data.totalPages || loading) return;
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`/api/studios/${companyId}`, window.location.origin);
        url.searchParams.set("sort", nextSort);
        url.searchParams.set("page", String(nextPage));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.movies);
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [companyId, data.totalPages, loading],
  );

  const handleSortChange = useCallback(
    (newSort: "popularity.desc" | "vote_average.desc") => {
      setSort(newSort);
      setPage(1);
      setData(initialData);
      loadPage(1, newSort);
    },
    [initialData, loadPage],
  );

  return (
    <section aria-label="Studio filmography">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
          Filmography
        </h2>

        <div className="flex items-center gap-3">
          {/* Sort toggle */}
          <div className="flex gap-1 rounded-full bg-ink-800 p-0.5">
            <button
              type="button"
              onClick={() => handleSortChange("popularity.desc")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                sort === "popularity.desc"
                  ? "bg-marquee text-ink-900"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("vote_average.desc")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                sort === "vote_average.desc"
                  ? "bg-marquee text-ink-900"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              Top Rated
            </button>
          </div>

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <nav className="flex items-center gap-2" aria-label="Filmography pagination">
              <button
                type="button"
                onClick={() => loadPage(page - 1, sort)}
                disabled={!hasPrev || loading}
                className="grid h-9 w-9 place-items-center rounded-pill border border-ink-600 text-paper-muted transition-colors hover:border-paper-faint hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <span className="min-w-[2ch] rounded-pill border border-ink-600 px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-paper">
                {page}
              </span>

              <button
                type="button"
                onClick={() => loadPage(page + 1, sort)}
                disabled={!hasNext || loading}
                className="grid h-9 w-9 place-items-center rounded-pill border border-ink-600 text-paper-muted transition-colors hover:border-paper-faint hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
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
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <MovieGridSkeleton count={12} />
      ) : (
        <MovieGrid movies={data.results.slice(0, 12)} />
      )}
    </section>
  );
}
