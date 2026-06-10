import { NextResponse, type NextRequest } from "next/server";
import { listMemes, type MemeSort } from "@/lib/services/memes";

const PAGE_SIZE = 9;

/** Paginated meme feed backing the infinite scroll on /memes. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sortParam = params.get("sort");
  const sort: MemeSort =
    sortParam === "liked" || sortParam === "shared" ? sortParam : "latest";
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const { total, rows } = await listMemes({ sort, limit: PAGE_SIZE, offset });

  return NextResponse.json({
    memes: rows,
    nextOffset: offset + rows.length < total ? offset + rows.length : null,
    total,
  });
}
