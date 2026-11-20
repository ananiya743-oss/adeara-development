import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const projects = await db.project.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: { Client: true },
  });
  return NextResponse.json({ ok: true, projects });
}
