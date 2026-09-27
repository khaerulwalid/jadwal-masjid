import { boolean, index, pgTable, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const residents = pgTable("residents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    nameIdx: index("residents_name_idx").on(table.name),
    isActiveIdx: index("residents_is_active_idx").on(table.isActive),
  };
});
