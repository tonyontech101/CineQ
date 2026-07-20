import { NextRequest, NextResponse } from "next/server";
import { discoverMoviesByStudio, getStudioByCompanyId } from "@/lib/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const companyId = Number.parseInt(params.id, 10);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ error: "Invalid studio ID" }, { status: 400 });
  }

  const urlParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(urlParams.get("page") ?? "1", 10));
  const sort = (urlParams.get("sort") ?? "popularity.desc") as
    | "popularity.desc"
    | "vote_average.desc"
    | "release_date.desc";

  try {
    const [studio, movies] = await Promise.all([
      getStudioByCompanyId(companyId),
      discoverMoviesByStudio({ companyId, page, sort }),
    ]);

    if (!studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 });
    }

    return NextResponse.json({ studio, movies });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch studio data" },
      { status: 500 },
    );
  }
}
