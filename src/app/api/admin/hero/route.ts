import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const hero = await db.heroSection.findFirst();
  return NextResponse.json({ ok: true, hero });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const existing = await db.heroSection.findFirst();
  const data = {
    heading: String(body.heading ?? ""),
    description: String(body.description ?? ""),
    primaryBtn: String(body.primaryBtn ?? ""),
    primaryHref: String(body.primaryHref ?? ""),
    secondaryBtn: String(body.secondaryBtn ?? ""),
    secondaryHref: String(body.secondaryHref ?? ""),
    bgImage: body.bgImage ? String(body.bgImage) : null,
    bgVideo: body.bgVideo ? String(body.bgVideo) : null,
    textAlign: String(body.textAlign ?? "left"),
    animation: String(body.animation ?? "fade-up"),
    visible: body.visible !== false,
  };
  let hero;
  if (existing) {
    hero = await db.heroSection.update({ where: { id: existing.id }, data });
  } else {
    hero = await db.heroSection.create({ data });
  }
  await logActivity(auth.admin.id, "update", "HeroSection", hero.id);
  return NextResponse.json({ ok: true, hero });
}
