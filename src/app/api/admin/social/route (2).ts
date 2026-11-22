import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.socialLink.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const platform = String(body.platform || "New Platform");
  const existing = await db.socialLink.findUnique({ where: { platform } });
  if (existing) return NextResponse.json({ ok: false, error: "Platform already exists" }, { status: 400 });
  const created = await db.socialLink.create({
    data: {
      platform,
      url: String(body.url || "#"),
      icon: String(body.icon || "Link"),
      order: Number(body.order || 0),
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "SocialLink", created.id, `Added ${created.platform}`);
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.socialLink.update({
    where: { id: body.id },
    data: {
      ...(body.platform !== undefined ? { platform: String(body.platform) } : {}),
      ...(body.url !== undefined ? { url: String(body.url) } : {}),
      ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "SocialLink", updated.id, `Updated ${updated.platform}`);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.socialLink.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "SocialLink", id);
  return NextResponse.json({ ok: true });
}
