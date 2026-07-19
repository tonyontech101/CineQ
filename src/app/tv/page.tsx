import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "TV show browsing is coming soon to CineQueue.",
};

export default function TvShowsPage() {
  return (
    <div className="mx-auto flex max-w-shell flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-panel border border-ink-600 bg-ink-800 text-marquee">
        <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path d="M4 5h16v11H4zM9 20h6M12 16v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h1 className="font-display text-2xl font-bold text-paper">
        TV Shows are coming soon
      </h1>
      <p className="max-w-md text-sm text-paper-muted">
        We&rsquo;re working on bringing series, seasons, and episodes to CineQueue.
        In the meantime, browse our movie catalog.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-pill bg-marquee px-5 py-2.5 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
      >
        Browse movies
      </Link>
    </div>
  );
}
