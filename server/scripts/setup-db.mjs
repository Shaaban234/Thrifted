// Runs lib/schema.sql against your Neon database.
// Usage: npm run db:setup   (loads server/.env.local via --env-file)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to server/.env.local");
  process.exit(1);
}

const sql = neon(url);
const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "../lib/schema.sql"), "utf8");

// Our schema uses only simple DDL statements (no function bodies), so splitting
// on ';' is safe.
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Running ${statements.length} statements against Neon…`);
for (const stmt of statements) {
  await sql(stmt); // neon HTTP driver: direct string call runs a raw query
}
console.log("✓ Schema created.");
