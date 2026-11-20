import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const body = await req.json();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "Current and new passwords are required." }, { status: 400 });
  }
  if (String(newPassword).length < 8) {
    return NextResponse.json({ ok: false, error: "New password must be at least 8 characters." }, { status: 400 });
  }
  const valid = await bcrypt.compare(currentPassword, auth.admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.adminUser.update({ where: { id: auth.admin.id }, data: { passwordHash } });
  await logActivity(auth.admin.id, "update", "AdminUser", auth.admin.id, "Changed password");
  return NextResponse.json({ ok: true, message: "Password updated." });
}
