"use client";

/**
 * A call-to-action banner promoting the "Reel" AI assistant. Clicking the
 * primary button opens the global ChatWidget; clicking an example prompt opens
 * the widget and sends that prompt immediately.
 */

const EXAMPLE_PROMPTS = [
  "Something like Inception",
  "Cozy feel-good comedies",
  "A thriller for tonight",
  "Best sci-fi series",
];

function openChat(prompt?: string) {
  window.dispatchEvent(
    new CustomEvent("cinequeue:open-chat", { detail: prompt ? { prompt } : {} }),
  );
}

export function AskReelBanner() {
  return (
    <section
      aria-label="Ask Reel"
      className="relative overflow-hidden rounded-panel border border-ink-600 bg-ink-800"
    >
      {/* Ambient accent glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-marquee/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-marquee/10 blur-3xl"
      />
      {/* Hairline top accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marquee/60 to-transparent"
      />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar with status */}
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-panel bg-marquee/15 text-marquee ring-1 ring-marquee/25">
              <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeLinecap="round" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rating-high/70" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-rating-high ring-2 ring-ink-800" />
              </span>
            </span>

            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-pill bg-marquee/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-marquee ring-1 ring-marquee/20">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" strokeLinejoin="round" />
                </svg>
                AI Assistant
              </div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
                Not sure what to watch? Ask{" "}
                <span className="text-accent-gradient">Reel</span>.
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-paper-muted">
                Describe a mood, a favorite film, or a genre and get instant,
                personalized movie &amp; TV picks — each with a link to the title.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openChat()}
            className="group inline-flex shrink-0 items-center gap-2 rounded-pill bg-marquee px-6 py-3 font-display text-base font-bold text-ink-900 shadow-[0_8px_24px_-8px_rgba(95,198,228,0.6)] transition-all hover:bg-marquee-hover hover:shadow-[0_10px_28px_-8px_rgba(95,198,228,0.8)]"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.25}>
              <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Start chatting
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap items-center gap-2 border-t border-ink-600/70 pt-5">
          <span className="mr-1 text-xs font-medium text-paper-faint">Try:</span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => openChat(prompt)}
              className="inline-flex items-center gap-1.5 rounded-pill border border-ink-600 bg-ink-900/50 px-3 py-1.5 text-xs font-medium text-paper-muted transition-colors hover:border-marquee/50 hover:bg-marquee/5 hover:text-marquee"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 text-marquee" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
