import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  const admin = await db.adminUser.findUnique({
    where: { email: (session.user as any).email as string },
  });
  if (!admin) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return { ok: true as const, admin, session };
}

export async function logActivity(adminId: string, action: string, entity: string, entityId?: string, detail?: string) {
  try {
    await db.activityLog.create({
      data: { action, entity, entityId, detail, adminId },
    });
  } catch (e) {
    console.error("[activity] log failed:", e);
  }
}
