import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.navItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.navItem.create({
    data: {
      label: String(body.label || "New Link"),
      href: String(body.href || "/"),
      order: Number(body.order || 0),
      isButton: !!body.isButton,
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "NavItem", created.id, `Added nav link ${created.label}`);
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.navItem.update({
    where: { id: body.id },
    data: {
      ...(body.label !== undefined ? { label: String(body.label) } : {}),
      ...(body.href !== undefined ? { href: String(body.href) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
      ...(body.isButton !== undefined ? { isButton: !!body.isButton } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "NavItem", updated.id, `Updated ${updated.label}`);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.navItem.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "NavItem", id);
  return NextResponse.json({ ok: true });
}
