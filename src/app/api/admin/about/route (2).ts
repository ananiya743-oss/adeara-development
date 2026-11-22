import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const about = await db.aboutPreview.findFirst();
  return NextResponse.json({ ok: true, about });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const existing = await db.aboutPreview.findFirst();
  const data = {
    heading: String(body.heading ?? "Who We Are"),
    description: String(body.description ?? ""),
    buttonLabel: String(body.buttonLabel ?? "Learn More"),
    buttonHref: String(body.buttonHref ?? "/about"),
    image: body.image ? String(body.image) : null,
    visible: body.visible !== false,
  };
  let about;
  if (existing) {
    about = await db.aboutPreview.update({ where: { id: existing.id }, data });
  } else {
    about = await db.aboutPreview.create({ data });
  }
  await logActivity(auth.admin.id, "update", "AboutPreview", about.id);
  return NextResponse.json({ ok: true, about });
}
