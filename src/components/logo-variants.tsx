/**
 * CineQueue logo directions.
 *
 * All three are pure SVG, use the brand palette (cyan accent + cool off-white),
 * and are built from solid shapes / heavy strokes so they stay crisp at favicon
 * size and in the collapsed 64px sidebar rail. Each accepts a `className` for
 * sizing (e.g. `h-7 w-auto`).
 *
 * Pick one and it becomes the app-wide mark (`AppLogo` below re-exports it).
 */

type LogoProps = { className?: string };

/**
 * Direction A — "Play Disc".
 * The Q is a cyan disc with a play triangle (watch / queue up); a bold off-white
 * C opens toward it. Most product-meaningful and reads well tiny.
 */
export function LogoPlayDisc({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 58 44" className={className} role="img" aria-label="CineQueue">
      <path
        d="M25 12.5 A 12 12 0 1 0 25 31.5"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        className="stroke-paper"
      />
      <circle cx="37" cy="22" r="12" className="fill-marquee" />
      <path
        d="M44 29 L 51 37"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        className="stroke-marquee"
      />
      <path d="M33 15.5 L 33 28.5 L 44 22 Z" className="fill-ink-900" />
    </svg>
  );
}

/**
 * Direction B — "Interlock".
 * Two heavy rounded rings linked like chain-links, closest to the reference art.
 * Off-white C behind, cyan Q (with tail) in front.
 */
export function LogoInterlock({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 72 46" className={className} role="img" aria-label="CineQueue">
      {/* C */}
      <path
        d="M34 13.7 A 13 13 0 1 0 34 30.3"
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        className="stroke-paper"
      />
      {/* Q ring (drawn over the C so the two read as linked) */}
      <circle cx="44" cy="22" r="13" fill="none" strokeWidth={9} className="stroke-marquee" />
      {/* Q tail */}
      <path
        d="M53 31 L 61 39"
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        className="stroke-marquee"
      />
    </svg>
  );
}

/**
 * Direction C — "Film Reel".
 * The Q is a cyan film reel (center hub + sprocket holes) with a tail; the C
 * hugs its left. Leans hardest into the movie theme.
 */
export function LogoReel({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 60 44" className={className} role="img" aria-label="CineQueue">
      {/* C */}
      <path
        d="M25 11 A 12 12 0 1 0 25 33"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        className="stroke-paper"
      />
      {/* Reel body */}
      <circle cx="38" cy="22" r="13" className="fill-marquee" />
      {/* Tail */}
      <path
        d="M45 29 L 52 37"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        className="stroke-marquee"
      />
      {/* Hub + sprocket holes */}
      <circle cx="38" cy="22" r="3.2" className="fill-ink-900" />
      <circle cx="38" cy="14" r="2" className="fill-ink-900" />
      <circle cx="38" cy="30" r="2" className="fill-ink-900" />
      <circle cx="30" cy="22" r="2" className="fill-ink-900" />
      <circle cx="46" cy="22" r="2" className="fill-ink-900" />
    </svg>
  );
}

/**
 * The active app-wide mark. Change this one import to switch the whole app
 * (sidebar, mobile nav, etc.) to a different direction.
 */
export const AppLogo = LogoPlayDisc;
