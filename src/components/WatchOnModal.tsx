"use client";

import { useEffect, useId, useRef, useState } from "react";
import { STREAMING_SITES } from "@/lib/streaming-sites";
import { cn } from "@/lib/utils";

export function WatchOnButton({
  title,
  label = "Watch on…",
  className,
}: {
  title: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 rounded-pill bg-marquee px-6 py-3 font-display text-base font-bold text-ink-900 transition-colors hover:bg-marquee-hover focus-visible:ring-2"
        }
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        {label}
      </button>

      {open && (
        <WatchOnDialog
          title={title}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function WatchOnDialog({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const descId = useId();

  // Close on Escape and trap focus within the dialog.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = focusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden border border-ink-600 bg-ink-800 shadow-2xl",
          "rounded-t-panel sm:max-w-lg sm:rounded-panel",
          "animate-sheet-up sm:animate-scale-in",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-600 p-5">
          <div>
            <h2 id={headingId} className="font-display text-lg font-bold text-paper">
              Where to watch
            </h2>
            <p className="mt-0.5 text-sm text-paper-muted line-clamp-1">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-pill p-1.5 text-paper-muted transition-colors hover:bg-ink-700 hover:text-paper"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {STREAMING_SITES.map((site) => (
              <li key={site.id}>
                <a
                  href={site.buildUrl(title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-card border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-ink-600 hover:bg-ink-700"
                >
                  <span className="font-medium text-paper">{site.name}</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-paper-faint"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-ink-600 p-4">
          <p className="text-xs leading-relaxed text-paper-faint" id={descId}>
            These are independent third-party sites that open in a new tab.
            CineQueue doesn&rsquo;t host or endorse them, and can&rsquo;t guarantee a
            specific title is available.
          </p>
        </div>
      </div>
    </div>
  );
}
