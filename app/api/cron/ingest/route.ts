import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { CACHE_TAGS } from "@/lib/services/base";

/**
 * Scheduled content ingestion. Vercel Cron (see vercel.json) calls this with
 * `Authorization: Bearer ${CRON_SECRET}`; any external scheduler can do the
 * same.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runIngestionPipeline();
    for (const tag of Object.values(CACHE_TAGS)) {
      revalidateTag(tag, "max");
    }
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
