// /app/api/auth/add-user-if-not-exists/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/firebase/admin";
import { ensureUserDoc } from "@/lib/server/ensureUserDoc";

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ message: "idToken required" }, { status: 400 });
  }

  const decoded = await auth.verifyIdToken(idToken);
  await ensureUserDoc(decoded.uid, {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    firebase: decoded.firebase as any,
  });

  return NextResponse.json({ ok: true });
}
