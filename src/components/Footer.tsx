export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-600 bg-ink-900">
      <div className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 text-sm text-paper-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-display font-bold text-paper">CineQueue</span>{" "}
            — a movie discovery demo.
          </p>
          <p className="max-w-xl text-xs leading-relaxed">
            Movie metadata provided by TMDB. CineQueue does not host any content.
            &ldquo;Watch on&rdquo; links open independent third-party sites in a new
            tab; we can&rsquo;t vouch for their availability, legality, or safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
