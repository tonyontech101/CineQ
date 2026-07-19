import type { Metadata } from "next";
import { TrendingTabs } from "@/components/TrendingTabs";

export const metadata: Metadata = {
  title: "Trending",
  description: "See what's trending today and this week across movies and TV.",
};

export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-shell px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      <section className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
          Trending
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-paper-muted">
          Discover what everyone&rsquo;s watching right now, updated daily and weekly.
        </p>
      </section>

      <TrendingTabs />
    </div>
  );
}
