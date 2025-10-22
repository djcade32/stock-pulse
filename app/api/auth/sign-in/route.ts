// /app/api/auth/sign-in/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { signIn } from "@/lib/actions/auth.server.action";

export async function POST(req: Request) {
  const { idToken } = await req.json();
  await signIn({ idToken });
  return NextResponse.json({ success: true });
}
