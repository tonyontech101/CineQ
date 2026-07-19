import { NextRequest, NextResponse } from "next/server";
import { getTrendingMovies, getTrendingTv, getTrendingAll } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const timeWindow = (params.get("timeWindow") ?? "week") as "day" | "week";
  const mediaType = (params.get("mediaType") ?? "movie") as "movie" | "tv" | "all";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  try {
    let data;
    if (mediaType === "movie") {
      data = await getTrendingMovies(timeWindow, { page });
    } else if (mediaType === "tv") {
      data = await getTrendingTv(timeWindow, { page });
    } else {
      data = await getTrendingAll(timeWindow, { page });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trending data" },
      { status: 500 },
    );
  }
}
