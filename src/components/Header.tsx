import Link from "next/link";
import { Suspense } from "react";
import { isLiveData } from "@/lib/tmdb";
import { SearchBar } from "./SearchBar";

function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-card border border-ink-600 bg-ink-800/60 text-paper-muted transition-colors hover:border-marquee/50 hover:text-paper"
    >
      {children}
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600/70 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-3 sm:gap-5 sm:px-5 lg:px-6">
        {/* Left: menu + wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            aria-label="Browse all movies"
            title="Browse"
            className="grid h-10 w-10 place-items-center rounded-card text-paper-muted transition-colors hover:bg-ink-800 hover:text-paper"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </Link>

          <Link href="/" className="flex items-baseline gap-1" aria-label="CineQueue home">
            <span className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
              CINE<span className="text-marquee">QUEUE</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-paper-faint sm:inline">
              tv
            </span>
          </Link>
        </div>

        {/* Center: search */}
        <div className="mx-auto flex w-full max-w-2xl items-center">
          <Suspense fallback={<div className="h-11 w-full rounded-pill border border-ink-600 bg-ink-800/60" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {!isLiveData && (
            <span
              title="No TMDB API key configured — showing bundled sample data."
              className="hidden rounded-pill border border-ink-600 px-3 py-1 text-xs text-paper-muted lg:inline"
            >
              Demo data
            </span>
          )}
          <IconButton href="/" label="Browse library">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18" />
            </svg>
          </IconButton>
          <IconButton href="/" label="Home">
            <span className="font-display text-sm font-extrabold text-marquee">C</span>
          </IconButton>
        </div>
      </div>
    </header>
  );
}
