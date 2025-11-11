import { NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAuth } from "firebase-admin/auth";
import { generateUserWhisper } from "@/lib/server/market-whisper/generate";
import { getUserWhisper, putUserWhisper } from "@/lib/server/market-whisper/store";

dayjs.extend(utc);
dayjs.extend(timezone);

export const runtime = "nodejs";
const TZ = "America/New_York";

// Utility to get current date in NY timezone (YYYY-MM-DD)
const todayNY = () => dayjs().tz(TZ).format("YYYY-MM-DD");

export async function POST(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  const refresh = req.headers.get("x-refresh") === "true"; // custom header to force refresh
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { uid } = await getAuth().verifyIdToken(token);
  const today = todayNY();

  const existing = await getUserWhisper(uid, today);
  if (existing && !refresh) {
    return NextResponse.json({
      summary: existing.summary,
      sentiment: existing.sentiment,
      generatedAt: existing.generatedAt,
      date: existing.date,
      cached: true,
    });
  }

  const doc = await generateUserWhisper(uid);

  await putUserWhisper(uid, doc);

  return NextResponse.json({
    summary: doc.summary,
    sentiment: doc.sentiment,
    generatedAt: doc.generatedAt,
    date: doc.date,
    cached: false,
  });
}

// export async function POST(req: Request) {
//   const authz = req.headers.get("authorization") || "";
//   const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
//   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { uid } = await getAuth().verifyIdToken(token);
//   const doc = await generateUserWhisper(uid);
//   await putUserWhisper(uid, doc);

//   return NextResponse.json({
//     summary: doc.summary,
//     sentiment: doc.sentiment,
//     generatedAt: doc.generatedAt,
//     date: doc.date,
//     cached: false,
//     refreshed: true,
//   });
// }
