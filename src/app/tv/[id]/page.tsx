import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRelatedTv, getTvDetail } from "@/lib/tmdb";
import { DetailHero } from "@/components/DetailHero";
import { DisclosureProvider, DetailsPanel } from "@/components/DetailsDisclosure";
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
  if (id === null) return { title: "Show not found" };

  const show = await getTvDetail(id);
  if (!show) return { title: "Show not found" };

  const description = show.overview
    ? truncate(show.overview, 160)
    : `Details, rating and where to watch ${show.title}.`;

  return {
    title: show.title,
    description,
    openGraph: {
      title: show.title,
      description,
      images: show.backdropUrl ? [{ url: show.backdropUrl }] : undefined,
      type: "video.tv_show",
    },
  };
}

export default async function TvShowPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const show = await getTvDetail(id);
  if (!show) notFound();

  const related = await getRelatedTv(id);

  const episodeRuntime = formatRuntime(show.runtime);

  const facts: Array<{ label: string; value: string }> = [
    { label: "Format", value: "TV series" },
    ...(show.directors.length
      ? [{ label: show.directors.length > 1 ? "Creators" : "Creator", value: show.directors.join(", ") }]
      : []),
    ...(show.numberOfSeasons
      ? [{ label: "Seasons", value: String(show.numberOfSeasons) }]
      : []),
    ...(show.numberOfEpisodes
      ? [{ label: "Episodes", value: String(show.numberOfEpisodes) }]
      : []),
    ...(episodeRuntime ? [{ label: "Episode length", value: episodeRuntime }] : []),
    ...(languageName(show.originalLanguage)
      ? [{ label: "Original language", value: languageName(show.originalLanguage) as string }]
      : []),
    ...(show.status ? [{ label: "Status", value: show.status }] : []),
    ...(show.releaseDate ? [{ label: "First air date", value: show.releaseDate }] : []),
  ];

  return (
    <div>
      <DisclosureProvider>
        <DetailHero movie={show} />

        <DetailsPanel>
          <div className="mx-auto mt-12 flex max-w-shell flex-col gap-14 px-4 sm:px-6 lg:px-8">
            {show.trailerKey && (
              <Section title="Trailer">
                <div className="max-w-3xl">
                  <TrailerPlayer youtubeKey={show.trailerKey} title={show.title} />
                </div>
              </Section>
            )}

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

            {show.cast.length > 0 && (
              <Section title="Cast">
                <CastGrid cast={show.cast} />
              </Section>
            )}
          </div>
        </DetailsPanel>
      </DisclosureProvider>

      {related.length > 0 && (
        <div className="mx-auto mt-12 max-w-shell px-4 sm:px-6 lg:px-8">
          <Section
            title="More like this"
            subtitle="Because you're looking at this show."
          >
            <MovieGrid movies={related} basePath="/tv" />
          </Section>
        </div>
      )}
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
