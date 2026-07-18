"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console / monitoring in a real deployment.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-shell flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-5xl font-extrabold text-rating-low">Oops</p>
      <h1 className="font-display text-2xl font-bold text-paper">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-paper-muted">
        We hit a snag loading movies. This can happen if the movie data service is
        temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-pill bg-marquee px-5 py-2.5 font-display text-sm font-bold text-ink-900 transition-colors hover:bg-marquee-hover"
      >
        Try again
      </button>
    </div>
  );
}
