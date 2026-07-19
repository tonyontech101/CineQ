import { NextRequest, NextResponse } from "next/server";
import { discoverTv } from "@/lib/tmdb";

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

  const yearRaw = Number.parseInt(params.get("year") ?? "", 10);
  const year =
    Number.isInteger(yearRaw) && yearRaw >= 1900 && yearRaw <= 2100 ? yearRaw : undefined;

  const countryRaw = params.get("country") ?? "";
  const country = /^[A-Za-z]{2}$/.test(countryRaw) ? countryRaw.toUpperCase() : undefined;

  try {
    const data = await discoverTv({
      page,
      sort,
      genreIds: genreIds?.length ? genreIds : undefined,
      year,
      country,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch TV shows" },
      { status: 500 },
    );
  }
}
