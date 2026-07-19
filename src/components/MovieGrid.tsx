import type { MovieSummary } from "@/lib/types";
import { MovieCard } from "./MovieCard";

const GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MovieGrid({
  movies,
  basePath = "/movie",
}: {
  movies: MovieSummary[];
  basePath?: string;
}) {
  return (
    <div className={GRID_CLASS}>
      {movies.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} priority={i < 6} basePath={basePath} />
      ))}
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-card border border-ink-600 bg-ink-800"
        >
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-3.5 w-3/4 rounded" />
            <div className="skeleton h-2.5 w-full rounded" />
            <div className="skeleton h-2.5 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No movies found",
  message = "Try removing a genre or two to widen your search.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-ink-600 py-20 text-center">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-10 w-10 text-paper-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <h2 className="font-display text-lg font-bold text-paper">{title}</h2>
      <p className="max-w-sm text-sm text-paper-muted">{message}</p>
    </div>
  );
}
