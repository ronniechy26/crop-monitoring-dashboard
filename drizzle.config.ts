import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Create it in your .env file before running Drizzle commands.");
}

const schemaPaths = ["./lib/db/schema.ts"];
const tablesFilter = ["crop_geometries", "crop_ingestion_logs"];

if (process.env.DRIZZLE_INCLUDE_AUTH === "true") {
  schemaPaths.push("./auth-schema.ts");
  tablesFilter.push("user", "session", "account", "verification");
}

export default defineConfig({
  schema: schemaPaths,
  out: "./drizzle",
  dialect: "postgresql",
  tablesFilter,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
