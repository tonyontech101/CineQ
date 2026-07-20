"use client";

/**
 * A call-to-action banner promoting the "Reel" AI assistant. Clicking the
 * button dispatches a window event that the global ChatWidget listens for.
 */
export function AskReelBanner() {
  const openChat = () => {
    window.dispatchEvent(new CustomEvent("cinequeue:open-chat"));
  };

  return (
    <section
      aria-label="Ask Reel"
      className="relative overflow-hidden rounded-panel border border-marquee/30 bg-gradient-to-br from-ink-800 via-ink-800 to-ink-900 p-6 sm:p-10"
    >
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-pill bg-marquee/20 blur-3xl"
      />

      <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-panel bg-marquee/15 text-marquee">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
              Not sure what to watch?
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-paper-muted">
              Tell Reel your mood, a favorite film, or a genre — and get instant,
              personalized movie and TV picks with a link to every title.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openChat}
          className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-marquee px-6 py-3 font-display text-base font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.25}>
            <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ask Reel
        </button>
      </div>
    </section>
  );
}
