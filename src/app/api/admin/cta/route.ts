import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.callToAction.findMany();
  return NextResponse.json({ ok: true, items });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const existing = await db.callToAction.findUnique({ where: { section: String(body.section) } });
  const data = {
    section: String(body.section),
    heading: String(body.heading ?? ""),
    description: String(body.description ?? ""),
    primaryBtn: String(body.primaryBtn ?? ""),
    primaryHref: String(body.primaryHref ?? ""),
    secondaryBtn: body.secondaryBtn ? String(body.secondaryBtn) : null,
    secondaryHref: body.secondaryHref ? String(body.secondaryHref) : null,
    visible: body.visible !== false,
  };
  let cta;
  if (existing) {
    cta = await db.callToAction.update({ where: { section: data.section }, data });
  } else {
    cta = await db.callToAction.create({ data });
  }
  await logActivity(auth.admin.id, "update", "CallToAction", cta.id, `Updated CTA ${cta.section}`);
  return NextResponse.json({ ok: true, item: cta });
}
