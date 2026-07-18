import Link from "next/link";
import type { MovieSummary } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";

export function MovieCard({
  movie,
  priority = false,
}: {
  movie: MovieSummary;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-600 bg-ink-800 transition-all duration-200 hover:-translate-y-1 hover:border-marquee/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-ink-700">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <Poster src={movie.posterUrl} alt={`${movie.title} poster`} title={movie.title} priority={priority} />
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
