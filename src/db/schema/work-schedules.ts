import { date, pgTable, text, timestamp, varchar, uuid, check, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const workSchedules = pgTable("work_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  workDate: date("work_date", { mode: "string" }).notNull(),
  title: varchar("title", { length: 150 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  createdBy: uuid("created_by").references(() => users.id),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    statusCheck: check("work_schedules_status_check", sql`${table.status} IN ('scheduled', 'completed', 'cancelled')`),
    uniqueActiveDate: uniqueIndex("work_schedules_active_date_idx").on(table.workDate).where(sql`${table.status} != 'cancelled'`),
  };
});
