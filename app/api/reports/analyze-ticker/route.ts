import { NextResponse } from "next/server";
import {
  getCikFromTicker,
  getLatest10Qor10K,
  buildFilingDocUrl,
  fetchFilingText,
  fetchCompanyFacts,
} from "@/lib/server/vendors/edgar";
import { analyzeFilingToJson } from "@/lib/server/analyzers/reports";
import { upsertFilingEvent, saveFilingAnalysis } from "@/lib/server/persistReports";
import { sha256 } from "@/lib/server/crypto";
import { format } from "date-fns";
import { db } from "@/firebase/admin";

function okTicker(s?: string) {
  return (s || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z.]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticker = okTicker(body.ticker);
    if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

    const cik10 = await getCikFromTicker(ticker);
    const filing = await getLatest10Qor10K(cik10);
    const docUrl = buildFilingDocUrl(cik10, filing.accessionNo, filing.primaryDoc);
    const text = await fetchFilingText(docUrl);
    if (text.length < 5000)
      return NextResponse.json({ error: "Filing too short/invalid" }, { status: 422 });

    const contentHash = await sha256(text);
    const eventId = `${ticker}-${filing.accessionNo.replace(/-/g, "").slice(-10)}`;

    // dedupe by hash
    const hashRef = db.doc(`analysisByHash/${contentHash}`);
    const hashSnap = await hashRef.get();
    if (hashSnap.exists) {
      const { eventId: existingId } = hashSnap.data() as any;
      const dto = await toFeedRowDTO(existingId, ticker, docUrl, filing);
      return NextResponse.json({ eventId: existingId, ...dto, deduped: true });
    }

    // write event
    await upsertFilingEvent(eventId, {
      ticker,
      form: filing.form,
      filingDate: filing.filingDate,
      docUrl,
      status: "ingesting",
    });

    const facts = await fetchCompanyFacts(cik10).catch(() => null);
    const formLabel =
      filing.form === "10-Q"
        ? `${filing.form} ${inferQuarterLabel(filing.filingDate)}`
        : `${filing.form} ${new Date(filing.filingDate).getFullYear()}`;

    const analysis = await analyzeFilingToJson({ ticker, formLabel, text, facts });

    await saveFilingAnalysis(eventId, {
      ...analysis,
      ticker,
      form: filing.form,
      filingDate: filing.filingDate,
      provenance: {
        vendor: "sec-edgar",
        sourceUrl: docUrl,
        contentHash,
        retrievedAt: new Date().toISOString(),
      },
    });

    hashRef.set({ eventId, ticker, createdAt: new Date() });

    await upsertFilingEvent(eventId, { status: "analyzed" });

    const dto = await toFeedRowDTO(eventId, ticker, docUrl, filing);
    return NextResponse.json({ eventId, ...dto, deduped: false });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

function inferQuarterLabel(iso: string): string {
  const d = new Date(iso);
  const q = Math.floor(d.getMonth() / 3) + 1; // rough proxy by filing date
  return `Q${q} ${d.getFullYear()}`;
}

async function toFeedRowDTO(
  eventId: string,
  ticker: string,
  sourceUrl: string,
  filing: { form: string; filingDate: string }
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
    topic: t.topic,
    sentiment: t.sentiment > 0.15 ? "Positive" : t.sentiment < -0.15 ? "Negative" : "Neutral",
  }));

  const companySnapRef = db.doc(`companies/${ticker}`);
  const companySnap = await companySnapRef.get();
  const name = companySnap.exists ? (companySnap.data() as any).name : ticker;

  const date = format(new Date(filing.filingDate), "MMM d, yyyy");
  const quarter =
    filing.form === "10-Q"
      ? `10-Q ${inferQuarterLabel(filing.filingDate)}`
      : `10-K ${new Date(filing.filingDate).getFullYear()}`;
  const insights =
    a?.summary?.tldr ||
    (a?.summary?.bullets || []).slice(0, 2).join(" • ") ||
    "No summary available.";

  return { date, ticker, name, quarter, insights, aiTags, overallSentiment, sourceUrl };
}
