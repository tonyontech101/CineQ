import Link from "next/link";
import { discoverMovies, getGenres, searchMovies } from "@/lib/tmdb";
import { GenreFilter } from "@/components/GenreFilter";
import { FeaturedHero } from "@/components/FeaturedHero";
import { MovieGrid, EmptyState } from "@/components/MovieGrid";

// TMDB paginates up to 500 pages; keep requests within that range.
const MAX_PAGE = 500;

function parseGenres(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_PAGE);
}

function parseQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 120);
}

function buildQuery(opts: { genreIds: number[]; q: string; page: number }): string {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  else if (opts.genreIds.length) params.set("genres", opts.genreIds.join(","));
  if (opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: {
    genres?: string | string[];
    page?: string | string[];
    q?: string | string[];
  };
}) {
  const q = parseQuery(searchParams.q);
  const selectedIds = parseGenres(searchParams.genres);
  const page = parsePage(searchParams.page);
  const isSearching = q.length > 0;

  const [genres, results] = await Promise.all([
    getGenres(),
    isSearching
      ? searchMovies({ query: q, page })
      : discoverMovies({ genreIds: selectedIds, page }),
  ]);

  const showHero = !isSearching && page === 1 && results.results.length > 0;
  const featured = results.results.slice(0, 8);

  const hasPrev = results.page > 1;
  const hasNext = results.page < results.totalPages;

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {showHero && (
        <div className="mb-6">
          <FeaturedHero items={featured} genres={genres} />
        </div>
      )}

      {/* Genre strip */}
      <section className="mb-8" aria-label="Genre filter">
        <GenreFilter genres={genres} selectedIds={selectedIds} />
      </section>

      {/* Results header */}
      <section className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
            {isSearching ? (
              <>
                Results for <span className="text-marquee">&ldquo;{q}&rdquo;</span>
              </>
            ) : selectedIds.length ? (
              "Filtered movies"
            ) : (
              "Popular right now"
            )}
          </h1>
          {isSearching && (
            <p className="mt-1 text-sm text-paper-muted">
              {results.totalResults.toLocaleString()} title
              {results.totalResults === 1 ? "" : "s"} found
            </p>
          )}
        </div>
      </section>

      {results.results.length === 0 ? (
        <EmptyState
          title={isSearching ? "No matches" : "No movies found"}
          message={
            isSearching
              ? "Try a different title or spelling."
              : "Try removing a genre or two to widen your search."
          }
        />
      ) : (
        <>
          <MovieGrid movies={results.results} />

          {(hasPrev || hasNext) && (
            <nav
              className="mt-10 flex items-center justify-center gap-3"
              aria-label="Pagination"
            >
              <PagerLink
                href={buildQuery({ genreIds: selectedIds, q, page: results.page - 1 })}
                disabled={!hasPrev}
                rel="prev"
              >
                ← Previous
              </PagerLink>
              <span className="text-sm tabular-nums text-paper-muted">
                Page {results.page} of {results.totalPages}
              </span>
              <PagerLink
                href={buildQuery({ genreIds: selectedIds, q, page: results.page + 1 })}
                disabled={!hasNext}
                rel="next"
              >
                Next →
              </PagerLink>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  rel,
  children,
}: {
  href: string;
  disabled: boolean;
  rel: "prev" | "next";
  children: React.ReactNode;
}) {
  const className =
    "rounded-pill border border-ink-600 px-4 py-2 text-sm font-medium transition-colors";
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${className} cursor-not-allowed text-paper-faint opacity-40`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={rel}
      scroll
      className={`${className} text-paper-muted hover:border-paper-faint hover:text-paper`}
    >
      {children}
    </Link>
  );
}
