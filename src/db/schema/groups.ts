import { boolean, integer, pgTable, timestamp, varchar, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  sequenceNo: integer("sequence_no").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    sequenceNoCheck: check("groups_sequence_no_check", sql`${table.sequenceNo} > 0`),
  };
});
