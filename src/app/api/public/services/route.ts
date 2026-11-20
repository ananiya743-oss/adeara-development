import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const services = await db.service.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ ok: true, services });
}
