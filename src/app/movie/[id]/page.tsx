import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCollection,
  getMovieDetail,
  getRelatedMovies,
} from "@/lib/tmdb";
import { DetailHero } from "@/components/DetailHero";
import { MovieGrid } from "@/components/MovieGrid";
import { CastGrid } from "@/components/CastGrid";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { formatRuntime, languageName, truncate } from "@/lib/utils";

function parseId(param: string): number | null {
  if (!/^\d+$/.test(param)) return null;
  const n = Number.parseInt(param, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = parseId(params.id);
  if (id === null) return { title: "Movie not found" };

  const movie = await getMovieDetail(id);
  if (!movie) return { title: "Movie not found" };

  const description = movie.overview
    ? truncate(movie.overview, 160)
    : `Details, rating and where to watch ${movie.title}.`;

  return {
    title: movie.title,
    description,
    openGraph: {
      title: movie.title,
      description,
      images: movie.backdropUrl ? [{ url: movie.backdropUrl }] : undefined,
      type: "video.movie",
    },
  };
}

export default async function MoviePage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const movie = await getMovieDetail(id);
  if (!movie) notFound();

  // Franchise (prequel/sequel) parts + general recommendations, in parallel.
  const [collection, related] = await Promise.all([
    movie.collection ? getCollection(movie.collection.id) : Promise.resolve(null),
    getRelatedMovies(id),
  ]);

  const franchiseParts =
    collection?.parts.filter((p) => p.id !== movie.id) ?? [];

  const facts: Array<{ label: string; value: string }> = [
    { label: "Format", value: "Feature film" },
    ...(movie.directors.length
      ? [{ label: movie.directors.length > 1 ? "Directors" : "Director", value: movie.directors.join(", ") }]
      : []),
    ...(formatRuntime(movie.runtime)
      ? [{ label: "Runtime", value: formatRuntime(movie.runtime) as string }]
      : []),
    ...(languageName(movie.originalLanguage)
      ? [{ label: "Original language", value: languageName(movie.originalLanguage) as string }]
      : []),
    ...(movie.status ? [{ label: "Status", value: movie.status }] : []),
    ...(movie.releaseDate ? [{ label: "Release date", value: movie.releaseDate }] : []),
  ];

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-shell px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-paper-muted transition-colors hover:text-paper"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to browse
        </Link>
      </div>

      <DetailHero movie={movie} />

      <div className="mx-auto mt-12 flex max-w-shell flex-col gap-14 px-4 sm:px-6 lg:px-8">
        {/* Trailer */}
        {movie.trailerKey && (
          <Section title="Trailer">
            <div className="max-w-3xl">
              <TrailerPlayer youtubeKey={movie.trailerKey} title={movie.title} />
            </div>
          </Section>
        )}

        {/* Facts */}
        <Section title="Details">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="border-b border-ink-600 pb-3">
                <dt className="text-xs uppercase tracking-wide text-paper-faint">
                  {f.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-paper">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Cast */}
        {movie.cast.length > 0 && (
          <Section title="Cast">
            <CastGrid cast={movie.cast} />
          </Section>
        )}

        {/* Prequels / sequels */}
        {franchiseParts.length > 0 && (
          <Section
            title={collection ? `Part of the ${collection.name}` : "Related films"}
            subtitle="Prequels, sequels and other films in this franchise."
          >
            <MovieGrid movies={franchiseParts} />
          </Section>
        )}

        {/* Recommendations */}
        {related.length > 0 && (
          <Section title="You might also like">
            <MovieGrid movies={related} />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-paper">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-paper-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
