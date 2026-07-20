import Link from "next/link";
import { Suspense } from "react";
import { getGenres, getTvGenres, isLiveData } from "@/lib/tmdb";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";

export async function Header() {
  const [genres, tvGenres] = await Promise.all([getGenres(), getTvGenres()]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600/70 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-3 sm:gap-5 sm:px-5 lg:px-6">
        {/* Left: hamburger + wordmark (hidden on desktop — sidebar has the logo) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:grow-0">
          <Suspense fallback={<div className="h-9 w-9 rounded-lg border border-ink-600 bg-ink-800/60 lg:hidden" />}>
            <MobileNav />
          </Suspense>

          <Link href="/" className="flex items-baseline gap-1 lg:hidden" aria-label="CineQueue home">
            <span className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
              CINE<span className="text-marquee">QUEUE</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-paper-faint sm:inline">
              tv
            </span>
          </Link>
        </div>

        {/* Center: search + advanced filters */}
        <div className="mx-auto flex min-w-0 max-w-2xl flex-1 items-center gap-2">
          <Suspense fallback={<div className="h-11 w-full rounded-pill border border-ink-600 bg-ink-800/60" />}>
            <SearchBar />
          </Suspense>
          <Suspense fallback={<div className="h-11 w-11 shrink-0 rounded-pill border border-ink-600 bg-ink-800/60" />}>
            <AdvancedSearch genres={genres} tvGenres={tvGenres} />
          </Suspense>
        </div>

        {/* Right: demo data badge */}
        {!isLiveData && (
          <span
            title="No TMDB API key configured — showing bundled sample data."
            className="hidden shrink-0 rounded-pill border border-ink-600 px-3 py-1 text-xs text-paper-muted lg:inline"
          >
            Demo data
          </span>
        )}
      </div>
    </header>
  );
}
