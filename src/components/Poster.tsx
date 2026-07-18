import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders a movie poster with next/image, or a branded placeholder when no
 * poster URL is available (e.g. running on bundled mock data).
 */
export function Poster({
  src,
  alt,
  title,
  priority = false,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  /** Shown inside the placeholder when there is no image. */
  title: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-ink-700 to-ink-800 p-4 text-center",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-8 w-8 text-marquee/60"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
      </svg>
      <span className="font-display text-sm font-semibold leading-tight text-paper-muted line-clamp-3">
        {title}
      </span>
    </div>
  );
}
