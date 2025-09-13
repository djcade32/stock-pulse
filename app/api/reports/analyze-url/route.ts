import { NextResponse } from "next/server";
import { analyzeFilingToJson } from "@/lib/server/analyzers/reports";
import { upsertFilingEvent, saveFilingAnalysis } from "@/lib/server/persistReports";
import { sha256 } from "@/lib/server/crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fetchFilingText } from "@/lib/server/vendors/edgar";
import { format } from "date-fns";

function okTicker(s?: string) {
  return (s || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z.]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl: string | undefined = body.url;
    const ticker = okTicker(body.ticker);
    const formLabel: string | undefined = body.formLabel; // "10-Q Q2 2025" or "10-K 2024"

    if (!rawUrl || !ticker)
      return NextResponse.json({ error: "url and ticker required" }, { status: 400 });
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }

    if (!/sec\.gov$/i.test(url.hostname)) {
      return NextResponse.json(
        { error: "Only SEC filings allowed for now (sec.gov)" },
        { status: 400 }
      );
    }

    const text = await fetchFilingText(url.toString());
    if (text.length < 5000)
      return NextResponse.json({ error: "Filing too short/invalid" }, { status: 422 });

    const contentHash = await sha256(text);
    // const hashRef = doc(db, "analysisByHash", contentHash);
    const hashRef = db.doc(`analysisByHash/${contentHash}`);
    const hashSnap = await hashRef.get();
    if (hashSnap.exists) {
      const { eventId } = hashSnap.data() as any;
      const dto = await toFeedRowDTO(eventId, ticker, url.toString(), formLabel);
      return NextResponse.json({ eventId, ...dto, deduped: true });
    }

    const eventId = `${ticker}-${contentHash.slice(0, 10)}`;
    await upsertFilingEvent(eventId, {
      ticker,
      form: formLabel || "10-Q/10-K",
      filingDate: new Date().toISOString(),
      docUrl: url.toString(),
      status: "ingesting",
    });

    const analysis = await analyzeFilingToJson({
      ticker,
      formLabel: formLabel || "10-Q/10-K",
      text,
    });
    await saveFilingAnalysis(eventId, {
      ...analysis,
      ticker,
      form: formLabel || "10-Q/10-K",
      filingDate: new Date().toISOString(),
      provenance: {
        vendor: "sec-edgar",
        sourceUrl: url.toString(),
        contentHash,
        retrievedAt: new Date().toISOString(),
      },
    });

    hashRef.set({ eventId, ticker, createdAt: new Date() });
    await upsertFilingEvent(eventId, { status: "analyzed" });

    const dto = await toFeedRowDTO(eventId, ticker, url.toString(), formLabel);
    return NextResponse.json({ eventId, ...dto, deduped: false });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

import { db } from "@/firebase/admin";
import { hash } from "crypto";
async function toFeedRowDTO(
  eventId: string,
  ticker: string,
  sourceUrl: string,
  formLabel?: string
) {
  const aSnapRef = db.doc(`filingAnalyses/${eventId}`);
  const aSnap = await aSnapRef.get();
  const a = aSnap.data() as any;

  const themes = a?.themes ?? [];
  const avg = themes.length
    ? themes.reduce((s: number, t: any) => s + (t.sentiment ?? 0), 0) / themes.length
    : 0;
  const overallSentiment = avg > 0.15 ? "Bullish" : avg < -0.15 ? "Bearish" : "Neutral";
  const aiTags = themes.slice(0, 6).map((t: any) => ({
    tag: t.topic,
    sentiment: t.sentiment > 0.15 ? "Positive" : t.sentiment < -0.15 ? "Negative" : "Neutral",
  }));

  const companySnapRef = db.doc(`companies/${ticker}`);
  const companySnap = await companySnapRef.get();
  const name = companySnap.exists ? (companySnap.data() as any).name : ticker;

  const date = format(new Date(), "MMM d, yyyy");
  const quarter = formLabel || "10-Q/10-K";
  const insights =
    a?.summary?.tldr ||
    (a?.summary?.bullets || []).slice(0, 2).join(" • ") ||
    "No summary available.";

  return { date, ticker, name, quarter, insights, aiTags, overallSentiment, sourceUrl };
}
