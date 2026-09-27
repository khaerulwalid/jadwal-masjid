import { numeric, pgTable, smallint, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const appSettings = pgTable("app_settings", {
  id: smallint("id").primaryKey().default(1),
  defaultReplacementAmount: numeric("default_replacement_amount", { precision: 12, scale: 2 }).notNull().default("100000"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    idCheck: check("app_settings_id_check", sql`${table.id} = 1`),
    amountCheck: check("app_settings_amount_check", sql`${table.defaultReplacementAmount} > 0`),
  };
});
