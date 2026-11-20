import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 50);
  const logs = await db.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { AdminUser: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ ok: true, logs });
}
