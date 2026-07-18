import { NextRequest, NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const sort = (params.get("sort") ?? "popularity.desc") as
    | "popularity.desc"
    | "vote_average.desc"
    | "release_date.desc";

  const genreIds = params
    .get("genreIds")
    ?.split(",")
    .map(Number)
    .filter((n) => n > 0);

  try {
    const data = await discoverMovies({
      page,
      sort,
      genreIds: genreIds?.length ? genreIds : undefined,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}
