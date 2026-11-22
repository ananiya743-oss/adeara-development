import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.processStep.findMany({ orderBy: { step: "asc" } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.processStep.create({
    data: {
      step: Number(body.step || 1),
      icon: String(body.icon || "CheckCircle"),
      title: String(body.title || "New Step"),
      description: String(body.description || ""),
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "ProcessStep", created.id);
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.processStep.update({
    where: { id: body.id },
    data: {
      ...(body.step !== undefined ? { step: Number(body.step) } : {}),
      ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "ProcessStep", updated.id);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.processStep.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "ProcessStep", id);
  return NextResponse.json({ ok: true });
}
