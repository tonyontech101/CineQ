import { MovieGridSkeleton } from "@/components/MovieGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {/* Hero */}
      <div className="skeleton mb-6 h-[300px] w-full rounded-panel sm:h-[380px] lg:h-[440px]" />

      {/* Genre strip */}
      <div className="mb-8 flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-pill" />
        ))}
      </div>

      <div className="mb-5 space-y-2">
        <div className="skeleton h-7 w-56 max-w-full rounded" />
      </div>
      <MovieGridSkeleton />
    </div>
  );
}
