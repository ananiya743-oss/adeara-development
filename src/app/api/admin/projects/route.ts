import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const projects = await db.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: { Client: true },
  });
  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const slug = String(body.slug || slugify(body.title || "project")).toLowerCase();
  const created = await db.project.create({
    data: {
      title: String(body.title || "Untitled Project"),
      slug,
      description: String(body.description || ""),
      longDesc: body.longDesc ? String(body.longDesc) : null,
      image: body.image ? String(body.image) : null,
      gallery: body.gallery ? (typeof body.gallery === "string" ? body.gallery : JSON.stringify(body.gallery)) : null,
      clientName: body.clientName ? String(body.clientName) : null,
      clientId: body.clientId ? String(body.clientId) : null,
      category: body.category ? String(body.category) : null,
      technologies: body.technologies ? String(body.technologies) : null,
      completionDate: body.completionDate ? new Date(body.completionDate) : null,
      projectUrl: body.projectUrl ? String(body.projectUrl) : null,
      status: String(body.status || "draft"),
      featured: !!body.featured,
      order: Number(body.order || 0),
    },
  });
  await logActivity(auth.admin.id, "create", "Project", created.id, `Created project ${created.title}`);
  return NextResponse.json({ ok: true, project: created });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const updated = await db.project.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.slug !== undefined ? { slug: String(body.slug).toLowerCase() } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.longDesc !== undefined ? { longDesc: body.longDesc ? String(body.longDesc) : null } : {}),
      ...(body.image !== undefined ? { image: body.image ? String(body.image) : null } : {}),
      ...(body.gallery !== undefined ? { gallery: body.gallery ? (typeof body.gallery === "string" ? body.gallery : JSON.stringify(body.gallery)) : null } : {}),
      ...(body.clientName !== undefined ? { clientName: body.clientName ? String(body.clientName) : null } : {}),
      ...(body.clientId !== undefined ? { clientId: body.clientId ? String(body.clientId) : null } : {}),
      ...(body.category !== undefined ? { category: body.category ? String(body.category) : null } : {}),
      ...(body.technologies !== undefined ? { technologies: body.technologies ? String(body.technologies) : null } : {}),
      ...(body.completionDate !== undefined ? { completionDate: body.completionDate ? new Date(body.completionDate) : null } : {}),
      ...(body.projectUrl !== undefined ? { projectUrl: body.projectUrl ? String(body.projectUrl) : null } : {}),
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.featured !== undefined ? { featured: !!body.featured } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
    },
  });
  await logActivity(auth.admin.id, "update", "Project", updated.id, `Updated ${updated.title}`);
  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await db.project.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "Project", id);
  return NextResponse.json({ ok: true });
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
