import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from")!;
  const to = searchParams.get("to")!;

  const q = db
    .collection("macro_events")
    .where("date", ">=", from)
    .where("date", "<=", to)
    .orderBy("date", "asc");

  const snap = await q.get();
  const items = snap.docs.map((d) => d.data());
  return NextResponse.json({ items });
}
