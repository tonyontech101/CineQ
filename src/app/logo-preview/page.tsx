import type { Metadata } from "next";
import { LogoPlayDisc, LogoInterlock, LogoReel } from "@/components/logo-variants";

export const metadata: Metadata = {
  title: "Logo preview",
};

const VARIANTS = [
  {
    key: "A",
    name: "Play Disc",
    note: "Q as a cyan play disc + triangle. Most product-meaningful; reads best tiny.",
    Logo: LogoPlayDisc,
  },
  {
    key: "B",
    name: "Interlock",
    note: "Two linked rings — closest to the reference chain-link art.",
    Logo: LogoInterlock,
  },
  {
    key: "C",
    name: "Film Reel",
    note: "Q as a film reel (hub + sprockets). Leans hardest into the movie theme.",
    Logo: LogoReel,
  },
];

export default function LogoPreviewPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper">
        Logo directions
      </h1>
      <p className="mt-1 text-sm text-paper-muted">
        Pick one — tell me the letter and I&apos;ll set it app-wide (it&apos;s a one-line
        change) and refresh the favicon. Then I&apos;ll delete this page.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {VARIANTS.map(({ key, name, note, Logo }) => (
          <section
            key={key}
            className="rounded-panel border border-ink-600/70 bg-ink-900 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-paper">
                  {key}. {name}
                </h2>
                <p className="mt-0.5 max-w-md text-xs text-paper-muted">{note}</p>
              </div>
              <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper-faint">
                {key}
              </span>
            </div>

            {/* Size ramp */}
            <div className="mt-6 flex flex-wrap items-end gap-8">
              <Logo className="h-6 w-auto" />
              <Logo className="h-9 w-auto" />
              <Logo className="h-14 w-auto" />

              {/* With wordmark, as it appears in the expanded sidebar */}
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-auto" />
                <span className="flex items-baseline gap-0.5 font-display text-lg font-extrabold tracking-tight text-paper">
                  CINE<span className="text-marquee">Q</span>
                  <span className="ml-0.5 text-[12px] font-semibold uppercase tracking-widest text-paper-faint">
                    tv
                  </span>
                </span>
              </div>

              {/* Collapsed-rail context */}
              <div className="grid h-16 w-16 place-items-center rounded-lg border border-ink-600/70 bg-ink-800">
                <Logo className="h-7 w-auto" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
