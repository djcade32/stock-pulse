import { NextResponse } from "next/server";
import { format } from "date-fns";
import { AITag, ReportRowDTO } from "@/types";
import { db } from "@/firebase/admin";
import { FieldPath, Timestamp } from "firebase-admin/firestore";

function s2overall(score: number): "Bullish" | "Neutral" | "Bearish" {
  if (score > 7) return "Bullish";
  if (score < 4) return "Bearish";
  return "Neutral";
}
function s2tag(s: number): "Positive" | "Negative" | "Neutral" {
  if (s > 7) return "Positive";
  if (s < 4) return "Negative";
  return "Neutral";
}

// ---- Cursor helpers (support createdAt: Timestamp | filingDate: string ISO) ----
type CursorPayload =
  | { field: "createdAt"; v: number; id: string } // v = millis
  | { field: "filingDate"; v: string; id: string }; // v = ISO string

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}
function decodeCursor(b64: string | null): CursorPayload | null {
  if (!b64) return null;
  try {
    const parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (
      parsed &&
      (parsed.field === "createdAt" || parsed.field === "filingDate") &&
      typeof parsed.id === "string"
    ) {
      if (parsed.field === "createdAt" && typeof parsed.v === "number") return parsed;
      if (parsed.field === "filingDate" && typeof parsed.v === "string") return parsed;
    }
  } catch {}
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") || 30);
  const limit = Math.max(1, Math.min(100, isNaN(limitParam) ? 30 : limitParam)); // cap 1..100
  const cursorParam = searchParams.get("cursor");
  const whereStock = searchParams.get("stock"); // optional exact ticker filter
  const whereYear = searchParams.get("year"); // optional
  const whereQuarter = searchParams.get("quarter"); // optional
  const hasQuarterRange = Boolean(whereQuarter && whereYear);

  const cursor = decodeCursor(cursorParam);

  // ---- Build base query with correct primary order field ----
  // If we filter by a quarter range, we must order by filingDate first.
  const primaryOrderField: "createdAt" | "filingDate" = hasQuarterRange
    ? "filingDate"
    : "createdAt";

  let q = db
    .collection("filingAnalyses")
    .orderBy(primaryOrderField, "desc")
    .orderBy(FieldPath.documentId(), "desc")
    .limit(limit);

  if (whereStock) {
    q = q.where("ticker", "==", whereStock.toUpperCase());
  }

  if (hasQuarterRange) {
    q = q.where("quarter", "==", `${whereQuarter} ${whereYear}`);
  }

  // ---- Apply cursor matching the sort fields ----
  if (cursor) {
    if (cursor.field !== primaryOrderField) {
      // Cursor built for a different sort mode; ignore to avoid Firestore mismatch
      // (Client can simply not mix cursors between different filters.)
    } else {
      if (primaryOrderField === "createdAt") {
        q = q.startAfter(Timestamp.fromMillis(cursor.v as number), cursor.id);
      } else {
        q = q.startAfter(cursor.v as string, cursor.id);
      }
    }
  }

  const snap = await q.get();

  // ---- Map to DTO ----
  const rows: ReportRowDTO[] = await Promise.all(
    snap.docs.map(async (d) => {
      const a = d.data() as any;

      const eSnap = await db.doc(`filingEvents/${d.id}`).get();
      const e = eSnap.exists ? (eSnap.data() as any) : undefined;
      const ticker = (a?.ticker ?? e?.ticker ?? "—").toUpperCase();

      const name = a.name || ticker;

      const filingDate = a?.filingDate || e?.filingDate || new Date().toISOString();
      const [year, month, day] = filingDate.split("-");
      const jsDate = new Date(Number(year), Number(month) - 1, Number(day));
      const date = format(jsDate, "MMM d, yyyy");
      const quarter =
        a?.form === "10-Q"
          ? `10-Q ${a?.quarter || Math.floor(new Date(filingDate).getMonth() / 3) + 1}`
          : a?.form === "10-K"
          ? `10-K ${new Date(filingDate).getFullYear()}`
          : a?.form || "—";

      const tldr = a?.summary?.tldr?.trim?.();
      const bullets = (a?.summary?.bullets ?? []).slice(0, 2).join(" • ");
      const insights = tldr || bullets || "No summary available.";

      const themes = a?.themes ?? [];

      const aiTags: AITag[] =
        themes.map((t: any) => ({
          topic: t.topic,
          sentiment: s2tag(t.sentiment),
        })) ?? [];

      const overallSentiment = a?.overallSentiment;

      const url = a?.provenance?.sourceUrl ?? e?.docUrl ?? "";
      const risks = a?.risks ?? [];
      const kpis = a?.kpis ?? [];
      const bulletSummary = a?.summary?.bullets ?? [];
      const risk_factors: string = a?.risk_factors ?? "";
      const management_tone: string = a?.management_tone ?? "";
      const revenue_performance: string = a?.revenue_performance ?? "";
      return {
        id: d.id,
        date,
        ticker,
        name,
        quarter,
        insights,
        aiTags,
        overallSentiment,
        url,
        risks,
        kpis,
        bulletSummary,
        risk_factors,
        management_tone,
        revenue_performance,
      } as ReportRowDTO;
    })
  );

  // ---- Build nextCursor from the last document using the same primary field ----
  const last = snap.docs[snap.docs.length - 1];
  let nextCursor: string | null = null;
  if (last) {
    if (primaryOrderField === "createdAt") {
      const ts: Timestamp | null = last.get("createdAt") ?? null;
      if (ts && ts.toMillis)
        nextCursor = encodeCursor({ field: "createdAt", v: ts.toMillis(), id: last.id });
    } else {
      const fd: string | null = last.get("filingDate") ?? null;
      if (fd) nextCursor = encodeCursor({ field: "filingDate", v: fd, id: last.id });
    }
  }

  return NextResponse.json({ rows, nextCursor, hasMore: !!nextCursor });
}
