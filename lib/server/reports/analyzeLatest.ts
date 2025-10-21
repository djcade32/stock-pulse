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
import { db } from "@/firebase/admin";
import { format } from "date-fns";

type FilingMeta = {
  form: "10-Q" | "10-K";
  filingDate: string;
  accessionNo: string;
  primaryDoc: string;
};

function inferQuarterLabel(iso: string): string {
  const d = new Date(iso);
  const q = Math.floor(d.getMonth() / 3) + 1; // quick proxy
  return `Q${q} ${d.getFullYear()}`;
}

export async function analyzeLatestReportForTicker(tickerInput: string) {
  const ticker = tickerInput.trim().toUpperCase();
  if (!ticker) throw new Error("ticker required");

  const cik10 = await getCikFromTicker(ticker);
  const filing: FilingMeta = await getLatest10Qor10K(cik10);

  // Stable event id by accession (early exit = no fetch, no OpenAI)
  const eventId = `${ticker}-${filing.accessionNo.replace(/-/g, "").slice(-10)}`;
  const existingRef = db.doc(`filingAnalyses/${eventId}`);
  const existing = await existingRef.get();
  const docUrl = buildFilingDocUrl(cik10, filing.accessionNo, filing.primaryDoc);

  if (existing.exists) {
    const dto = await toFeedRowDTO(eventId, ticker, docUrl, filing);
    return { eventId, ...dto, deduped: true };
  }

  // Fetch filing once, compute hash, hash-dedupe as a secondary guard
  const text = await fetchFilingText(docUrl);
  if (text.length < 5000) throw new Error("Filing too short/invalid");

  const contentHash = await sha256(text);
  const hashRef = db.doc(`analysisByHash/${contentHash}`); // Firestore Admin SDK
  const hashSnap = await hashRef.get(); // Firestore Admin SDK
  if (hashSnap.exists) {
    const { eventId: existingId } = hashSnap.data() as any;
    const dto = await toFeedRowDTO(existingId, ticker, docUrl, filing);
    return { eventId: existingId, ...dto, deduped: true };
  }

  // New analysis: write event → analyze → persist → backpointer
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
  await persistLatestEarningsDate(ticker, filing.filingDate);

  hashRef.set({ eventId, ticker, createdAt: new Date() });
  await upsertFilingEvent(eventId, { status: "analyzed" });

  const dto = await toFeedRowDTO(eventId, ticker, docUrl, filing);
  return { eventId, ...dto, deduped: false };
}

async function toFeedRowDTO(
  eventId: string,
  ticker: string,
  sourceUrl: string,
  filing: FilingMeta
) {
  const aSnapRef = db.doc(`filingAnalyses/${eventId}`);
  const aSnap = await aSnapRef.get();
  if (!aSnap.exists) throw new Error("Analysis missing");
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

  const date = format(new Date(filing.filingDate), "MMM d, yyyy");
  const quarter =
    filing.form === "10-Q"
      ? `10-Q ${inferQuarterLabel(filing.filingDate)}`
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
    sentimentScore: avg,
    revenue_performance,
    risk_factors,
    management_tone,
  };
}
