import { neon } from "@neondatabase/serverless";

// HTTP driver — ideal for short serverless queries. Tagged-template usage is
// parameterized (safe from SQL injection): sql`select * from users where id = ${id}`.
// A placeholder URL keeps `next build` working even when DATABASE_URL is unset;
// real queries only run at request time, where the real env var is present.
export const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://user:pass@localhost/db"
);
