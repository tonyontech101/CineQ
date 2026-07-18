"use client";

import { useCallback, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GenreFilter({
  genres,
  selectedIds,
}: {
  genres: Genre[];
  selectedIds: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const selected = new Set(selectedIds);

  const commit = useCallback(
    (nextIds: number[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextIds.length) params.set("genres", nextIds.join(","));
      else params.delete("genres");
      params.delete("page"); // reset pagination when the filter changes
      params.delete("q"); // browsing by genre exits search
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commit(Array.from(next));
  };

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const pill = (active: boolean) =>
    cn(
      "whitespace-nowrap rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "border-marquee bg-marquee text-ink-900"
        : "border-ink-600 bg-ink-800/60 text-paper-muted hover:border-paper-faint hover:text-paper",
    );

  return (
    <div className="relative flex items-center gap-2">
      <ArrowButton direction="prev" onClick={() => scrollBy(-1)} />

      <div
        ref={scrollerRef}
        role="group"
        aria-label="Filter movies by genre"
        className={cn(
          "no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1 transition-opacity",
          isPending && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={() => commit([])}
          aria-pressed={selected.size === 0}
          className={pill(selected.size === 0)}
        >
          All
        </button>

        {genres.map((genre) => {
          const active = selected.has(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggle(genre.id)}
              aria-pressed={active}
              className={pill(active)}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      <ArrowButton direction="next" onClick={() => scrollBy(1)} />
    </div>
  );
}

function ArrowButton({
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
      aria-label={direction === "prev" ? "Scroll genres left" : "Scroll genres right"}
      className="hidden h-9 w-9 shrink-0 place-items-center rounded-pill border border-ink-600 bg-ink-800 text-paper-muted transition-colors hover:border-marquee/50 hover:text-marquee sm:grid"
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
