import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/debug — returns diagnostic info about the database connection.
 * Safe to call publicly — only reveals env var NAMES (not values) and DB connection status.
 *
 * Use this to debug "This page couldn't load" errors on Vercel.
 */
export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_starts_with_postgres: process.env.DATABASE_URL?.startsWith("postgres://") || process.env.DATABASE_URL?.startsWith("postgresql://"),
      DATABASE_URL_starts_with_file: process.env.DATABASE_URL?.startsWith("file:"),
      DATABASE_PROVIDER_set: !!process.env.DATABASE_PROVIDER,
      DATABASE_PROVIDER_value: process.env.DATABASE_PROVIDER || "(not set)",
      NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_set: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_URL_value: process.env.NEXTAUTH_URL || "(not set)",
      BLOB_READ_WRITE_TOKEN_set: !!process.env.BLOB_READ_WRITE_TOKEN,
      SEED_ADMIN_EMAIL_set: !!process.env.SEED_ADMIN_EMAIL,
      SEED_ADMIN_PASSWORD_set: !!process.env.SEED_ADMIN_PASSWORD,
    },
    tests: {} as any,
  };

  // Try a simple DB query to see if connection works
  try {
    const count = await db.navItem.count();
    debug.tests.databaseConnection = { ok: true, navItemCount: count };
  } catch (e: any) {
    debug.tests.databaseConnection = { ok: false, error: e.message, code: e.code };
  }

  // Try to see if specific tables exist
  try {
    await db.siteSetting.count();
    debug.tests.siteSettingTable = "exists";
  } catch (e: any) {
    debug.tests.siteSettingTable = `error: ${e.message}`;
  }

  try {
    await db.adminUser.count();
    debug.tests.adminUserTable = "exists";
  } catch (e: any) {
    debug.tests.adminUserTable = `error: ${e.message}`;
  }

  // Diagnosis
  const diagnosis: string[] = [];
  if (!debug.env.DATABASE_URL_set) {
    diagnosis.push("DATABASE_URL env var is NOT set. Add it in Vercel → Settings → Environment Variables.");
  } else if (debug.env.DATABASE_URL_starts_with_file) {
    diagnosis.push("DATABASE_URL is set to a SQLite file:// path, but DATABASE_PROVIDER must be 'postgresql' for Vercel. Set DATABASE_PROVIDER=postgresql and use a postgres:// connection string.");
  } else if (!debug.env.DATABASE_URL_starts_with_postgres) {
    diagnosis.push("DATABASE_URL doesn't start with postgres:// or postgresql://. Make sure you copied the actual connection string from Vercel → Storage → your Postgres database, not the variable name POSTGRES_PRISMA_URL.");
  }

  if (debug.env.DATABASE_PROVIDER_value !== "postgresql") {
    diagnosis.push(`DATABASE_PROVIDER is set to '${debug.env.DATABASE_PROVIDER_value}', but it must be 'postgresql' (lowercase) for Vercel.`);
  }

  if (!debug.env.NEXTAUTH_SECRET_set) {
    diagnosis.push("NEXTAUTH_SECRET env var is NOT set. Generate one with `openssl rand -base64 32` and add it.");
  }

  if (!debug.env.NEXTAUTH_URL_set) {
    diagnosis.push("NEXTAUTH_URL env var is NOT set. Set it to your Vercel URL like https://adeara-development-41zb.vercel.app");
  }

  if (debug.tests.databaseConnection?.ok && debug.tests.databaseConnection.navItemCount === 0) {
    diagnosis.push("Database is connected but has no data. Visit /setup to seed the default content.");
  }

  if (debug.tests.databaseConnection?.ok && debug.tests.databaseConnection.navItemCount > 0) {
    diagnosis.push("Database is connected and has data. The site should work — try clearing your browser cache or visiting in incognito mode.");
  }

  if (diagnosis.length === 0 && !debug.tests.databaseConnection?.ok) {
    diagnosis.push("Database connection failed for an unknown reason. See the error above.");
  }

  debug.diagnosis = diagnosis;

  return NextResponse.json(debug, { status: 200 });
}
