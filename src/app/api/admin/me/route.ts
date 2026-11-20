import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-utils";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  return NextResponse.json({ ok: true, user: { id: auth.admin.id, email: auth.admin.email, name: auth.admin.name, role: auth.admin.role } });
}
