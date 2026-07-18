import Image from "next/image";
import type { MovieDetail } from "@/lib/types";
import { formatRuntime } from "@/lib/utils";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";
import { TagList } from "./TagList";
import { WatchOnButton } from "./WatchOnModal";

export function DetailHero({ movie }: { movie: MovieDetail }) {
  const runtime = formatRuntime(movie.runtime);
  const meta = [movie.releaseYear, runtime].filter(Boolean).join(" · ");

  return (
    <section className="relative">
      {/* Backdrop */}
      <div className="absolute inset-0 h-[420px] overflow-hidden">
        {movie.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/80 to-ink-900" />
      </div>

      <div className="relative mx-auto max-w-shell px-4 pt-8 sm:px-6 lg:px-8 lg:pt-16">
        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          {/* Poster */}
          <div className="mx-auto w-40 shrink-0 sm:w-52 md:mx-0 md:w-64">
            <div className="relative aspect-[2/3] overflow-hidden rounded-panel border border-ink-600 bg-ink-700 shadow-2xl">
              <Poster
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                title={movie.title}
                priority
                sizes="(max-width: 768px) 60vw, 256px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4 text-center md:pt-6 md:text-left">
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-paper sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-2 font-display text-base italic text-marquee/90">
                  {movie.tagline}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <RatingBadge rating={movie.rating} size="lg" />
              {movie.voteCount > 0 && (
                <span className="text-sm text-paper-faint">
                  {movie.voteCount.toLocaleString()} votes
                </span>
              )}
              {meta && <span className="text-sm text-paper-muted">{meta}</span>}
            </div>

            <div className="flex justify-center md:justify-start">
              <TagList genres={movie.genres} />
            </div>

            {movie.overview && (
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-paper-muted md:mx-0 md:text-base">
                {movie.overview}
              </p>
            )}

            <div className="mt-2 flex justify-center md:justify-start">
              <WatchOnButton title={movie.title} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
