"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudioProps {
  id: number;
  name: string;
  description: string;
  logoPath: string | null;
  originCountry: string | null;
  tmdbCompanyId: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "US", GB: "GB", JP: "JP", FR: "FR", SE: "SE", NO: "NO", CA: "CA",
};

export function StudioGrid({ studios }: { studios: StudioProps[] }) {
  if (studios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-ink-600 py-20 text-center">
        <h2 className="font-display text-lg font-bold text-paper">No studios found</h2>
        <p className="max-w-sm text-sm text-paper-muted">Check back later for studio listings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {studios.map((studio) => (
        <StudioCard key={studio.id} studio={studio} />
      ))}
    </div>
  );
}

function StudioCard({ studio }: { studio: StudioProps }) {
  return (
    <Link
      href={`/studios/${studio.tmdbCompanyId}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-panel border border-ink-600 bg-ink-800 transition-all duration-300",
        "hover:-translate-y-1.5 hover:border-transparent",
        "hover:shadow-[0_25px_50px_-16px_rgba(0,0,0,0.7)]",
      )}
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

      <div className="flex flex-1 flex-col gap-2 p-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-display text-base font-bold text-paper transition-colors duration-300 group-hover:text-white">
            {studio.name}
          </h3>
          {studio.originCountry && (
            <span className="shrink-0 rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper-faint">
              {COUNTRY_FLAGS[studio.originCountry] ?? studio.originCountry}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-paper-muted line-clamp-2">
          {studio.description}
        </p>

        <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-ink-600 bg-ink-700/50 px-3 py-2 text-xs font-semibold text-paper-muted transition-all duration-300 group-hover:border-marquee/40 group-hover:text-marquee group-hover:bg-marquee/5">
          Explore films
          <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
