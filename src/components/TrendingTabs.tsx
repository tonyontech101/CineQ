"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Paginated, MovieSummary, TrendingMedia } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { MovieGrid, MovieGridSkeleton, EmptyState } from "@/components/MovieGrid";
import { Poster } from "@/components/Poster";
import { RatingBadge } from "@/components/RatingBadge";

type TabId = "week" | "day" | "all";

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: "week", label: "This Week" },
  { id: "day", label: "Today" },
  { id: "all", label: "All" },
];

export function TrendingTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("week");

  return (
    <div>
      <div
        className="mb-8 flex w-fit gap-1 rounded-full bg-ink-800 p-1"
        role="tablist"
        aria-label="Trending time window"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-marquee text-ink-900"
                : "text-paper-muted hover:text-paper",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "week" && <TimeWindowContent timeWindow="week" key="week" />}
      {activeTab === "day" && <TimeWindowContent timeWindow="day" key="day" />}
      {activeTab === "all" && <AllContent key="all" />}
    </div>
  );
}

function TimeWindowContent({ timeWindow }: { timeWindow: "day" | "week" }) {
  const [movies, setMovies] = useState<Paginated<MovieSummary> | null>(null);
  const [tv, setTv] = useState<Paginated<MovieSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/trending?timeWindow=${timeWindow}&mediaType=movie`).then((r) => {
        if (!r.ok) throw new Error(`Movies: HTTP ${r.status}`);
        return r.json() as Promise<Paginated<MovieSummary>>;
      }),
      fetch(`/api/trending?timeWindow=${timeWindow}&mediaType=tv`).then((r) => {
        if (!r.ok) throw new Error(`TV: HTTP ${r.status}`);
        return r.json() as Promise<Paginated<MovieSummary>>;
      }),
    ])
      .then(([moviesData, tvData]) => {
        if (!cancelled) {
          setMovies(moviesData);
          setTv(tvData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [timeWindow]);

  if (loading) return <TimeWindowSkeleton />;

  if (error) {
    return (
      <p className="rounded-panel border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400" role="alert">
        {error}
      </p>
    );
  }

  const hasMovies = (movies?.results.length ?? 0) > 0;
  const hasTv = (tv?.results.length ?? 0) > 0;

  if (!hasMovies && !hasTv) {
    return <EmptyState title="Nothing trending" message="Check back later for trending titles." />;
  }

  return (
    <div className="space-y-10">
      {hasMovies && movies!.results[0] && (
        <TrendingHero movie={movies!.results[0]} />
      )}

      {hasMovies && (
        <section aria-label="Trending movies">
          <h2 className="mb-4 font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
            Trending Movies
          </h2>
          <MovieGrid movies={movies!.results} basePath="/movie" />
        </section>
      )}

      {hasTv && (
        <section aria-label="Trending TV">
          <h2 className="mb-4 font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
            Trending TV
          </h2>
          <MovieGrid movies={tv!.results} basePath="/tv" />
        </section>
      )}
    </div>
  );
}

function AllContent() {
  const [data, setData] = useState<Paginated<TrendingMedia> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/trending?timeWindow=week&mediaType=all")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Paginated<TrendingMedia>>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <MovieGridSkeleton count={12} />;

  if (error) {
    return (
      <p className="rounded-panel border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400" role="alert">
        {error}
      </p>
    );
  }

  const items = data?.results ?? [];

  if (items.length === 0) {
    return <EmptyState title="Nothing trending" message="Check back later for trending titles." />;
  }

  return (
    <section aria-label="All trending">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, i) => {
          const basePath = item.media_type === "tv" ? "/tv" : "/movie";
          return (
            <div key={item.id} className="relative">
              {item.media_type && (
                <span
                  className={cn(
                    "absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    item.media_type === "tv"
                      ? "bg-purple-500 text-white"
                      : "bg-marquee text-ink-900",
                  )}
                >
                  {item.media_type === "tv" ? "TV" : "Film"}
                </span>
              )}
              <AllCard movie={item} priority={i < 6} basePath={basePath} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrendingHero({ movie }: { movie: MovieSummary }) {
  return (
    <section
      aria-label="Top trending movie"
      className="relative overflow-hidden rounded-panel border border-ink-600/70 bg-ink-800"
    >
      <div className="absolute inset-0">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/40 to-transparent" />
      </div>

      <div className="relative flex min-h-[260px] flex-col justify-end gap-4 p-5 pt-10 sm:min-h-[320px] sm:p-8 lg:min-h-[380px] lg:p-12">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-marquee px-3 py-1.5 text-ink-900">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            #1 Trending
          </span>

          {movie.rating > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/60 px-2.5 py-1 text-paper ring-1 ring-white/10">
              <span className="text-marquee">★</span> {movie.rating.toFixed(1)}
            </span>
          )}

          {movie.releaseYear && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/60 px-2.5 py-1 text-paper ring-1 ring-white/10">
              {movie.releaseYear}
            </span>
          )}
        </div>

        <Link href={`/movie/${movie.id}`} className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold leading-tight drop-shadow-sm text-paper sm:text-3xl lg:text-4xl">
            {movie.title}
          </h2>
        </Link>

        {movie.overview && (
          <p className="max-w-xl text-sm leading-relaxed text-paper-muted line-clamp-2">
            {truncate(movie.overview, 260)}
          </p>
        )}

        <Link
          href={`/movie/${movie.id}`}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-marquee px-5 py-2.5 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee/80"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
          </svg>
          DETAILS
        </Link>
      </div>
    </section>
  );
}

function AllCard({
  movie,
  priority = false,
  basePath = "/movie",
}: {
  movie: TrendingMedia;
  priority?: boolean;
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-600 bg-ink-800 transition-all duration-200 hover:-translate-y-1 hover:border-marquee/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-ink-700">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <Poster
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            title={movie.title}
            priority={priority}
          />
        </div>
        <div className="absolute right-2 top-2 z-10">
          <RatingBadge rating={movie.rating} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900/90 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-bold leading-tight text-paper line-clamp-2">
            {movie.title}
          </h3>
          {movie.releaseYear && (
            <span className="shrink-0 text-xs tabular-nums text-paper-faint">
              {movie.releaseYear}
            </span>
          )}
        </div>
        {movie.overview && (
          <p className="text-xs leading-relaxed text-paper-muted line-clamp-3">
            {truncate(movie.overview, 120)}
          </p>
        )}
      </div>
    </Link>
  );
}

function TimeWindowSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <div className="skeleton min-h-[260px] w-full rounded-panel sm:min-h-[320px] lg:min-h-[380px]" />

      <div>
        <div className="skeleton mb-4 h-7 w-48 rounded" />
        <MovieGridSkeleton count={12} />
      </div>

      <div>
        <div className="skeleton mb-4 h-7 w-48 rounded" />
        <MovieGridSkeleton count={12} />
      </div>
    </div>
  );
}
