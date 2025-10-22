// /app/api/account/delete/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { deleteAccount } from "@/lib/actions/auth.server.action";

export async function POST() {
  try {
    await deleteAccount();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[account.delete] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
