import { NextResponse } from "next/server";
import { getPublicSiteData } from "@/lib/site-config";

export async function GET() {
  const data = await getPublicSiteData();
  return NextResponse.json({ ok: true, data });
}
