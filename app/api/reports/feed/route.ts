import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ReportRowDTO } from "@/types";
import { db } from "@/firebase/admin";

function s2overall(score: number): "Bullish" | "Neutral" | "Bearish" {
  if (score > 0.15) return "Bullish";
  if (score < -0.15) return "Bearish";
  return "Neutral";
}
function s2tag(s: number): "Positive" | "Negative" | "Neutral" {
  if (s > 0.15) return "Positive";
  if (s < -0.15) return "Negative";
  return "Neutral";
}

export async function GET() {
  const snap = await db.collection("filingAnalyses").orderBy("createdAt", "desc").limit(30).get();

  const rows: ReportRowDTO[] = await Promise.all(
    snap.docs.map(async (d) => {
      const a = d.data() as any;
      const eSnapRef = db.doc(`filingEvents/${d.id}`);
      const eSnap = await eSnapRef.get();
      const e = eSnap.exists ? (eSnap.data() as any) : undefined;

      const ticker = a?.ticker ?? e?.ticker ?? "—";
      const url = a?.docUrl ?? e?.docUrl ?? "";
      const companySnapRef = db.doc(`companies/${ticker}`);
      const companySnap = await companySnapRef.get();
      const name = companySnap.exists ? (companySnap.data() as any).name : ticker;

      const filingDate = a?.filingDate || e?.filingDate || new Date().toISOString();
      const date = format(new Date(filingDate), "MMM d, yyyy");

      const quarter =
        a?.form === "10-Q"
          ? `10-Q ${new Date(filingDate).getFullYear()}`
          : a?.form === "10-K"
          ? `10-K ${new Date(filingDate).getFullYear()}`
          : a?.form || "—";

      const tldr = a.summary?.tldr?.trim();
      const bullets = (a.summary?.bullets ?? []).slice(0, 2).join(" • ");
      const insights = tldr || bullets || "No summary available.";

      const themes = a.themes ?? [];
      const aiTags = themes
        .slice(0, 6)
        .map((t: any) => ({ tag: t.topic, sentiment: s2tag(t.sentiment) }));
      const avg = themes.length
        ? themes.reduce((acc: number, t: any) => acc + (t.sentiment ?? 0), 0) / themes.length
        : 0;
      const overallSentiment = s2overall(avg);

      return { date, ticker, name, quarter, insights, aiTags, overallSentiment, url };
    })
  );

  return NextResponse.json(rows);
}
