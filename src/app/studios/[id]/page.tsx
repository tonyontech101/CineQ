import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudioByCompanyId, discoverMoviesByStudio, studioLogoUrl } from "@/lib/tmdb";
import { EmptyState } from "@/components/MovieGrid";
import { StudioMovies } from "@/components/StudioMovies";

function parseId(param: string): number | null {
  const n = Number.parseInt(param, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  JP: "Japan",
  FR: "France",
  SE: "Sweden",
  NO: "Norway",
  CA: "Canada",
  DE: "Germany",
  KR: "South Korea",
  IN: "India",
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const companyId = parseId(params.id);
  if (companyId === null) return { title: "Studio not found" };

  const studio = await getStudioByCompanyId(companyId);
  if (!studio) return { title: "Studio not found" };

  return {
    title: studio.name,
    description: studio.description,
  };
}

export default async function StudioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const companyId = parseId(params.id);
  if (companyId === null) notFound();

  const [studio, movies] = await Promise.all([
    getStudioByCompanyId(companyId),
    discoverMoviesByStudio({ companyId, page: 1 }),
  ]);

  if (!studio) notFound();

  const logoSrc = studioLogoUrl(studio.logoPath);

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-paper-faint">
          <li>
            <Link href="/studios" className="transition-colors hover:text-marquee">
              Studios
            </Link>
          </li>
          <li aria-hidden>
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </li>
          <li className="text-paper-muted">{studio.name}</li>
        </ol>
      </nav>

      {/* Hero section */}
      <section className="mb-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Logo */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-panel border border-ink-600 bg-ink-800 sm:h-32 sm:w-32">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${studio.name} logo`}
                className="h-16 w-auto object-contain sm:h-20"
              />
            ) : (
              <span className="text-4xl font-bold text-marquee">
                {studio.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
              {studio.name}
            </h1>

            {studio.originCountry && (
              <p className="mt-2 text-sm text-paper-muted">
                {COUNTRY_NAMES[studio.originCountry] ?? studio.originCountry}
              </p>
            )}

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-muted">
              {studio.description}
            </p>

            {movies.totalResults > 0 && (
              <p className="mt-3 text-xs text-paper-faint">
                {movies.totalResults.toLocaleString()} title
                {movies.totalResults === 1 ? "" : "s"} in catalog
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Movies */}
      {movies.results.length === 0 ? (
        <EmptyState
          title="No films found"
          message="This studio doesn't have any films in our catalog yet."
        />
      ) : (
        <StudioMovies companyId={companyId} initialData={movies} />
      )}
    </div>
  );
}
