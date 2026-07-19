"use client";

import { useMyList } from "@/lib/useMyList";
import type { MovieSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Small icon-only toggle, meant to sit on top of a poster (e.g. MovieCard). */
export function SaveIconButton({ movie }: { movie: MovieSummary }) {
  const { has, toggle, hydrated } = useMyList();
  const saved = hydrated && has(movie.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(movie);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
      title={saved ? "Remove from My List" : "Add to My List"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-pill backdrop-blur-sm ring-1 ring-white/10 transition-colors",
        saved ? "bg-marquee text-ink-900" : "bg-ink-900/70 text-paper hover:bg-ink-900/90",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Full pill button with a label, for the detail hero action row. */
export function SaveButton({ movie }: { movie: MovieSummary }) {
  const { has, toggle, hydrated } = useMyList();
  const saved = hydrated && has(movie.id);

  return (
    <button
      type="button"
      onClick={() => toggle(movie)}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill border px-6 py-3 font-display text-base font-bold transition-colors",
        saved
          ? "border-marquee bg-marquee/10 text-marquee"
          : "border-ink-600 bg-ink-900/70 text-paper backdrop-blur-sm hover:border-marquee/60 hover:text-marquee",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      </svg>
      {saved ? "In My List" : "Add to My List"}
    </button>
  );
}
