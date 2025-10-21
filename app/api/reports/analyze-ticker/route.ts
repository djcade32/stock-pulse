import { NextResponse } from "next/server";
import {
  getCikFromTicker,
  getLatest10Qor10K,
  buildFilingDocUrl,
  fetchFilingText,
  fetchCompanyFacts,
} from "@/lib/server/vendors/edgar";
import { analyzeFilingToJson } from "@/lib/server/analyzers/reports";
import {
  upsertFilingEvent,
  saveFilingAnalysis,
  persistLatestEarningsDate,
} from "@/lib/server/persistReports";
import { sha256 } from "@/lib/server/crypto";
import { format } from "date-fns";
import { db } from "@/firebase/admin";
import { okTicker } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticker = okTicker(body.ticker);
    const name = (body.name || "").trim();
    console.log("Analyzing latest report for", name);

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
      name: name || ticker,
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
      name: name || ticker,
      form: filing.form,
      filingDate: filing.filingDate,
      provenance: {
        vendor: "sec-edgar",
        sourceUrl: docUrl,
        contentHash,
        retrievedAt: new Date().toISOString(),
      },
    });

    await persistLatestEarningsDate(ticker, filing.filingDate);

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
  const overallSentiment = a?.overallSentiment || "Neutral";
  const aiTags = themes.slice(0, 6).map((t: any) => ({
    topic: t.topic,
    sentiment: t.sentiment > 7 ? "Positive" : t.sentiment < 4 ? "Negative" : "Neutral",
  }));

  const name = a.name || ticker;

  const date = format(new Date(filing.filingDate), "MMM d, yyyy");
  const quarter =
    filing.form === "10-Q"
      ? `10-Q ${a?.quarter || inferQuarterLabel(filing.filingDate)}`
      : `10-K ${new Date(filing.filingDate).getFullYear()}`;
  const insights =
    a?.summary?.tldr ||
    (a?.summary?.bullets || []).slice(0, 2).join(" • ") ||
    "No summary available.";
  const revenue_performance = a?.revenue_performance || null;
  const risk_factors = a?.risk_factors || null;
  const management_tone = a?.management_tone || null;

  return {
    date,
    ticker,
    name,
    quarter,
    insights,
    aiTags,
    overallSentiment,
    sourceUrl,
    revenue_performance,
    risk_factors,
    management_tone,
  };
}
