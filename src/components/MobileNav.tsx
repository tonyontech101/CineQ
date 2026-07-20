"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
import { NAV_ITEMS } from "./Sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock page scroll + flag the overlay so the chat launcher hides behind it.
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
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
    const trigger = triggerRef.current;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-sidebar"
        aria-label="Open navigation menu"
        className="grid h-10 w-10 place-items-center rounded-card text-paper-muted transition-colors hover:bg-ink-800 hover:text-paper lg:hidden"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 isolate" role="presentation">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
            onClick={close}
            aria-hidden
          />

          <div
            ref={panelRef}
            id="mobile-nav-sidebar"
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className={cn(
              "relative z-10 flex h-full w-[280px] flex-col",
              "bg-ink-900 shadow-2xl shadow-black/70",
              "animate-slide-in-left",
            )}
          >
            {/* Top: Logo + Close */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <Link
                href="/"
                onClick={close}
                id={headingId}
                className="flex items-baseline gap-0.5 font-display text-lg font-extrabold tracking-tight text-paper"
              >
                CINE<span className="text-marquee">Q</span>
                <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-widest text-paper-faint">
                  tv
                </span>
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-paper-faint transition-colors hover:bg-ink-700 hover:text-paper"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
              {NAV_ITEMS.map((item) => {
                const active = item.isActive(pathname, searchParams);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-marquee-soft text-marquee"
                        : "text-paper-muted hover:bg-ink-800 hover:text-paper",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-marquee"
                      />
                    )}
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center transition-colors duration-200",
                        active
                          ? "text-marquee"
                          : "text-paper-faint group-hover:text-paper-muted",
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom */}
            <div className="border-t border-ink-600/70 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-paper-faint">
                  CineQueue
                </span>
                <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-paper-faint">
                  v0.1.0
                </span>
              </div>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
