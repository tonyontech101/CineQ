// Small presentation helpers shared across components.

/** Join class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Map a 0–10 rating to a semantic color token key. */
export function ratingTone(rating: number): "high" | "mid" | "low" {
  if (rating >= 7.5) return "high";
  if (rating >= 6) return "mid";
  return "low";
}

/** "128" -> "2h 8m" */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Truncate to a max length on a word boundary, adding an ellipsis. */
export function truncate(text: string, max = 150): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/** Map an ISO 639-1 language code (e.g. "en") to a display name ("English"). */
export function languageName(code: string | null): string | null {
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    return dn.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
