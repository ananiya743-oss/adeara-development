import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/admin-utils";
import { db } from "@/lib/db";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";

/**
 * Media upload handler.
 *
 * - In production (Vercel): uploads to Vercel Blob storage (requires BLOB_READ_WRITE_TOKEN env var).
 * - In development: saves to /public/uploads/ on the local filesystem.
 *
 * Both modes record the resulting URL in the MediaAsset table.
 */

function isVercelBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const media = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, media });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });

  const name = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
  const mime = file.type || "application/octet-stream";
  const buf = Buffer.from(await file.arrayBuffer());
  const ts = Date.now();
  const safeName = `${ts}-${name}`;

  // Optimize images regardless of where we store them
  let finalBuf = buf;
  let finalMime = mime;
  if (mime.startsWith("image/")) {
    try {
      finalBuf = await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      finalMime = "image/jpeg";
    } catch (e) {
      console.error("[media] sharp conversion failed:", e);
    }
  }

  const type = mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : "document";

  let url: string;
  let blobPathname: string | undefined;

  if (isVercelBlobConfigured()) {
    // === Vercel Blob storage ===
    try {
      const blob = await put(`adeara/${safeName}`, finalBuf, {
        access: "public",
        contentType: finalMime,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      url = blob.url;
      console.log("[media] uploaded to Vercel Blob:", url);
    } catch (e: any) {
      console.error("[media] Vercel Blob upload failed:", e);
      return NextResponse.json({ ok: false, error: "Failed to upload to Blob storage. Check BLOB_READ_WRITE_TOKEN." }, { status: 500 });
    }
  } else {
    // === Local filesystem (development) ===
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, safeName), finalBuf);
    url = `/uploads/${safeName}`;
    console.log("[media] saved locally:", url);
  }

  const created = await db.mediaAsset.create({
    data: {
      name: file.name,
      url,
      type,
      mime: finalMime,
      size: finalBuf.length,
      alt: file.name,
    },
  });
  await logActivity(auth.admin.id, "create", "MediaAsset", created.id, `Uploaded ${created.name}`);
  return NextResponse.json({ ok: true, asset: created });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  // Delete from storage
  if (asset.url.startsWith("http") && isVercelBlobConfigured()) {
    // Vercel Blob — use the URL directly (Vercel Blob SDK can delete by URL when token is set)
    try {
      const { del } = await import("@vercel/blob");
      await del(asset.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (e) {
      console.error("[media] Vercel Blob delete failed:", e);
    }
  } else if (asset.url.startsWith("/uploads/")) {
    // Local filesystem
    try {
      const fs = await import("fs/promises");
      await fs.unlink(join(process.cwd(), "public", asset.url));
    } catch (e) {
      // file may not exist; ignore
    }
  }

  await db.mediaAsset.delete({ where: { id } });
  await logActivity(auth.admin.id, "delete", "MediaAsset", id);
  return NextResponse.json({ ok: true });
}
