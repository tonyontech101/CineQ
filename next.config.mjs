/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow an isolated build output (used by the Playwright E2E harness) so a
  // test build/serve doesn't clobber a `next dev` server's shared .next cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
