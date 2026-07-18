"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * A lightweight YouTube facade: shows the trailer thumbnail and only loads the
 * (heavy) iframe after the user clicks play. Keeps the detail page fast.
 */
export function TrailerPlayer({
  youtubeKey,
  title,
}: {
  youtubeKey: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  const thumb = `https://i.ytimg.com/vi/${youtubeKey}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-panel border border-ink-600 bg-black">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0`}
          title={`${title} — trailer`}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play trailer for ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill bg-marquee text-ink-900 shadow-lg transition-transform group-hover:scale-110">
            <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
