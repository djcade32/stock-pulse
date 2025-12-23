import { NextResponse } from "next/server";
import { ingestIndexSeries, pruneDbIndexSeries } from "@/lib/server/ingest/indexSeries";

export const runtime = "nodejs"; // important for firebase-admin
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pruneDbIndexSeries();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("INGEST ERROR", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
