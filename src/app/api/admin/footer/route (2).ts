import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.footerLink.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.footerLink.create({
    data: {
      section: String(body.section || "company"),
      label: String(body.label || "New Link"),
      href: String(body.href || "/"),
      order: Number(body.order || 0),
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "FooterLink", created.id, `Added ${created.label}`);
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.footerLink.update({
    where: { id: body.id },
    data: {
      ...(body.section !== undefined ? { section: String(body.section) } : {}),
      ...(body.label !== undefined ? { label: String(body.label) } : {}),
      ...(body.href !== undefined ? { href: String(body.href) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "FooterLink", updated.id);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.footerLink.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "FooterLink", id);
  return NextResponse.json({ ok: true });
}
