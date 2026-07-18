// Config-driven list of external streaming destinations.
//
// IMPORTANT: These are third-party sites we do not control. Reliable per-movie
// deep-linking is not possible across all of them, so each entry builds the best
// available URL: a search URL when the site exposes a predictable search path,
// otherwise the homepage. All outbound navigation must use
// rel="noopener noreferrer" and target="_blank".

export interface StreamingSite {
  /** Stable id used as a React key. */
  id: string;
  /** Human-friendly label. */
  name: string;
  /** Homepage origin (no trailing slash). */
  homepage: string;
  /**
   * Builds the destination URL for a given movie title. Falls back to the
   * homepage when the site has no predictable search endpoint.
   */
  buildUrl: (title: string) => string;
}

/** Sites that support a `?q=` / `?s=` style search on a known path. */
function searchQuery(origin: string, path: string, param: string) {
  return (title: string) =>
    `${origin}${path}?${param}=${encodeURIComponent(title)}`;
}

/** Sites without a known search endpoint: just open the homepage. */
function homepageOnly(origin: string) {
  return () => origin;
}

export const STREAMING_SITES: StreamingSite[] = [
  { id: "streamex", name: "Streamex", homepage: "https://streamex.sh", buildUrl: homepageOnly("https://streamex.sh") },
  { id: "moviebox", name: "MovieBox", homepage: "https://moviebox.ph", buildUrl: homepageOnly("https://moviebox.ph") },
  { id: "123moviesfree", name: "123MoviesFree", homepage: "https://ww8.123moviesfree.net", buildUrl: searchQuery("https://ww8.123moviesfree.net", "/search/", "q") },
  { id: "1shows", name: "1Shows", homepage: "https://www.1shows.org", buildUrl: homepageOnly("https://www.1shows.org") },
  { id: "1flex", name: "1Flex", homepage: "https://www.1flex.org", buildUrl: homepageOnly("https://www.1flex.org") },
  { id: "1tube", name: "1Tube", homepage: "https://www.1tube.org", buildUrl: homepageOnly("https://www.1tube.org") },
  { id: "shuttletv", name: "ShuttleTV", homepage: "https://shuttletv.su", buildUrl: homepageOnly("https://shuttletv.su") },
  { id: "meowtv", name: "MeowTV", homepage: "https://meowtv.ru", buildUrl: homepageOnly("https://meowtv.ru") },
  { id: "rivestream", name: "RiveStream", homepage: "https://rivestream.ru", buildUrl: homepageOnly("https://rivestream.ru") },
  { id: "cinemabz", name: "Cinema.bz", homepage: "https://cinema.bz", buildUrl: homepageOnly("https://cinema.bz") },
  { id: "filmcave", name: "FilmCave", homepage: "https://filmcave.ru", buildUrl: homepageOnly("https://filmcave.ru") },
  { id: "popcornmovies", name: "Popcorn Movies", homepage: "https://popcornmovies.io", buildUrl: homepageOnly("https://popcornmovies.io") },
  { id: "cineby", name: "Cineby", homepage: "https://www.cineby.at", buildUrl: homepageOnly("https://www.cineby.at") },
  { id: "nepu", name: "Nepu", homepage: "https://nepu.to", buildUrl: homepageOnly("https://nepu.to") },
  { id: "netplayz", name: "Netplayz", homepage: "https://netplayz.top", buildUrl: homepageOnly("https://netplayz.top") },
  { id: "cinemacity", name: "Cinema City", homepage: "https://cinemacity.cc", buildUrl: homepageOnly("https://cinemacity.cc") },
  { id: "hdtodayz", name: "HDToday", homepage: "https://hdtodayz.net", buildUrl: homepageOnly("https://hdtodayz.net") },
  { id: "watchott", name: "WatchOTT", homepage: "https://watchott.ru", buildUrl: homepageOnly("https://watchott.ru") },
  { id: "flixway", name: "Flixway", homepage: "https://flixway.ru", buildUrl: homepageOnly("https://flixway.ru") },
  { id: "streamingunity", name: "StreamingUnity", homepage: "https://streamingunity.dog", buildUrl: homepageOnly("https://streamingunity.dog") },
];
