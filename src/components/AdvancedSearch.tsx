"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Curated list of common film-producing origin countries (ISO 3166-1). */
const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "RU", name: "Russia" },
  { code: "TR", name: "Turkey" },
  { code: "TH", name: "Thailand" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => CURRENT_YEAR - i);

type MediaType = "movie" | "tv";

export function AdvancedSearch({
  genres,
  tvGenres,
}: {
  genres: Genre[];
  /** TV genre set — TMDB uses different genre IDs for TV than for movies. */
  tvGenres?: Genre[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Draft filter state — seeded from the URL and only committed on "Apply".
  const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState<MediaType>("movie");

  // Movies and TV use distinct TMDB genre sets — show the one matching `type`.
  const activeGenres = type === "tv" ? (tvGenres ?? genres) : genres;

  // Number of filters currently active in the URL (drives the badge dot).
  const activeCount = useMemo(() => {
    let n = 0;
    if (searchParams.get("genres")) n += 1;
    if (searchParams.get("year")) n += 1;
    if (searchParams.get("country")) n += 1;
    return n;
  }, [searchParams]);

  // Seed the draft from the current URL each time the panel opens.
  const seedFromUrl = () => {
    const g = searchParams.get("genres");
    setSelectedGenres(
      new Set(
        (g ?? "")
          .split(",")
          .map((v) => Number.parseInt(v, 10))
          .filter((v) => Number.isInteger(v) && v > 0),
      ),
    );
    setYear(searchParams.get("year") ?? "");
    setCountry(searchParams.get("country") ?? "");
    setType(pathname.startsWith("/tv") ? "tv" : "movie");
  };

  // Close on Escape + click outside.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Switching media type: keep only selections that exist in the new genre set,
  // since movie and TV genre IDs don't overlap (e.g. TV has "Sci-Fi & Fantasy").
  const changeType = (next: MediaType) => {
    if (next === type) return;
    const validIds = new Set((next === "tv" ? (tvGenres ?? genres) : genres).map((g) => g.id));
    setSelectedGenres((prev) => new Set(Array.from(prev).filter((id) => validIds.has(id))));
    setType(next);
  };

  const reset = () => {
    setSelectedGenres(new Set());
    setYear("");
    setCountry("");
    setType("movie");
  };

  const apply = () => {
    const params = new URLSearchParams();
    if (selectedGenres.size) params.set("genres", Array.from(selectedGenres).join(","));
    if (year) params.set("year", year);
    if (country) params.set("country", country);

    const target = type === "tv" ? "/tv" : "/";
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target, { scroll: false });
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) seedFromUrl();
          setOpen((v) => !v);
        }}
        aria-label="Advanced filters"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "relative grid h-11 w-11 place-items-center rounded-pill border transition-colors",
          open || activeCount > 0
            ? "border-marquee/60 bg-marquee-soft text-marquee"
            : "border-ink-600 bg-ink-800/80 text-paper-muted hover:border-paper-faint hover:text-paper",
        )}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 5h18l-7 8v6l-4-2v-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-pill bg-marquee px-1 text-[10px] font-bold text-ink-900">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Advanced filters"
          className={cn(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(92vw,22rem)]",
            "origin-top-right animate-scale-in rounded-panel border border-ink-600 bg-ink-800 shadow-2xl",
          )}
        >
          <div className="flex items-center justify-between border-b border-ink-600 px-4 py-3">
            <h2 className="font-display text-sm font-bold text-paper">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="rounded-pill p-1 text-paper-muted transition-colors hover:bg-ink-700 hover:text-paper"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4">
            {/* Type */}
            <Field label="Type">
              <div className="grid grid-cols-2 gap-1 rounded-pill border border-ink-600 bg-ink-900/60 p-1">
                {(["movie", "tv"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changeType(t)}
                    aria-pressed={type === t}
                    className={cn(
                      "rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
                      type === t
                        ? "bg-marquee text-ink-900"
                        : "text-paper-muted hover:text-paper",
                    )}
                  >
                    {t === "movie" ? "Movie" : "TV Show"}
                  </button>
                ))}
              </div>
            </Field>

            {/* Genres */}
            <Field label="Genres">
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                {activeGenres.map((g) => {
                  const active = selectedGenres.has(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      aria-pressed={active}
                      className={cn(
                        "whitespace-nowrap rounded-pill border px-3 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-marquee bg-marquee text-ink-900"
                          : "border-ink-600 bg-ink-800/60 text-paper-muted hover:border-paper-faint hover:text-paper",
                      )}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Year */}
            <Field label="Year">
              <Select value={year} onChange={setYear}>
                <option value="">Any year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Country */}
            <Field label="Country">
              <Select value={country} onChange={setCountry}>
                <option value="">Any country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-ink-600 px-4 py-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-pill px-3 py-2 text-sm font-medium text-paper-muted transition-colors hover:text-paper"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-pill bg-marquee px-5 py-2 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-paper-faint">{label}</p>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-card border border-ink-600 bg-ink-900/60 py-2 pl-3 pr-9 text-sm text-paper transition-colors hover:border-paper-faint focus:border-marquee/60 focus:outline-none"
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
