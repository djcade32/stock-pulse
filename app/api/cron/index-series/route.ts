import { NextResponse } from "next/server";
import { ingestIndexSeries } from "@/lib/server/ingest/indexSeries";

export const runtime = "nodejs"; // important for firebase-admin
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await ingestIndexSeries();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("INGEST ERROR", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
