import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-shell flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-marquee">404</p>
      <h1 className="font-display text-2xl font-bold text-paper">
        We couldn&rsquo;t find that page
      </h1>
      <p className="max-w-md text-sm text-paper-muted">
        The movie you&rsquo;re looking for may have been removed, or the link is
        incorrect.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-pill bg-marquee px-5 py-2.5 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
      >
        Back to browse
      </Link>
    </div>
  );
}
