import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const items = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    include: { Client: true },
  });
  return NextResponse.json({ ok: true, testimonials: items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.testimonial.create({
    data: {
      name: String(body.name || "Customer Name"),
      role: body.role ? String(body.role) : null,
      company: body.company ? String(body.company) : null,
      photo: body.photo ? String(body.photo) : null,
      rating: Math.min(5, Math.max(1, Number(body.rating || 5))),
      content: String(body.content || ""),
      clientId: body.clientId ? String(body.clientId) : null,
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "Testimonial", created.id, `Added testimonial from ${created.name}`);
  return NextResponse.json({ ok: true, testimonial: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.testimonial.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name) } : {}),
      ...(body.role !== undefined ? { role: body.role ? String(body.role) : null } : {}),
      ...(body.company !== undefined ? { company: body.company ? String(body.company) : null } : {}),
      ...(body.photo !== undefined ? { photo: body.photo ? String(body.photo) : null } : {}),
      ...(body.rating !== undefined ? { rating: Math.min(5, Math.max(1, Number(body.rating))) } : {}),
      ...(body.content !== undefined ? { content: String(body.content) } : {}),
      ...(body.clientId !== undefined ? { clientId: body.clientId ? String(body.clientId) : null } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "Testimonial", updated.id);
  return NextResponse.json({ ok: true, testimonial: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.testimonial.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "Testimonial", id);
  return NextResponse.json({ ok: true });
}
