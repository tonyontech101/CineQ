import Image from "next/image";
import type { CastMember } from "@/lib/types";

export function CastGrid({ cast }: { cast: CastMember[] }) {
  if (!cast.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {cast.map((person) => (
        <li
          key={person.id}
          className="flex flex-col overflow-hidden rounded-card border border-ink-600 bg-ink-800"
        >
          <div className="relative aspect-[3/4] w-full bg-ink-700">
            {person.profileUrl ? (
              <Image
                src={person.profileUrl}
                alt={person.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-ink-700 to-ink-800">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-paper-faint"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 p-2.5">
            <span className="truncate text-sm font-semibold text-paper" title={person.name}>
              {person.name}
            </span>
            <span className="truncate text-xs text-paper-muted" title={person.character}>
              {person.character}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
