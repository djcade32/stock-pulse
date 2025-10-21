import { NextResponse } from "next/server";
import { fetchFilingText } from "@/lib/server/vendors/edgar";
import { compareFilingsToJson } from "@/lib/server/analyzers/compareFilingsAI";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const urlA = body.urlA || searchParams.get("urlA");
  const urlB = body.urlB || searchParams.get("urlB");

  console.log("Comparing filings at URLs:", { urlA, urlB });

  if (!urlA || !urlB) {
    return NextResponse.json({ error: "Missing urlA or urlB" }, { status: 400 });
  }

  try {
    const [textA, textB] = await Promise.all([fetchFilingText(urlA), fetchFilingText(urlB)]);
    const analysis = await compareFilingsToJson(textA, textB);
    return NextResponse.json(analysis);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
