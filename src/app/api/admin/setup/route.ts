import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

/**
 * POST /api/admin/setup — only callable when no admin exists yet.
 * Creates the initial admin user from a protected setup process.
 */
export async function POST(req: NextRequest) {
  const exists = await db.adminUser.count();
  if (exists > 0) {
    return NextResponse.json({ ok: false, error: "Setup already completed." }, { status: 409 });
  }
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const admin = await db.adminUser.create({
      data: { name, email: email.toLowerCase().trim(), passwordHash, role: "admin" },
    });
    await db.activityLog.create({ data: { action: "setup", entity: "AdminUser", entityId: admin.id, detail: "Initial admin created" } });
    return NextResponse.json({ ok: true, message: "Admin account created. Please sign in." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "Failed to create admin account." }, { status: 500 });
  }
}
