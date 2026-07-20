"use client";

import { useEffect } from "react";

// Reference-counted so multiple overlays (modal, drawer, maximized chat) can
// stack without one restoring scroll while another is still open. While any
// lock is active we also set `data-overlay-open` on <body>, which CSS uses to
// hide the floating chat launcher so it doesn't paint on top of a modal or the
// mobile navigation drawer.
let lockCount = 0;
let previousOverflow = "";

/** Locks `document.body` scrolling while `active` is true. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-overlay-open", "");
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.removeAttribute("data-overlay-open");
      }
    };
  }, [active]);
}
