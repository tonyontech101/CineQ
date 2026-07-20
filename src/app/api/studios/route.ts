import { NextRequest, NextResponse } from "next/server";
import { getStudios } from "@/lib/tmdb";

export async function GET(_request: NextRequest) {
  try {
    const studios = await getStudios();
    return NextResponse.json({ results: studios });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch studios" },
      { status: 500 },
    );
  }
}
