import { customType, date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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
