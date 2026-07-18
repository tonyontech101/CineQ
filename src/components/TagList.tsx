import Link from "next/link";
import type { Genre } from "@/lib/types";

export function TagList({ genres }: { genres: Genre[] }) {
  if (!genres.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Genres">
      {genres.map((genre) => (
        <li key={genre.id}>
          <Link
            href={`/?genres=${genre.id}`}
            className="inline-block rounded-pill border border-ink-600 px-3 py-1 text-xs font-medium text-paper-muted transition-colors hover:border-marquee/50 hover:text-marquee"
          >
            {genre.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
