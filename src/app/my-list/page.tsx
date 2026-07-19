"use client";

import { useMyList } from "@/lib/useMyList";
import { MovieGrid, EmptyState, MovieGridSkeleton } from "@/components/MovieGrid";

export default function MyListPage() {
  const { list, hydrated } = useMyList();

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      <section className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
          My List
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-paper-muted">
          Movies you&rsquo;ve saved on this device. Stored locally in your browser —
          nothing is uploaded.
        </p>
      </section>

      {!hydrated ? (
        <MovieGridSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          message="Tap the bookmark icon on any movie card, or “Add to My List” on a movie’s page, to save it here."
        />
      ) : (
        <MovieGrid movies={list} />
      )}
    </div>
  );
}
