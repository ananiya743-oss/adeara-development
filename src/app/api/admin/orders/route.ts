import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const service = searchParams.get("service");
  const q = searchParams.get("q");
  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (service && service !== "all") where.service = service;
  if (q) {
    where.OR = [
      { reference: { contains: q } },
      { fullName: { contains: q } },
      { email: { contains: q } },
      { businessName: { contains: q } },
    ];
  }
  const orders = await db.projectOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, orders });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.projectOrder.update({
    where: { id: body.id },
    data: {
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes ? String(body.adminNotes) : null } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "ProjectOrder", updated.id, `Order ${updated.reference} status: ${updated.status}`);
  return NextResponse.json({ ok: true, order: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.projectOrder.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "ProjectOrder", id);
  return NextResponse.json({ ok: true });
}
