import { customType, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Custom Drizzle type for working with PostGIS geometries.
const geometry = customType<{ data: string }>({
  dataType() {
    return "geometry(MultiPolygon, 4326)";
  },
});

export const cropGeometries = pgTable("crop_geometries", {
  id: serial("id").primaryKey(),
  dn: text("dn").notNull(),
  geom: geometry("geom").notNull(),
  captureDate: date("capture_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const ingestionLogs = pgTable("crop_ingestion_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  fileName: text("file_name"),
  captureDate: date("capture_date").notNull(),
  totalFeatures: integer("total_features").notNull(),
  insertedFeatures: integer("inserted_features").notNull(),
  skippedFeatures: integer("skipped_features").notNull(),
  crops: text("crops").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
