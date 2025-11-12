import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Create it in your .env file before running Drizzle commands.");
}

export default defineConfig({
  schema: ["./lib/db/schema.ts", "./auth-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  tablesFilter: ["crop_geometries"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
