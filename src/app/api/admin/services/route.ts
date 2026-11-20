import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ ok: true, services });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const slug = String(body.slug || slugify(body.title || "service")).toLowerCase();
  const created = await db.service.create({
    data: {
      slug,
      title: String(body.title || "New Service"),
      shortDesc: String(body.shortDesc || ""),
      description: String(body.description || ""),
      icon: String(body.icon || "Sparkles"),
      image: body.image ? String(body.image) : null,
      features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
      benefits: JSON.stringify(Array.isArray(body.benefits) ? body.benefits : []),
      price: body.price ? String(body.price) : null,
      visible: body.visible !== false,
      order: Number(body.order || 0),
    },
  });
  await logActivity(auth.admin.id, "create", "Service", created.id, `Created service ${created.title}`);
  return NextResponse.json({ ok: true, service: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.service.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.slug !== undefined ? { slug: String(body.slug).toLowerCase() } : {}),
      ...(body.shortDesc !== undefined ? { shortDesc: String(body.shortDesc) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
      ...(body.image !== undefined ? { image: body.image ? String(body.image) : null } : {}),
      ...(body.features !== undefined ? { features: JSON.stringify(Array.isArray(body.features) ? body.features : []) } : {}),
      ...(body.benefits !== undefined ? { benefits: JSON.stringify(Array.isArray(body.benefits) ? body.benefits : []) } : {}),
      ...(body.price !== undefined ? { price: body.price ? String(body.price) : null } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "Service", updated.id, `Updated ${updated.title}`);
  return NextResponse.json({ ok: true, service: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.service.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "Service", id);
  return NextResponse.json({ ok: true });
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
