"use client";

import Link from "next/link";
import type { Studio } from "@/lib/types";
import { cn } from "@/lib/utils";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  JP: "🇯🇵",
  FR: "🇫🇷",
  SE: "🇸🇪",
  NO: "🇳🇴",
  CA: "🇨🇦",
  DE: "🇩🇪",
  KR: "🇰🇷",
  IN: "🇮🇳",
};

/**
 * "Browse by Studio" — a two-row grid of production-studio cards shown below
 * the featured hero on the home page. Real TMDB logos sit on a bright "brand
 * plate"; at rest the grid is desaturated so mismatched logo colors read as one
 * cohesive wall, then bloom into full color on hover.
 */
export function StudioSection({ studios = [] }: { studios?: Studio[] }) {
  if (studios.length === 0) return null;

  return (
    <section aria-label="Browse by studio" className="relative">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
            Browse by <span className="text-accent-gradient">Studio</span>
          </h2>
          <p className="mt-1 text-sm text-paper-muted">
            Jump straight into the catalog of the houses behind the classics.
          </p>
        </div>

        <Link
          href="/studios"
          className="hidden shrink-0 whitespace-nowrap rounded-pill border border-ink-600 px-4 py-2 text-sm font-semibold text-paper-muted transition-colors hover:border-marquee/50 hover:text-marquee sm:inline-block"
        >
          View all
        </Link>
      </div>

      {/* 2-row grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {studios.map((studio) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </div>
    </section>
  );
}

function StudioCard({ studio }: { studio: Studio }) {
  const logoUrl = studio.logoPath
    ? `https://image.tmdb.org/t/p/w300${studio.logoPath}`
    : null;
  const flag = studio.originCountry ? COUNTRY_FLAGS[studio.originCountry] : null;

  return (
    <Link
      href={`/studios/${studio.tmdbCompanyId}`}
      aria-label={`Browse films from ${studio.name}`}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-card",
        "border border-ink-600 bg-ink-800 transition-all duration-300",
        "hover:-translate-y-1 hover:border-marquee/40",
        "hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.85)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee/60",
      )}
    >
      {/* Brand plate */}
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#E9EBEF] p-6">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${studio.name} logo`}
            loading="lazy"
            className={cn(
              "max-h-full w-auto max-w-full object-contain",
              "opacity-80 grayscale transition-all duration-300",
              "group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0",
            )}
          />
        ) : (
          <span className="font-display text-3xl font-extrabold tracking-tight text-ink-800">
            {studio.name
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
        )}

        {/* Sheen sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      </div>

      {/* Footer label */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="truncate font-display text-[13px] font-bold leading-tight text-paper transition-colors group-hover:text-marquee">
          {studio.name}
        </span>
        {flag && (
          <span className="shrink-0 text-sm" title={studio.originCountry ?? undefined}>
            {flag}
          </span>
        )}
      </div>
    </Link>
  );
}
