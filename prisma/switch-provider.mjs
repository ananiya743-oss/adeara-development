// prisma/switch-provider.mjs
// Swaps the Prisma datasource provider between sqlite (dev) and postgresql (prod)
// based on the DATABASE_PROVIDER env var. Runs automatically as part of the build.
//
// On Vercel, set DATABASE_PROVIDER=postgresql and DATABASE_URL=postgres://...
// Locally, the schema stays on sqlite (default).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "schema.prisma");

const targetProvider = process.env.DATABASE_PROVIDER || "sqlite";
const current = readFileSync(schemaPath, "utf8");

// Find the current datasource provider line
const match = current.match(/datasource db \{[\s\S]*?provider = "(\w+)"/);
if (!match) {
  console.error("[prisma] could not find datasource provider in schema.prisma");
  process.exit(1);
}
const currentProvider = match[1];

if (currentProvider === targetProvider) {
  console.log(`[prisma] provider already set to ${targetProvider} — no swap needed`);
  process.exit(0);
}

// Swap the provider
const updated = current.replace(
  /(datasource db \{[\s\S]*?provider = ")(\w+)(")/,
  `$1${targetProvider}$3`
);
writeFileSync(schemaPath, updated, "utf8");
console.log(`[prisma] swapped provider from ${currentProvider} to ${targetProvider}`);
