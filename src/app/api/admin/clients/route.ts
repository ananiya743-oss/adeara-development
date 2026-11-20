import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { projects: { select: { id: true, title: true, status: true } } },
  });
  return NextResponse.json({ ok: true, clients });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const created = await db.client.create({
    data: {
      name: String(body.name || "New Client"),
      logo: body.logo ? String(body.logo) : null,
      description: body.description ? String(body.description) : null,
      website: body.website ? String(body.website) : null,
      visible: body.visible !== false,
    },
  });
  await logActivity(auth.admin.id, "create", "Client", created.id, `Created client ${created.name}`);
  return NextResponse.json({ ok: true, client: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.client.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name) } : {}),
      ...(body.logo !== undefined ? { logo: body.logo ? String(body.logo) : null } : {}),
      ...(body.description !== undefined ? { description: body.description ? String(body.description) : null } : {}),
      ...(body.website !== undefined ? { website: body.website ? String(body.website) : null } : {}),
      ...(body.visible !== undefined ? { visible: !!body.visible } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "Client", updated.id, `Updated ${updated.name}`);
  return NextResponse.json({ ok: true, client: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.client.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "Client", id);
  return NextResponse.json({ ok: true });
}
