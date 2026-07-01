// Creates (or promotes) an admin user in the Neon database.
// Usage: npm run create-admin -- <email> <password> [username]
// Password is hashed with the same scrypt scheme as server/lib/auth.ts.
import { neon } from "@neondatabase/serverless";
import { scryptSync, randomBytes } from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to server/.env.local");
  process.exit(1);
}
const sql = neon(url);

const [, , emailArg, passwordArg, usernameArg] = process.argv;
const email = emailArg ?? "shabanabdullah0@gmail.com";
const password = passwordArg ?? "123456789012";
const username = usernameArg ?? "admin";

const hashPassword = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

const passwordHash = hashPassword(password);
const avatar = "https://i.pravatar.cc/200?u=" + encodeURIComponent(email);

// Idempotent: if the email already exists, just reset its password and flip is_admin.
const rows = await sql`
  insert into users (email, password_hash, username, avatar_url, bio, is_admin)
  values (${email}, ${passwordHash}, ${username}, ${avatar}, ${"Admin"}, ${true})
  on conflict (email) do update
    set password_hash = excluded.password_hash,
        is_admin = true
  returning id, email, username, is_admin`;

console.log("✓ Admin ready:", rows[0]);
