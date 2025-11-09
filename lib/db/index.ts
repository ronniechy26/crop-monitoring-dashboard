import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your environment to use Better Auth.");
}

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
  drizzleDb?: ReturnType<typeof drizzle>;
};

const pool = globalForDb.pgPool ?? new Pool({ connectionString });

export const db = globalForDb.drizzleDb ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
  globalForDb.drizzleDb = db;
}
