import { boolean, pgTable, smallint, timestamp, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { groups } from "./groups";

export const rotationState = pgTable("rotation_state", {
  id: smallint("id").primaryKey().default(1),
  nextGroupId: uuid("next_group_id").references(() => groups.id),
  isPaused: boolean("is_paused").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    idCheck: check("rotation_state_id_check", sql`${table.id} = 1`),
  };
});
