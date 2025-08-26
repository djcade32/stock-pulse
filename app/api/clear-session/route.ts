import { deleteSessionCookie } from "@/lib/actions/auth.server.action";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  console.log("Clearing session and redirecting to sign-in page...");

  const cookieStore = await cookies();
  if (cookieStore.get("session")) {
    await deleteSessionCookie();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}
