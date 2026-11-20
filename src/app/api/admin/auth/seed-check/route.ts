import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public: check if any admin user exists. Used by /admin/setup to decide
 * whether to show the setup page or the login page.
 */
export async function GET() {
  const count = await db.adminUser.count();
  return NextResponse.json({ ok: true, hasAdmin: count > 0 });
}
