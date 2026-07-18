"use client";

import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface DisclosureValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  panelId: string;
}

const DisclosureContext = createContext<DisclosureValue | null>(null);

function useDisclosure(): DisclosureValue {
  const ctx = useContext(DisclosureContext);
  if (!ctx) {
    throw new Error("Details components must be used within <DisclosureProvider>");
  }
  return ctx;
}

/** Wraps the hero action button and the collapsible panel so they share state. */
export function DisclosureProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <DisclosureContext.Provider value={{ open, setOpen, panelId }}>
      {children}
    </DisclosureContext.Provider>
  );
}

/** The "Details" button that lives next to "Watch on…" in the hero. */
export function DetailsToggleButton() {
  const { open, setOpen, panelId } = useDisclosure();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      // Reveal, then scroll the panel into view on the next frame.
      requestAnimationFrame(() => {
        document
          .getElementById(panelId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={panelId}
      className="inline-flex items-center justify-center gap-2 rounded-pill border border-ink-600 bg-ink-900/70 px-6 py-3 font-display text-base font-bold text-paper backdrop-blur-sm transition-colors hover:border-marquee/60 hover:text-marquee"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
      </svg>
      {open ? "Hide details" : "Details"}
    </button>
  );
}

/** The collapsible region holding all the in-depth movie details. */
export function DetailsPanel({ children }: { children: React.ReactNode }) {
  const { open, panelId } = useDisclosure();
  return (
    <div
      id={panelId}
      hidden={!open}
      className={cn("scroll-mt-20", !open && "hidden")}
    >
      {open && <div className="animate-fade-in">{children}</div>}
    </div>
  );
}
