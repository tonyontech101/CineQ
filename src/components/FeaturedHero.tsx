"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Genre, MovieSummary } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { WatchOnButton } from "./WatchOnModal";

export function FeaturedHero({
  items,
  genres,
}: {
  items: MovieSummary[];
  genres: Genre[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  // Auto-advance ("loop") through featured titles; pause on hover/focus and
  // when the user prefers reduced motion.
  useEffect(() => {
    if (count <= 1 || paused) return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [count, paused]);

  // Guard against the index falling out of range if the list changes.
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  if (count === 0) return null;

  const movie = items[index % count];
  const genreMap = new Map(genres.map((g) => [g.id, g.name]));
  const names = movie.genreIds
    .map((id) => genreMap.get(id))
    .filter((n): n is string => Boolean(n))
    .slice(0, 3);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden rounded-panel border border-ink-600/70 bg-ink-800"
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        {movie.backdropUrl ? (
          <Image
            key={movie.id}
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="animate-fade-in object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900" />
        )}
        {/* Legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/40 to-transparent" />
      </div>

      {/* Top row: status badge + carousel controls */}
      <div className="relative flex items-start justify-between p-4 sm:p-6">
        {movie.releaseYear && (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink-900/70 px-3 py-1.5 text-xs font-semibold text-paper backdrop-blur-sm ring-1 ring-white/10">
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-marquee" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
            </svg>
            {movie.releaseYear}
          </span>
        )}

        {count > 1 && (
          <div className="flex items-center gap-2">
            <HeroArrow direction="prev" onClick={() => go(-1)} />
            <span className="min-w-[3.25rem] rounded-pill bg-ink-900/70 px-3 py-1.5 text-center text-xs font-semibold tabular-nums text-paper ring-1 ring-white/10 backdrop-blur-sm">
              {index + 1} <span className="text-paper-faint">/ {count}</span>
            </span>
            <HeroArrow direction="next" onClick={() => go(1)} />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative flex min-h-[300px] flex-col justify-end gap-4 p-5 pt-10 sm:min-h-[380px] sm:p-8 lg:min-h-[440px] lg:p-12">
        <div key={movie.id} className="flex animate-hero-in flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-paper">
            <MetaPill>Movie</MetaPill>
            {movie.rating > 0 && (
              <MetaPill>
                <span className="text-marquee">★</span> {movie.rating.toFixed(1)}
              </MetaPill>
            )}
            {movie.voteCount > 0 && (
              <MetaPill>{movie.voteCount.toLocaleString()} votes</MetaPill>
            )}
          </div>

          <Link href={`/movie/${movie.id}`} className="max-w-3xl">
            <h2 className="text-accent-gradient font-display text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
              {movie.title}
            </h2>
          </Link>

          {names.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {names.map((name) => (
                <li key={name}>
                  <span className="inline-block rounded-pill bg-ink-900/60 px-3 py-1 text-xs font-medium text-paper-muted ring-1 ring-white/10">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {movie.overview && (
            <p className="max-w-2xl text-sm leading-relaxed text-paper-muted line-clamp-3">
              {truncate(movie.overview, 260)}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-pill border border-ink-600 bg-ink-900/70 px-5 py-2.5 font-display text-sm font-bold text-paper backdrop-blur-sm transition-colors hover:border-marquee/50 hover:text-marquee"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
              </svg>
              DETAILS
            </Link>
            <WatchOnButton
              title={movie.title}
              label="WATCH NOW"
              className="inline-flex items-center gap-2 rounded-pill bg-marquee px-5 py-2.5 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous featured movie" : "Next featured movie"}
      className="grid h-9 w-9 place-items-center rounded-pill bg-ink-900/70 text-paper ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-marquee hover:text-ink-900"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("h-4 w-4", direction === "prev" && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-ink-900/60 px-2.5 py-1 ring-1 ring-white/10">
      {children}
    </span>
  );
}
