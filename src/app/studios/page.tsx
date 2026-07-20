import type { Metadata } from "next";
import { StudioSection } from "@/components/StudioSection";
import { getStudios } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Studios",
  description: "Browse movie studios and discover their filmographies on CineQueue.",
};

export default async function StudiosPage() {
  const studios = await getStudios();

  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      <div className="relative mb-10 overflow-hidden rounded-panel border border-ink-600/70 bg-ink-800 p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-marquee/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-marquee/5 blur-3xl"
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-marquee/10 px-3 py-1 text-xs font-semibold text-marquee ring-1 ring-marquee/20">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <path d="M2 8h20M2 16h20M8 2v20M16 2v20" />
              </svg>
              Studios
            </span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-paper sm:text-4xl lg:text-5xl">
            The <span className="text-accent-gradient">Studio</span> Collection
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper-muted sm:text-base">
            From Hollywood giants to independent powerhouses - explore the studios
            that shape the stories we love. Each card reveals their catalog size
            and signature style.
          </p>
        </div>
      </div>

      <StudioSection studios={studios} />

      <div className="mt-12 text-center">
        <p className="text-sm text-paper-faint">
          More studios coming soon. Check back for updates.
        </p>
      </div>
    </div>
  );
}
