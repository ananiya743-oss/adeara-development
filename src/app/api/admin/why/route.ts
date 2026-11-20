import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.whyChooseItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.whyChooseItem.create({
    data: {
      icon: String(body.icon || "CheckCircle"),
      title: String(body.title || "New Item"),
      description: String(body.description || ""),
      order: Number(body.order || 0),
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "WhyChooseItem", created.id);
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.whyChooseItem.update({
    where: { id: body.id },
    data: {
      ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "WhyChooseItem", updated.id);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.whyChooseItem.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "WhyChooseItem", id);
  return NextResponse.json({ ok: true });
}
