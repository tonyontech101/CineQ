import Link from "next/link";
import type { Studio } from "@/lib/types";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "US",
  GB: "GB",
  JP: "JP",
  FR: "FR",
  SE: "SE",
  NO: "NO",
  CA: "CA",
  DE: "DE",
  KR: "KR",
  IN: "IN",
};

export function StudioCard({ studio }: { studio: Studio }) {
  return (
    <Link
      href={`/studios/${studio.tmdbCompanyId}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-600 bg-ink-800 transition-all duration-200 hover:-translate-y-1 hover:border-marquee/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
    >
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900">
        {studio.logoPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w200${studio.logoPath}`}
            alt={`${studio.name} logo`}
            className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-marquee/10 text-2xl font-bold text-marquee transition-colors duration-300 group-hover:bg-marquee/20">
            {studio.name.charAt(0)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900/90 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold leading-tight text-paper line-clamp-1">
            {studio.name}
          </h3>
          {studio.originCountry && (
            <span
              className="shrink-0 rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper-faint"
              title={studio.originCountry}
            >
              {COUNTRY_FLAGS[studio.originCountry] ?? studio.originCountry}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-paper-muted line-clamp-2">
          {studio.description}
        </p>
      </div>
    </Link>
  );
}
