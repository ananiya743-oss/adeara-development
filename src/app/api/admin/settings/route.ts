import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";
import { setSettings } from "@/lib/site-config";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const rows = await db.siteSetting.findMany({ orderBy: { category: "asc" } });
  return NextResponse.json({ ok: true, settings: rows });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  let body: { items: { key: string; value: string; category: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ ok: false, error: "items must be an array" }, { status: 400 });
  }
  await setSettings(body.items, auth.admin.id);
  await logActivity(auth.admin.id, "update", "SiteSetting", undefined, `Updated ${body.items.length} settings`);
  return NextResponse.json({ ok: true, message: "Settings saved." });
}
